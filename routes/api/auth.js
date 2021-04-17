const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");
// @route     GET api/auth

router.get("/", auth, async (req, res) => {
  try {
    console.log("auth");

    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

// @route     Post api/auth
//@desc       get the logged in user Token
router.post(
  "/",
  [
    check("email", "Please include a valid email !").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      //------------------check if user exists------------------
      const { email, password } = req.body;
      let user = await User.findOne({ email });

      if (!user) {
        res.status(400).json({ errors: [{ msg: "Invalid Credentials !" }] });
      }
      //------------------Compare passwords------------------
      const isMatch = bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ errors: [{ msg: "Invalid Credentials !" }] });
      }
      //------------------return jsonwebtoken------------------
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
      //res.send("USER saved!");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
