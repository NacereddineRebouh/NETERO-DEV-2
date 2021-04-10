const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const user = require("../../models/User");
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
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //see if user exists

    //Get user GRAVATAR

    //ecrypt password

    //return jsonwebtoken
    res.send("USER ROUTE is here!");
  }
);

module.exports = router;
