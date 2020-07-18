const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../module/User");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator/check");
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passward");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error1");
  }
});

router.post(
  "/",
  [
    check("email", "pls  enter the valid email").isEmail(),
    check(
      "passward",
      " passward required"
    ).exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errore: errors.array() });
      
    }
    const { email, passward } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "inivalid credentials" }] });
      }
      const isMatch = await bcrypt.compare(passward, user.passward);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "passward is not match" }] });
      } 
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
      //  return res.send("user register");
    } catch (err) {
      console.log(err.message);
      return res.status(500).send("server error");
    }
    // res.send("users route");
  }
);

module.exports = router;
