const express = require("express");
const {
  login,
  register,
  logout,
  requestPasswordReset,
} = require("../controllers/auth-controller");
const { loginLimiter } = require("../middleware/rateLimiter");
const {
  validateLoginInput,
  validateEmailInput,
  validateRegistrationInput,
} = require("../middleware/validator");
const passport = require("passport");
const { authenticateJWT } = require("../middleware/auth");

const router = express.Router();

// Local Authentication Routes
router.post("/login", loginLimiter, validateLoginInput, login);
router.post("/register", validateRegistrationInput, register);
router.post("/logout", authenticateJWT, logout);

// Password Management
router.post("/forgot-password", validateEmailInput, requestPasswordReset);
router.post("/reset-password/:token", validatePasswordInput, resetPassword);
router.post(
  "/change-password",
  authenticateJWT,
  validatePasswordInput,
  changePassword
);

// Token Management
router.post("/refresh-token", refreshAccessToken);
router.post("/revoke-token", authenticateJWT, revokeRefreshToken);

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
    session: false,
  }),
  handleOAuthSuccess
);

// User Management
router.get("/me", authenticateJWT, getCurrentUser);
router.post("/mfa/enable", authenticateJWT, enableMFA);
router.post("/mfa/verify", authenticateJWT, verifyMFA);
router.post("/mfa/disable", authenticateJWT, disableMFA);

// Session Management
router.get("/sessions", authenticateJWT, getActiveSessions);
router.delete("/sessions/:sessionId", authenticateJWT, terminateSession);
router.delete("/sessions", authenticateJWT, terminateAllSessions);

module.exports = router;
