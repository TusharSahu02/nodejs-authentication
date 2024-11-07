import express from "express";
import passport from "passport";
import "../config/passport.js";

import { login, register, logout } from "../controllers/auth-controller.js";
import {
  validateLoginInput,
  validateRegistrationInput,
} from "../middleware/validator.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", validateRegistrationInput, register);
router.post("/login", validateLoginInput, login);
router.post("/logout", authenticateJWT, logout);

// OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    res.redirect("/"); // Redirect to homepage after successful authentication
  }
);

export default router;
