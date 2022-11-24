import { UserEntity } from "../models/user/entity";
import jwt from "jsonwebtoken";
import config from "../config";

export const generateAccessToken = (user: UserEntity): string => {
  const token = jwt.sign(
    {
      id: user.id,
    },
    config.JWT.SECRET,
    {
      expiresIn: config.JWT.EXPIRATION,
    }
  );

  return token;
};

export const exposeUserIdFromAccessToken = (token: string): string => {
  try {
    const decoded = jwt.verify(token, config.JWT.SECRET);

    // @ts-ignore
    const userId = decoded.id as string;

    return userId;
  } catch (err) {
    console.error(`Failed to decode token - ${err}`);
    
    throw new Error(`Failed to decode token`);
  }
};
