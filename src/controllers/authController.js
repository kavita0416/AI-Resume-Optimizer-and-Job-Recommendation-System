import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({ name, email, password: hashedPassword });

    // remove password before sending response
    const { password: _, ...userWithoutPassword } = user.toObject();

    res
      .status(201)
      .json({ message: "User registered successfully", user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // remove password before sending response
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
