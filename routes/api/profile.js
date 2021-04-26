const { json } = require("express");
const express = require("express");
const router = express.Router();
const config = require("config");
const request = require("request");
const { check, validationResult } = require("express-validator");

const auth = require("../../Middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
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

    const u = await User.findById(req.user.id);
    console.log(u.name);

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
    const profiles = await Profile.find().populate("UserRef", [
      "name",
      "avatar",
    ]);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// @route     GET api/profile/user/userId
// @desc     Get Current user's profile by his Id
// @access   Public

router.get("/user/:userId", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.userId,
    }).populate("UserRef", ["name", "avatar"]); //populate profile from user => NAME and AVATAR
    if (!profile) {
      return res.status(400).json({ msg: "Profile not found !" });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.massage);
    if (error.kind == "ObjectId")
      return res.status(400).json({ msg: "Profile not found !" });
    res.status(500).send("Server error");
  }
});

// @route     DELETE api/profile
// @desc      Delete Profile ,user & profile
// @access    Private

router.delete("/", auth, async (req, res) => {
  try {
    //@todo  remove users posts

    //remove profile & user
    await Profile.findOneAndDelete({ user: req.user.id });
    await User.findOneAndDelete({ _id: req.user.id });

    res.json({ msg: "User deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

//----------------------------------Experience--------------------------------------//
// @route     PUT api/profile/experience
// @desc      Add Profile experience
// @access    Private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "company is required").not().isEmpty(),
      check("from", "From is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      from,
      location,
      to,
      current,
      description,
    } = req.body;
    const NewExp = { title, company, from, location, to, current, description };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(NewExp); //unshift works like PUSH but it add to the begining
      await profile.save();

      res.json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server error");
    }
  }
);

// @route     DELETE api/profile/experience
// @desc      delete Profile experience
// @access    Private

router.delete("/experience/:expId", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //get the index of the xperience that we want to delete
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.expId);
    console.log(removeIndex);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error !");
  }
});

//---------------------------------Education---------------------------------------//
// @route     PUT api/profile/education
// @desc      Add Profile education
// @access    Private

router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      school,
      degree,
      from,
      to,
      fieldofstudy,
      current,
      description,
    } = req.body;
    const NewEd = {
      school,
      degree,
      from,
      to,
      fieldofstudy,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(NewEd); //unshift works like PUSH but it add to the begining
      await profile.save();

      res.json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server error");
    }
  }
);

// @route     DELETE api/profile/education
// @desc      delete Profile education
// @access    Private

router.delete("/education/:EduId", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //get the index of the education that we want to delete
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.EduId);
    console.log(removeIndex);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error !");
  }
});

// @route     GET api/profile/Github/username
// @desc      get user repos from git hub ()
// @access    Public

router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri:
        "https://api.github.com/users/" +
        req.params.username +
        "/repos?per_page=5&sort=created:asc&client_id=" +
        config.get("githubClientId") +
        "&client_secret=" +
        config.get("githubSecret") +
        "",
      method: "GET",
      headers: { "user-agent": "node.js" },
    };

    request(options, (error, response, body) => {
      if (error) contextsKey.error(error);
      if (response.statusCode != 200) {
        res.status(404).json({ msg: "No github profile Found !" });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
