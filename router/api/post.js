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
      const post=await newPost.save();
      res.json(post);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    } 
  }
);

router.get('/',auth,async(req,res)=>{
    try {
        const posts=await Post.find().sort({date:-1});
        res.json(posts);
    } catch (err) {
        console.log(err.message);
        res.status(500).send("server error");
      } 
});
module.exports = router;
