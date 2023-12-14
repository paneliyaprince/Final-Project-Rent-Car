const express = require('express');
const router = express.Router();
const Type = require('../models/VehicleType');
const {auth, checkAuth } = require('../config/passport');
auth()


//get all vehicles
router.get('/', async (req, res) => {
    try {
        const types = await Type.find();
        res.json(types);
    }
    catch (err) {
        res.json({ message: err });
    }
});

//create a user
router.post('/', (req, res) => {
    console.log("Req Body", req)
    new Type({
        category: req.body.category,
        hourlyRate: req.body.hourlyRate,
        hour1: req.body.hour1,
        hour6: req.body.hour6,
        hour11: req.body.hour11,
        hour16: req.body.hour16,
        day1: req.body.day1,
        day2: req.body.day2,
        day3: req.body.day3,
        lateFee: req.body.lateFee
    }).save()
        .then(result => {
            Type.find().exec()
                .then(result => {
                    res.json(result)
                })
                .catch(err => {
                    res.json(err)
                })
        })
        .catch(err => {
            res.json(err)
        })



});


//delete a user
router.post('/delete', async (req, res) => {

    Type.remove({
        _id: req.body._id
    }).exec()
        .then(result => {
            Type.find().exec()
                .then(result => {
                    res.json(result)
                })
                .catch(err => {
                    res.json(err)
                })
        })
        .catch(err => {
            res.json(err)
        })
});

//update a user 
router.post('/update', async (req, res) => {
    Type.updateOne(
        { _id: req.body._id },
        {
            $set: {
                category: req.body.category,
                hourlyRate: req.body.hourlyRate,
                hour1: req.body.hour1,
                hour6: req.body.hour6,
                hour11: req.body.hour11,
                hour16: req.body.hour16,
                day1: req.body.day1,
                day2: req.body.day2,
                day3: req.body.day3,
                lateFee : req.body.lateFee

            }
        }
    ).exec()
        .then(result => {
            Type.find().exec()
                .then(result => {
                    res.json(result)
                })
                .catch(err => {
                    res.json(err)
                })
        })
        .catch(err => {
            res.json(err)
        })
});


module.exports = router;
