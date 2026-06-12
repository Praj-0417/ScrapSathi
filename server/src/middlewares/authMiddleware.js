const jwt = require("jsonwebtoken");
const User = require("../model/user/user-model");

const protect = async (req, res, next) => {
  console.log("Headers Received:", req.headers); // Debugging

  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Extracted Token:", token); // Debugging

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'achhaLol');
      console.log("Decoded Token:", decoded); // Debugging

      req.user = await User.findById(decoded.userId).select("-password");
      console.log("User Found:", req.user); // Debugging

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      console.log("next called")
      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    console.log("No Token Found");
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
