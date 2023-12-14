const express = require("express");
const router = express.Router();

const hardCount = 10;
const Vehicle = require("../models/Vehicle");
const RentalLocation = require("../models/RentalLocation");
const {auth, checkAuth } = require('../config/passport');
auth()

//get all vehicles
router.get("/",async (req, res) => {
  try {
    const { pageNum, searchText } = req.query;
    const skipCount = hardCount * pageNum;
    if (searchText) {
      const vehicles = await Vehicle.find();
      const total = await Vehicle.countDocuments();
      return res.send({ total: total, vehicles: vehicles });
    } else {
      const vehicles = await Vehicle.find();
      const total = await Vehicle.countDocuments();
      return res.send({ total: total, vehicles: vehicles });
    }
  } catch (error) {
    res.send(error);
  }
});

//create a user
router.post("/",async (req, res) => {
  // console.log("req.body ",req.body)
  v = new Vehicle({
    carname: req.body.carname,
    type: req.body.type,
    make: req.body.make,
    modelYear: req.body.modelYear,
    currentMileage: req.body.currentMileage,
    condition: req.body.condition,
    timeLastServiced: req.body.timeLastServiced,
    availability: true,
    rentalLocation: req.body.rentalLocation
  });

 
  
  v.save();

  res.send("Vehicle Added!");
  
});

//get a specific user
router.get("/:vehicleId",async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId)
      .populate("rentalLocation")
      .populate("type").populate("ratings");
    return res.json(vehicle);
  } catch (err) {
    res.json({ message: err });
  }
});

//delete a user
router.post("/delete",async (req, res) => {
  // console.log("In delete Vehicles",req.body)
  try {
    const vehicle = await Vehicle.findById(req.body._id)
    
    
      Vehicle.remove({ carname: req.body.carname })
        .exec();
      
    res.send("Deleted!");
    
    
  }
  
    catch (err) {
    res.json({ message: err });
  }


});

//update a user
router.post("/update", async (req, res) => {
  console.log("vehicle update api", req.body);
  
    
      Vehicle.updateOne(
        { carname: req.body.carname },
        {
          $set: {
            carname: req.body.carname,
            type: req.body.type,  
            make: req.body.make,
            modelYear: req.body.modelYear,
            currentMileage: req.body.currentMileage,
            condition: req.body.condition,
            timeLastServiced: req.body.timeLastServiced,

          }
        },{
          
        }
      )
      .exec();
      res.send("Updated!")
});

//get vehicle Name
router.post("/allVehicles/IDs",async (req, res) => {
  await Vehicle.find({
    rentalLocation: { $ne: req.body.locationId }
  })
    .select("carname")
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
