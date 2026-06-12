const express = require("express");
const { adminLogin, getAllUsers, getAllWasteRequests, getAllDonations } = require("../controller/admin-controller");
const router = express.Router();

router.post("/login", adminLogin);
router.get("/users", getAllUsers);
router.get("/waste-requests", getAllWasteRequests);
router.get("/donations", getAllDonations);

module.exports = router;
