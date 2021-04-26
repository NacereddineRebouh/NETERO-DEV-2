const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { check, validationResult } = require("express-validator");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Post");
// @route     POST api/posts
//@desc       Create posts
//@access     Private

router.post(
  "/",
  [auth, [check("text", "Text is required !").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      console.log(
        "the Id from request " +
          req.user.id +
          " ---the Id after creating the use object " +
          user._id
      );
      let newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error !");
    }
  }
);

// @route     GET api/posts
//@desc       Get all posts
//@access     Private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route     GET api/posts/:idPost
//@desc       Get post by id
//@access     Private

router.get("/:idPost", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.idPost);
    if (!post) {
      return res.status(404).json({ msg: "Post Not Found !" });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post Not Found !" });
    }
    res.status(500).send("Server Error");
  }
});

// @route     DELETE api/posts/:idPost
//@desc       Delete a post by id
//@access     Private

router.delete("/:idPost", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.idPost);
    if (!post) {
      return res.status(404).json({ msg: "Post Not Found !" });
    }
    if (req.user.id != post.user.toString()) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    await post.remove();
    res.sendStatus(200).json({ msg: "Post was deleted successfully" });
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post Not Found !" });
    }
    res.status(500).send("Server Error");
  }
});

// @route     PUT api/posts/like/:idPost (we used PUT bcz we r updating the post)
//@desc       like a post
//@access     Private

router.put("/like/:idpost", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.idpost);
    //verify if the user already liked the post
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "The user already liked the post " });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    //verify if the post exists
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post Not Found !" });
    }
    res.status(500).send("Server error");
  }
});

// @route     PUT api/posts/unlike/:idPost (we used PUT bcz we r updating the post)
//@desc       unlike a post
//@access     Private

router.put("/unlike/:idpost", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.idpost);
    //verify if the user already liked the post
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length == 0
    ) {
      return res
        .status(400)
        .json({ msg: "The post hasnt been liked by the user" });
    }

    //get remove index
    const RI = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(RI, 1);

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    //verify if the post exists
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post Not Found !" });
    }
    res.status(500).send("Server error");
  }
});

// @route     PUT api/posts/comment/:idPost (we used PUT bcz we r updating the post)
//@desc       add a comment to a post
//@access     Private
router.put(
  "/comment/:idpost",
  [auth, [check("text", "Text is required !").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id);
      const post = await Post.findById(req.params.idpost);
      const newC = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newC);
      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      //verify if the post exists
      if (err.kind == "ObjectId") {
        return res.status(404).json({ msg: "ObjectId Not Found !" });
      }
      res.status(500).send("Server error");
    }
  }
);

// @route     DELETE api/posts/comment/:idPost
//@desc       Delete a comment
//@access     Private

router.delete("/comment/:idpost/:idcomment", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const post = await Post.findById(req.params.idpost);
    const comment = post.comments.find(
      (comment) => comment.id === req.params.idcomment
    ); //returns the 'ID' if true ,else it returns 'flase'
    //make sure that the comment exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment not found !" });
    }

    //make sure that the user is the owner of the comment
    if (!comment.user.toString() === user.id) {
      return res.status(400).json({ msg: "Wrong comment" });
    }
    //get remove Index
    const RI = post.comments.findIndex(
      (comment) => comment.id === req.params.idcomment
    );

    console.log(RI);
    post.comments.splice(RI, 1);

    //save changes
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    //verify if the comment exists
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "ObjectId Not Found !" });
    }
    res.status(500).send("Server error");
  }
});

module.exports = router;

/*difference between FILTER() and MAP() is that filter take all the objects and put them in a 
list and runs that throught a function to create a new list with the all the objects that 
returns the value "True" , but the map takes all the object and put them in a list 
and apply a function to it*/
