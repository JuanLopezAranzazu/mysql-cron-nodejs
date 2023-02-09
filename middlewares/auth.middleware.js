const jwt = require("jsonwebtoken");
// db
const pool = require("./../database");

const verifyToken = async (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) return res.status(403).json({ message: "No token provided" });

  try {
    const user = await jwt.verify(token, "JWT_SECRET");
    req.user = user;

    const [userFound] = await pool.query("SELECT * FROM user WHERE id = ?", [
      req.user.id,
    ]);
    if (userFound.length <= 0)
      return res.status(404).json({ message: "No user found" });

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized!" });
  }
};

module.exports = { verifyToken };
