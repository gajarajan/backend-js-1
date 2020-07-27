const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const auth = require("../../middleware/auth");
const Profile = require("../../module/Profile");
const User = require("../../module/User");
const Post = require("../../module/Post");

//@route    POST api/post
//@desc     Create a post
//@access   private
router.post(
  "/",
  [auth, [check("text", "text is required").not().isEmpty()]],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-passward");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);
//@route    GET api/post
//@desc     Get all post
//@access   private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});
//@route    GET api/post/:id
//@desc     Get  post using id
//@access   private

router.get("/:id", auth, async (req, res) => {
  try {
    //@todo-remove user posts
    //Remove profile
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("server Error");
  }
});
//@route    delete api/post/:id
//@desc     delete the post using id
//@access   private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    //check user
    if (post.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: "user  not authorized" });
    }
    await post.remove();
    res.json({ msg: "post is removed" });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});
//@route    GET api/post/like/:id
//@desc     like a post
//@access   private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //Check if  the post is already liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length > 0
    ) {
      return res.status(400).json({ msg: "post already liked" });
    }
    post.likes.unshift({ user: req.user.id });

    await post.save();
    res.json(post.likes); 
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //Check if  the post is already liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "post has not yet been liked" });
    }
     const removeIndex=post.likes.map(like=>like.user.toString()).indexOf(req.user.id);
     post.likes.splice(removeIndex,1);
    await post.save();
    res.json(post.likes); 
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});
module.exports = router;
