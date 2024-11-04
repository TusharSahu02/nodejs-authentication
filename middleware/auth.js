
const jwt = require("jsonwebtoken");
const User = require("../models/user");
// const rateLimit = require("express-rate-limit");
// const helmet = require("helmet");

// const securityMiddleware = (app) => {
//   // Rate limiting
//   const loginLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 5, // 5 attempts
//     message: "Too many login attempts, please try again later",
//   });

//   // Security headers
//   app.use(helmet());
//   app.use(helmet.contentSecurityPolicy());
//   app.use(helmet.crossOriginEmbedderPolicy());

//   // CORS configuration
//   app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGINS);
//     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//     res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//     next();
//   });

//   return { loginLimiter };
// };

const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { authenticateJWT };
