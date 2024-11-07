import jwt from "jsonwebtoken";

export const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, config.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};
