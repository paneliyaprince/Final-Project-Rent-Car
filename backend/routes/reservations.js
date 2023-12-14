const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");
const Vehicle = require("../models/Vehicle");
const RentalLocation = require("../models/RentalLocation");
const VehicleType = require("../models/VehicleType");
const Rating = require("../models/Rating");
const perPage = 20;
const { auth, checkAuth } = require("../config/passport");
auth();

router.get("/", async (req, res) => {
  try {
    const reservations = await Reservation.find();
    console.log(reservations);
    res.json(reservations);
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/userReservations/:userID/", checkAuth, async (req, res) => {
  try {
    const { userID } = { ...req.params, ...req.query };
    const reservation = await Reservation.findOne()
      .and([
        {
          user: mongoose.Types.ObjectId(userID)
        },
        { returned: false }
      ])
      .limit(1)
      .populate("vehicle")
      .populate("pickupLocation")
      .populate("returnLocation")
      .populate("address");
    const reservationHistory = await Reservation.find()
      .and([
        {
          user: mongoose.Types.ObjectId(userID)
        },
        { returned: true }
      ])
      .populate("vehicle")
      .populate("pickupLocation")
      .populate("returnLocation")
      .populate("address");
    res.json({ reservation, reservationHistory });
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/", checkAuth, async (req, res) => {
  try {
    var pickupTimeEpoch = new Date(req.body.pickupTime);
    pickupTimeEpoch = pickupTimeEpoch.getTime();

    var returnTimeEpoch = new Date(req.body.expectedReturnTime);
    returnTimeEpoch = returnTimeEpoch.getTime();
    const reservation = new Reservation({
      user: req.body.user,
      vehicle: req.body.vehicle,
      pickupLocation: req.body.pickupLocation,
      returnLocation: req.body.returnLocation,
      pickupTime: pickupTimeEpoch,
      expectedReturnTime: returnTimeEpoch,
      status: "Reserved"
    });

    let v = await Vehicle.findById(reservation.vehicle._id)
      .populate("type")
      .populate("rentalLocation")
      .populate({
        path: "rentalLocation",
        populate: {
          path: "address",
          model: "Address"
        }
      });

    const selectedReturnLocation = await RentalLocation.findById(
      req.body.returnLocation
    );

    let reservationsForUser = await Reservation.find({
      user: req.body.user,
      returned: false
    });

    if (reservationsForUser.length > 0) {
      return res.json({
        message: "You already have a reservation! Please complete that first"
      });
    }

    if (
      selectedReturnLocation.capacity <= selectedReturnLocation.numOfVehicles &&
      selectedReturnLocation._id.toString() !== v.rentalLocation._id.toString()
    ) {
      return res.json({
        message:
          "The return location is at full capacity! Please chose another location to return to!"
      });
    }

    let reservationsForVehicle = await Reservation.find({
      vehicle: req.body.vehicle,
      returned: false
    });

    if (reservationsForVehicle.length > 0) {
      const alternates = await Vehicle.find();

      if (alternates.length > 0) {
        return res.json({
          message: "The vehicle is not available for the given time",
          vehicles: [alternates[0]._doc]
        });
      } else {
        return res.json({
          message:
            "The vehicle is not available for the given time, Please chose another vehicle!"
        });
      }
    } else {
      const savedReservation = await reservation.save();
      v.availability = false;
      if (req.body.returnLocation.toString() !== v.rentalLocation._id.toString()){
        await RentalLocation.findByIdAndUpdate(req.body.returnLocation, {
          $inc: { numOfVehicles: 1 }
        });
      }
      await v.save();
      return res.json(savedReservation);
    }

    // if (reservation.pickupTime - Date.now() < 43200000) {
    //   if (v.availability === true) {
    //     if (
    //       mongoose.Types.ObjectId(v.rentalLocation._id).equals(
    //         reservation.pickupLocation
    //       )
    //     ) {
    //       const savedReservation = await reservation.save();
    //       v.availability = false;
    //       await v.save();
    //       return res.json(savedReservation);
    //     } else {
    //       message =
    //         "The Car you chose is not available at this location, here are some alternatives at other locations";
    //     }
    //   } else {
    //     message =
    //       "The Car you chose is already booked, here is an alternative at other location";
    //   }

    //   let curZipCode = 00000;
    //   if (v.rentalLocation !== null) {
    //     curZipCode = v.rentalLocation.address.zipcode
    //       .toString()
    //       .substring(0, 2);
    //   }

    // const alternates = await Vehicle.find()
    //   .and([{ type: v.type }, { availability: true }])
    //   .populate("type")
    //   .populate("rentalLocation")
    //   .populate({
    //     path: "rentalLocation",
    //     populate: {
    //       path: "address",
    //       model: "Address"
    //     }
    //   });

    //   const a = alternates.filter(a => {
    //     if (a.rentalLocation && a.rentalLocation.address.zipcode) {
    //       return a.rentalLocation.address.zipcode
    //         .toString()
    //         .substring(0, 2)
    //         .includes(curZipCode);
    //     } else {
    //       return false;
    //     }
    //   });

    //   if (a.length > 0) {
    //     return res.json({
    //       message,
    //       vehicles: [{ ...a[0]._doc }]
    //     });
    //   } else {
    //     message =
    //       "This vehicle is not available at this location and no replacement vehicle found, please choose some other combination";
    //     return res.json({
    //       message
    //     });
    //   }
    // } else {
    //   return res.json({
    //     message: "Reservation rejected, please book one day before pickup time"
    //   });
    // }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.get("/:reservationId", checkAuth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.reservationId);
    res.json(reservation);
  } catch (err) {
    res.json({ message: err });
  }
});

router.delete("/:reservationId", checkAuth, async (req, res) => {
  try {
    const removedReservation = await Reservation.remove({
      _id: req.params.reservationId
    });
    res.json(removedReservation);
  } catch (err) {
    res.json({ message: err });
  }
});

router.put("/cancelReservation/:reservationId", checkAuth, async (req, res) => {
  try {
    const currentTime = Date.now();
    const reservation = await Reservation.findById(
      req.params.reservationId
    ).populate({
      path: "vehicle",
      populate: {
        path: "type",
        model: "VehicleType"
      }
    });
    const charge = reservation.vehicle.type.hourlyRate;
    reservation.status = "Cancelled";
    reservation.returnTime = currentTime;
    reservation.returned = true;
    await RentalLocation.findByIdAndUpdate(reservation.returnLocation, {
      $inc: { numOfVehicles: -1 }
    });
    await Vehicle.findByIdAndUpdate(reservation.vehicle._id, {
      availability: true
    });
    const pickupTime = new Date(reservation.pickupTime);
    const seconds = (currentTime - pickupTime) / 1000;
    if (seconds < 3600) {
      reservation.totalPrice = charge;
    }
    await reservation.save();
    res.json({ message: "Reservation Cancelled!", reservation });
  } catch (error) {
    res.json({ message: error });
  }
});

router.patch("/:reservationId", checkAuth, async (req, res) => {
  try {
    const { rating, condition } = req.body;

    const reservation = await Reservation.findById(req.params.reservationId)
      .populate("vehicle")
      .populate("type");
    console.log("reservation",reservation)
    let vehicle = await Vehicle.findById(reservation.vehicle._id);
    const vehicleType = await VehicleType.findById(
      reservation.vehicle.type._id
    );
    let totalPrice = 0;
    const pickupTime = new Date(reservation.pickupTime);
    const initialSeconds = Date.now() - pickupTime;
    const initialHours = parseFloat(initialSeconds / (60 * 60 * 1000));

    if (initialHours <= 1) {
      totalPrice = initialHours * vehicleType.hour1;
    } else if (initialHours <= 6) {
      totalPrice = initialHours * vehicleType.hour6;
    } else if (initialHours <= 11) {
      totalPrice = initialHours * vehicleType.hour11;
    } else if (initialHours <= 16) {
      totalPrice = initialHours * vehicleType.hour16;
    } else if (initialHours <= 24) {
      totalPrice = initialHours * vehicleType.day1;
    } else if (initialHours <= 48) {
      totalPrice = initialHours * vehicleType.day2;
    } else if (initialHours <= 72) {
      totalPrice = initialHours * vehicleType.day3;
    }
    const returnTime = new Date(reservation.expectedReturnTime);
    if (returnTime < Date.now()) {
      const seconds = Date.now() - returnTime;
      const hours = seconds / (60 * 60 * 1000);
      const lateFees = hours * vehicleType.lateFee;
      totalPrice += lateFees;
    }
    console.log('RATING',rating)
    if (rating !== null && rating !== undefined) {
      const vehicleRating = new Rating({ ...req.body, vehicle: vehicle });
      console.log('RATING DETAILS',vehicleRating)
      await vehicleRating.save();
      await Vehicle.updateOne(
        { _id: reservation.vehicle._id },
        {
          $set: {
            rentalLocation: reservation.returnLocation,
            availability: true
          }
        },
      );
      vehicle.ratings.push(vehicleRating)
      await vehicle.save()
    } else {
      await Vehicle.updateOne(
        { _id: reservation.vehicle._id },
        {
          $set: {
            rentalLocation: reservation.returnLocation,
            availability: true
          }
        }
      );
    }

    if (condition !== null && condition !== undefined) {
      await Vehicle.findByIdAndUpdate(reservation.vehicle._id, {
        $set: { condition: condition }
      });
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.reservationId,
      {
        totalPrice: totalPrice.toFixed(2),
        status: "Returned",
        returned: true,
        returnTime: Date.now()
      },
      { new: true }
    )
      .populate("vehicle")
      .populate({
        path: "vehicle.type",
        model: "VehicleType"
      })
      .populate("pickupLocation")
      .populate("returnLocation");
    res.json({ success: true, reservation: updatedReservation });
  } catch (error) {
    console.log(error);
    res.json({ message: error });
  }
});

module.exports = router;
