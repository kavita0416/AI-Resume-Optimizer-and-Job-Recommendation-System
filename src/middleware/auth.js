// import jwt from "jsonwebtoken";
// import User from "../models/user.js";

// export const protect = async (req, res, next) => {
//   let token;

//   if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//     try {
//       token = req.headers.authorization.split(" ")[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       req.user = await User.findById(decoded.id).select("-password");
//       next();
//     } catch (err) {
//       return res.status(401).json({ error: "Not authorized, token failed" });
//     }
//   }

//   if (!token) {
//     return res.status(401).json({ error: "Not authorized, no token" });
//   }
// };

// export default protect;


import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ error: "User not found" });
      }

      next();
    } else {
      return res.status(401).json({ error: "Not authorized, no token provided" });
    }
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({ error: "Not authorized, token invalid or expired" });
  }
};

export default protect;
