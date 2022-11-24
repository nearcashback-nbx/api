import config from "./config";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth2";
import { GoogleUserProvider } from "./models/user/providers";
import { UserService } from "./models/user/service";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE.CLIENT_ID,
      clientSecret: config.GOOGLE.CLIENT_SECRET,
      callbackURL: config.GOOGLE.CALLBACK_URL,
    },
    async (_: string, __: string, profile: any, done: VerifyCallback) => {
      const account = profile._json;

      const provider = new GoogleUserProvider(account);

      const user = await UserService.findOrCreateUserByProvider(provider);

      return done(null, user);
    }
  )
);
