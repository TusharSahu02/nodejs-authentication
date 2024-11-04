const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authType === "local";
      },
      minlength: 8,
    },
    authType: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: String,
    refreshTokens: [
      {
        token: String,
        expiresAt: Date,
      },
    ],
    failedLoginAttempts: {
      count: { type: Number, default: 0 },
      lastFailedAttempt: Date,
    },
    accountLocked: {
      type: Boolean,
      default: false,
    },
    lastPasswordChange: Date,
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaSecret: String,
  },
  { timestamps: true }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});
