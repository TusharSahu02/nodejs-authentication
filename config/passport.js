import { User } from "../models/user.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { logger } from "../utils/logger.js";
import config from "../utils/config.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: `${config.BASE_URL}/api/v1/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            email: profile.emails[0].value,
            googleId: profile.id,
            authType: "google",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    // User.findById(id, (err, user) => {
    done(null, user);
    // });
  } catch (error) {
    done(error, null);
  }
});
