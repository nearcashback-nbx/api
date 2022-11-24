import config from "./config";

import verifyConfig from "./config/verify";

verifyConfig();

import "./db";
import express, { NextFunction, Request, Response } from "express";
import { body, header, validationResult } from "express-validator";
import cors from "cors";
import "./auth";
import passport from "passport";
import { UserService } from "./models/user/service";
import { UserEntity } from "./models/user/entity";
import { JsonUserEntity } from "./models/user/json.entity";
import AppDataSource from "./db";
import { ReceiptService } from "./models/receipt/service";
import Multer from "multer";
import { uploadFileToBucket } from "./utils/file";
import { extname } from "path";
import { addTaskToQueue } from "./utils/queue";
import { ReceiptStatus } from "./models/receipt/types";
import { exposeUserIdFromAccessToken, generateAccessToken } from "./utils/jwt";

const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<unknown> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  try {
    const userId = exposeUserIdFromAccessToken(token);

    const user = await UserService.findUserById(userId);

    if (user === null) throw new Error(`No user`);

    req.user = user;
  } catch {
    return res.sendStatus(401);
  }

  next();
};

const validateIncomingRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<unknown> => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array({ onlyFirstError: true })[0];

    return res.status(400).end(firstError.msg);
  }

  next();
};

const app = express();

app.use(cors());
app.use(express.json());

app.get(
  "/auth/google",
  passport.authenticate("google", {
    session: false,
    scope: ["email", "profile"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  async (req: Request, res: Response) => {
    const user = req.user as UserEntity;

    if (!user) return res.status(401).end();

    const accessToken = generateAccessToken(user);

    const url = new URL(config.OAUTH_REDIRECT_DOMAIN);

    url.pathname = `/auth/${accessToken}`;

    const stringUrl = url.toString();

    return res.location(stringUrl).status(303).end();
  }
);

app.get("/user/me", validateToken, validateIncomingRequest, (req, res) => {
  const entity = req.user as UserEntity;

  const json = new JsonUserEntity(entity);

  return res.status(200).send(json);
});

app.post(
  "/receipt",
  validateToken,
  body("data").notEmpty().withMessage(`'data' is missing`),
  body("data").isString().withMessage(`'data' must be a string`),
  body("data").custom((value) => {
    const parts = value.split(";");

    if (parts.length !== 12) throw new Error(`'data' has invalid structure`);

    return true;
  }),
  validateIncomingRequest,
  async (req, res) => {
    console.log("body", req.body);

    const user = req.user as UserEntity;

    const data = req.body.data as string;

    let receiptId;

    try {
      await AppDataSource.manager.transaction(
        async (transactionalEntityManager) => {
          const receipt = await ReceiptService.insertReceiptByDataInTransaction(
            transactionalEntityManager,
            data,
            user
          );

          receiptId = receipt.id;

          const amount = receipt.cashbackAmountYoctoNear.toString();

          console.log(
            `increasing pending amount for user '${user.id}' by ${amount} yoctoNear`
          );

          await UserService.incrementPendingBalanceInTransaction(
            transactionalEntityManager,
            user,
            amount
          );

          await addTaskToQueue(
            "verify_receipt",
            {
              receipt_id: receipt.id,
            },
            5 * 60 // 5 mins
          );
        }
      );
    } catch (err: any) {
      // unique constraint
      if (err.code === "23505") {
        return res.sendStatus(400);
      } else {
        console.error(`Failed to process receipt - ${err.toString()}`);

        return res.sendStatus(500);
      }
    }

    return res.status(200).json({
      id: receiptId,
    });
  }
);

const upload = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // no larger than 10mb
  },
  fileFilter: function (_, file, callback) {
    var ext = extname(file.originalname).toLowerCase();

    const allowedExtensions = [".png", ".jpg", ".jpeg", ".heic"];

    if (!allowedExtensions.includes(ext))
      return callback(new Error(`Only images are allowed`));

    callback(null, true);
  },
}).single("file");

app.post(
  "/receipt/capture",
  validateToken,
  (req, res, next) => {
    upload(req, res, (err) => {
      if (!err) return next();

      return res.status(500).json(err.message);
    });
  },
  body("receipt_id")
    .notEmpty()
    .isUUID()
    .withMessage(`'receipt_id' must be valid UUID`),
  validateIncomingRequest,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json("No file uploaded.");
    }

    const receipt = await ReceiptService.findReceiptById(req.body.receipt_id);

    if (receipt === null) return res.status(404).json("No receipt found");

    if (receipt.capture_url)
      return res.status(404).json("Capture is already stored");

    try {
      const url = await uploadFileToBucket(
        req.file,
        "nearcashback_receipts",
        receipt.id
      );

      await ReceiptService.setCaptureUrlForReceipt(receipt, url);
    } catch (err) {
      console.error(`Failed upload receipt capture due to - ${err}`);

      return res.status(500).json("Internal server exception");
    }

    res.status(200).json({});
  }
);

app.post(
  "/queue/verify_receipt",
  header("x-queue-auth")
    .equals(config.QUEUE.SECRET)
    .withMessage(`Queue authentication failed`),
  body("receipt_id")
    .notEmpty()
    .withMessage(`'receipt_id' is required`)
    .isUUID()
    .withMessage(`'receipt_id' must be valid UUID`),
  validateIncomingRequest,
  async (req, res) => {
    const receipt = await ReceiptService.findReceiptById(req.body.receipt_id);

    if (receipt === null) return res.status(404).send("No receipt found");

    if (receipt.status === ReceiptStatus.VERIFIED)
      return res.status(400).send(`Receipt is already verified`);

    const user = await receipt.owner;

    try {
      await AppDataSource.manager.transaction(
        async (transactionalEntityManager) => {
          await ReceiptService.verifyReceiptInTransaction(
            transactionalEntityManager,
            receipt
          );

          await UserService.decrementPendingBalanceInTransaction(
            transactionalEntityManager,
            user,
            receipt.cashbackAmountYoctoNear.toString()
          );

          await UserService.incrementAvailableBalanceInTransaction(
            transactionalEntityManager,
            user,
            receipt.cashbackAmountYoctoNear.toString()
          );
        }
      );
    } catch (err: any) {
      console.error(`Failed to verify receipt - ${err.message}`);

      return res.sendStatus(500);
    }

    res.sendStatus(200);
  }
);

(async () => {
  // const nearConfig = getNearConfig(config.NETWORK);

  // console.debug(`[near.network]`, nearConfig.networkId);

  // const near = await naj.connect(nearConfig);

  // const account = new naj.Account(near.connection, config.CONTRACT_ID);

  app.listen(config.PORT, () => {
    console.log(`App listening on port ${config.PORT}`);
  });
})();
