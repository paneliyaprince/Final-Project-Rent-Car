const express = require("express");
var app = express();
const router = express.Router();
const User = require("../models/User");
const multer = require("multer");
var path = require("path");
// const bcrypt = require("bcrypt");
const crypto = require('crypto')
const secret = "ThisisCMPE202PROJECTAABM";
const jwt = require('jsonwebtoken');
const {auth, checkAuth } = require('../config/passport');
// auth()

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

const upload = multer({
  storage: storage
});

app.use("../uploads", express.static(path.join(__dirname, "/uploads")));

//get all user
router.get("/", async (req, res) => {
  
  try {
    
    // user.save();
    const users = await User.find();
    
    res.json(users);
  } catch (err) {
    res.json({ message: err });
  }
});

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

//create a user
router.post("/", upload.single("drivingLicense"), async (req, res) => {
  console.log(req.body);
  User.findOne({
    emailAddress: req.body.emailAddress
  })
    .exec()
    .then(async result => {
      if (result) {
        res.json({ message: "Id Already Exists" });
      } else {

        const hash = crypto
          .createHmac("sha256", secret)
          .update(req.body.password)
          .digest("hex");

        // const salt = bcrypt.genSaltSync(10);
        const password = hash;//bcrypt.hashSync(req.body.password, salt);
        console.log(hash)
        if (req.body.admin === true) {
          const user = new User({
            emailAddress: req.body.emailAddress,
            password: password,
            admin: true,
            manager: false
          });
          try {
            const savedUser = await user.save();
            signWithJWT(Object.assign({}, savedUser._doc), (error, result) => {
              if (error) {
                return res.json({ message: error });
              }
              return res.json(result);
            })
          } catch (err) {
            res.json({ message: err });
          }
        } else if (req.body.manager === true) {
          const user = new User({
            emailAddress: req.body.emailAddress,
            password: password,
            manager: true,
            admin: false
          });
          try {
            const savedUser = await user.save();
            signWithJWT(Object.assign({}, savedUser._doc), (error, result) => {
              if (error) {
                return res.json({ message: error });
              }
              return res.json(result);
            })
          } catch (err) {
            res.json({ message: err });
          }
        } else {
          var host = req.hostname;
          var filepath = req.protocol + "://" + host + ":3000/" + req.file.path;
          req.body.dlImage = filepath;

          const user = new User({
            admin: req.body.admin,
            manager: req.body.manager,
            name: req.body.name,
            password: password,
            dlImage: req.body.dlImage,
            emailAddress: req.body.emailAddress,
            creditCardInfo: req.body.creditCardInfo,
            residenceAddress: req.body.residenceAddress,
            phoneNumber: req.body.phoneNumber,
            isValidated: false
          });
          try {
            const savedUser = await user.save();
            res.json({ message: "Please wait while you're being validated" });
          } catch (err) {
            res.json({ message: err });
          }
        }
      }
    })
    .catch(err => {
      console.log(err);
      res.json(err);
    });
});

//get a specific user
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.json({ message: err });
  }
});

//delete a user
router.delete("/:userId", async (req, res) => {
  try {
    const removedUser = await User.remove({ _id: req.params.userId });
    res.json(removedUser);
  } catch (err) {
    res.json({ message: err });
  }
});

//update a user
router.patch("/:userId", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId);
    let dataToUpdate = { ...req.body };
    if (req.body.extendCard !== undefined) {
      dataToUpdate = {
        accountExpiry: new Date(+new Date(user.accountExpiry) + 180 * 24 * 60 * 60 * 1000)
      };
    }
    await User.findByIdAndUpdate(req.params.userId, {
      $set: {
        ...dataToUpdate
      }
    }).select("-password");
    const updatedUser = await User.findById(req.params.userId);
    res.json(updatedUser);
  } catch (err) {
    req.json({ message: err });
  }
});


//validate user
router.post("/isValid", (req, res) => {
  console.log("req", req.body);
  User.updateOne(
    {
      _id: req.body._id
    },
    {
      $set: {
        isValidated: req.body.isValidated
      }
    }
  )
    .exec()
    .then(result => {
      User.find()
        .exec()
        .then(result => {
          res.send(result);
        })
        .catch(err => {
          res.send(err);
        });
    })
    .catch(err => {
      res.json({ message: err });
    });
});

//UpdateFee
router.post("/updateFee", (req, res) => {
  console.log("Inside update fee req", req.body);
  User.updateOne(
    {
      _id: req.body._id
    },
    {
      $set: {
        membershipFee: req.body.Fee
      }
    }
  )
    .exec()
    .then(result => {
      User.find()
        .exec()
        .then(result => {
          res.send(result);
        })
        .catch(err => {
          res.send(err);
        });
    })
    .catch(err => {
      res.json({ message: err });
    });
});


module.exports = router;
 