const express = require("express");
// const bcrypt = require("bcrypt");
const User = require("../models/User");
const loginRouter = express.Router();
const secret = "ThisisCMPE202PROJECTAABM";
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const {auth, checkAuth } = require('../config/passport');
auth()

const signWithJWT = (user, callback) => {
  jwt.sign(user, secret, { expiresIn: 36000 }, (error, token) => {
    if (error) {
      callback(error, null);
    } else {
      const obj = { ...user };
      obj.token = token;
      callback(null, obj);
    }
  });
};

loginRouter.post("/", async (req, res) => {
  let user = await User.findOne({ emailAddress: req.body.emailAddress });
  const hash = crypto
          .createHmac("sha256", secret)
          .update(req.body.password)
          .digest("hex");
          console.log(user.password, hash)
  if (!user) {
    res.status(401).json({ message: "User not found" });
  } else if (hash === user.password) {
    if (user.isValidated || user.manager || user.admin){
      signWithJWT(Object.assign({}, user._doc), (error, result) => {
        if (error) {
          return res.json({ message: error });
        }
        return res.json(result);
      })
    }else {
      return res.status(200).json({message : 'Please wait your account is being validated!'});
    }
    
  } else {
    return res.status(403).json({ message: "Invalid Credentials" });
  }
});
module.exports = loginRouter;
