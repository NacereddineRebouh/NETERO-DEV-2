const { json } = require("express");
const express = require("express");
const router = express.Router();

const { check, validationResult } = require("express-validator");

const auth = require("../../Middleware/auth");
const Profile = require("../../models/Profile");

// @route     GET api/profile/me
// @desc     Get Current user's profile if he has one
// @access   Private(we used a middleware 'auth' to secure the route by verifying the token of the curent user)

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("UserRef", ["name", "avatar"]); //populate profile from user => NAME and AVATAR
    if (!profile) {
      return res
        .status(400)
        .json({ msg: "There is no profile for this user !" });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.massage);
    res.status(500).send("server error");
  }
});

// @route     POST api/profile/
// @desc     Create or Update user's profile
// @access   Private(we used a middleware 'auth' to secure the route by verifying the token of the curent user)

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills are Required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    console.log("meow");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      user,
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubusername,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram,
    } = req.body;

    //build profile Object
    const profileFields = {};
    profileFields.status = status;
    profileFields.skills = skills.split(",").map((s) => s.trim());
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (githubusername) profileFields.githubusername = githubusername;

    //social object
    profileFields.social = {};
    profileFields.social.youtube = youtube;
    profileFields.social.twitter = twitter;
    profileFields.social.instagram = instagram;
    profileFields.social.linkedin = linkedin;
    profileFields.social.facebook = facebook;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      //create
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("server error");
    }
  }
);

// @route     GET api/profile/me
// @desc     Get All profiles
// @access   Private(we used a middleware 'auth' to secure the route by verifying the token of the curent user)

router.get("/", async (req, res) => {
  try {
    console.error("2");
    const profiles = await Profile.find().populate("UserRef", [
      "name",
      "avatar",
    ]);
    console.log("3");
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});
module.exports = router;
