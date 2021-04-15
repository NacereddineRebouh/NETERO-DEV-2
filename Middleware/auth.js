const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  //next is a callback
  //get token from the header
  console.log("0.1");
  const token = req.header("x-auth-token");
  console.log("0.2");
  //check token
  if (!token) {
    return res.status(401).json({ msg: "No Token, authrization denied" });
  }
  // res.json({ Token: token });
  //verify token and retrieve user
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    req.user = decoded.user;
    console.log("0.2");
    next();
    console.log("0.3");
  } catch (error) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
