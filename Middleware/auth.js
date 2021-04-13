const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  console.log("auth middleware");
  //next is a callback
  //get token from the header
  const token = req.header("x-auth-token");

  //check token
  if (!token) {
    return res.status(401).json({ msg: "No Token, authrization denied" });
  }

  //verify token and retrieve user
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
