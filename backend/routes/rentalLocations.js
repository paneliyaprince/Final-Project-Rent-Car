const express = require("express");
const router = express.Router();
const RentalLocation = require("../models/RentalLocation");
const Vehicles = require("../models/Vehicle");
const Address = require("../models/Address")
const Reservation = require("../models/Reservation")
const {auth, checkAuth } = require('../config/passport');
auth()

const paginated = 10;
//get all user
router.get("/",async (req, res) => {
  const { searchText, pageNum } = req.query;
  const skipCount = pageNum * paginated;
  try {
    if (searchText) {
      const locations = await RentalLocation.find({
        name: { $regex: searchText, $options: "i" }
      })
        .skip(skipCount)
        .limit(paginated).populate('address');
      const total = await RentalLocation.find({
        name: { $regex: searchText, $options: "i" }
      }).countDocuments();
      res.send({ total: total, locations: locations });
    } else {
      const locations = await RentalLocation.find()
        .skip(skipCount)
        .limit(paginated).populate('address');
      const total = await RentalLocation.countDocuments();
      res.send({ total: total, locations: locations });
    }
  } catch (err) {
    res.json({ message: err });
  }
});


router.post("/", checkAuth,async (req, res) => {
  const address = new Address ({...req.body});
  await address.save()
  const rentalLocation = new RentalLocation({
    name: req.body.name,
    address: address,
    capacity: req.body.capacity,
    numOfVehicles: 0,
  });
  await rentalLocation
    .save()
    .then(result => {
      RentalLocation.find().populate('address')
        .exec()
        .then(result => {
          res.send({success : true, locations : result});
        });
    })
    .catch(err => {
      res.send(err);
    });
});

//get a specific user
router.get("/:rentalLocationId", checkAuth,async (req, res) => {
  try {
    const rentalLocationVehicles = await Vehicles.find({
      rentalLocation: req.params.rentalLocationId
    })
      .populate("type")
      .populate("rentalLocation").populate('ratings');
    return res.send({
      total: rentalLocationVehicles.length,
      vehicles: rentalLocationVehicles
    });
  } catch (err) {
    res.json({ message: err });
  }
});

//delete a user
router.post("/delete", checkAuth,async (req, res) => {
  try {
    r = Reservation.find({returnLocation: req.body._id})
    if ((req.body._id in Reservation.distinct('returnLocation')) && r.returned == false ){
      
      res.json({message:"There are cars to be returned at this location, can't delete now"})
    }

    else{
      await RentalLocation.remove({
        _id: req.body._id
      })
        .exec()
        .then(result => {
          RentalLocation.find()
            .exec()
            .then(result => {
              res.send(result);
            });
        });
      }
    
    
  } catch (err) {
    res.json({ message: err });
  }
});

//update a user
router.post("/update", checkAuth,async (req, res) => {
  console.log("req", req.body);
  const address = new Address ({...req.body});
  await address.save()
  console.log("address1",address)
  
  await RentalLocation.updateOne(
    { _id: req.body._id },
    {
      $set: {
        name: req.body.name,
        address: address,
        capacity: req.body.capacity,
        // numOfVehicles: req.body.numOfVehicles
      }
    }
  )
    .exec()
    .then(result => {
      RentalLocation.find().populate('address')
        .exec()
        .then(result => {
          res.send(result);
        });
    });
});

//get Location Names
router.get("/allLocations/IDs", checkAuth,async (req, res) => {
  RentalLocation.find()
    .select("name")
    .exec()
    .then(result => {
      console.log(result);
      res.send(result);
    })
    .catch(err => {
      res.send(err);
    });
});

module.exports = router;
