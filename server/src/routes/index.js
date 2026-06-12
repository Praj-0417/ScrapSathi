const express = require('express')
const router = express.Router()

const userRoute = require('./user/user-route')
const otpRouter = require('./user/otp-route')
const contactRoute = require('./contact-route')
// const wasteRequestRoute = require('./wasteRequest-route')
const donationRoute = require('./donation-route')
const wastePickup = require('./wastePickup-route');

router.use('/auth',userRoute)
router.use('/form',contactRoute)
router.use('/otp',otpRouter)
// router.use('/waste-request',wasteRequestRoute)
router.use('/donation',donationRoute)
router.use('/pickup',wastePickup)


module.exports = router