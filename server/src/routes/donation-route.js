const express = require("express");
const { createDonation, getUserDonations, getAllDonations } = require("../controller/donation-controller");
const router = express.Router();

router.post("/donate", createDonation);
router.get("/user/:userId", getUserDonations);
router.get("/all", getAllDonations);


module.exports = router;

