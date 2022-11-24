import { Storage } from "@google-cloud/storage";
import { extname } from "path";
import { Readable } from "stream";
import config from "../config";

const storage = new Storage({
  credentials: {
    client_email: config.GOOGLE_SERVICE_ACCOUNT.EMAIL,
    private_key: config.GOOGLE_SERVICE_ACCOUNT.PRIVATE_KEY,
  },
});

export const uploadFileToBucket = async (
  file: Express.Multer.File,
  bucketName: string,
  fileName: string
): Promise<string> => {
  const bucket = storage.bucket(bucketName);

  const extension = extname(file.originalname);

  const name = fileName + extension;

  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(name);

  const stream = Readable.from(file.buffer);

  return new Promise((resolve, reject) => {
    stream
      .pipe(blob.createWriteStream())
      .on("error", reject)
      .on("finish", () => resolve(blob.publicUrl()));
  });
};
