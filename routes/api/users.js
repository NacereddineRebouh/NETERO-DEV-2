const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const user = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
// @route     Post api/user

router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email !").isEmail(),
    check(
      "password",
      "Please enter a password with 8 or more caracters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      //------------------check if user exists------------------
      const { name, email, password } = req.body;
      let user = await User.findOne({ email });

      if (user) {
        res.status(400).json({ errors: [{ msg: "USER already exists !" }] });
      }
      //------------------Get user GRAVATAR------------------
      const avatar = gravatar.url(email, {
        s: "200", //size=String of 200
        r: "pg",
        d: "mm", //default image
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });
      //------------------ecrypt password------------------
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);
      await user.save();

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
