// const express = require("express");
import express from "express";
import passport from "passport";

// const router = express.Router();
import { login, register, logout } from "../controllers/auth-controller.js";
// const { loginLimiter } = securityMiddleware(app);
import {
  validateLoginInput,
  validateEmailInput,
  validateRegistrationInput,
} from "../middleware/validator.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

// Local Authentication Routes
// router.post("/login", loginLimiter, validateLoginInput, login);
router.post("/login", validateLoginInput, login);
router.post("/register", validateRegistrationInput, register);
router.post("/logout", authenticateJWT, logout);

// OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

export default router;
