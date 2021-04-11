const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");

// @route     GET api/auth

router.get("/", auth, (req, res) => res.send("AUTH ROUTE is here!"));

module.exports = router;
