import rateLimit from "express-rate-limit";
import helmet from "helmet";

export const securityMiddleware = (app) => {
  // Rate limiting
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: "Too many login attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Security headers
  app.use(helmet());
  app.use(helmet.contentSecurityPolicy());
  app.use(helmet.crossOriginEmbedderPolicy());

  // CORS configuration
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGINS);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  });

  return { loginLimiter };
};
