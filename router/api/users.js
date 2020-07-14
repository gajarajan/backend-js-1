const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const config=require('config');
const { check, validationResult } = require("express-validator/check");
const User = require("../../module/User");
const jwt=require('jsonwebtoken');
// router.get("/",(req,res)=>res.send('users route'));
router.post(
  "/",
  [
    check("name", "Nameis required").not().isEmpty(),
    check("email", "plse enter the valid email").isEmail(),
    check(
      "passward",
      "please enter a passward with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errore: errors.array() });
    }
    const { name, email, passward } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
       return  res.status(400).json({ errors: [{ msg: "User already exits" }] });
      }
      const avatar = gravatar.url(email, { s: "200", r: "pg", d: "mm" });
      user = new User({
        name,
        email,
        avatar,
        passward,
      });
      const salt = await bcrypt.genSalt(10);
      user.passward = await bcrypt.hash(passward, salt);
      await user.save();
      const payload={
          user:{
              id:user.id
          }
      };
      jwt.sign(payload,config.get('jwtSecret'),{expiresIn:360000},(err,token)=>{
          if(err) throw err;
          res.json({token});
      });
    //  return res.send("user register");
    } catch (err) {
      console.log(err.message);
      return res.status(500).send("server error");
    }
    // res.send("users route");
  }
);

module.exports = router;
