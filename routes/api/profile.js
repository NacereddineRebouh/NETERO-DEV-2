const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const Profile = require("../../models/Profile");
// @route     GET api/profile/me

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    console.log("1");
    if (!profile) {
      return res
        .status(400)
        .json({ msg: "There is no profile for this user !" });
    }
    console.log("2");
    res.json(profile);
  } catch (error) {
    console.error(error.massage);
    res.status(500).send("server error");
  }
});

module.exports = router;
