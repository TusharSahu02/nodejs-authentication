const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!email.includes("@")) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  next();
};

const validateRegistrationInput = (req, res, next) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!email.includes("@")) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  if (name.length < 2) {
    return res
      .status(400)
      .json({ message: "Name must be at least 2 characters" });
  }

  next();
};

const validateEmailInput = (req, res, next) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  next();
};

export { validateLoginInput, validateRegistrationInput, validateEmailInput };
