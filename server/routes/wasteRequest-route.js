const express = require("express");
// const { createWasteRequest, getUserWaste } = require("../controller/wasteRequest-controller");
const { createWasteRequest, getUserWasteRequests, getAllWasteRequests } = require("../controller/wasteRequest-controller");
const { acceptWasteRequest, getActiveBookings, getCollectionHistory } = require("../controller/wasteRequest-controller");
const router = express.Router();

// router.post("/create", createWasteRequest);
// router.get("/user/:userId", getUserWaste);
router.post("/create", createWasteRequest);
router.get("/user/:userId", getUserWasteRequests);
router.get("/all", getAllWasteRequests);
const { createWasteRequest, getUserWaste } = require("../controller/wasteRequest-controller");
const { acceptWasteRequest, getActiveBookings, getCollectionHistory } = require("../controller/wasteRequest-controller");

router.post("/create", createWasteRequest);
router.get("/user/:userId", getUserWasteRequests);
router.get("/all", getAllWasteRequests);

router.post("/accept/:wasteId", acceptWasteRequest);
router.get("/active/:collectorId", getActiveBookings);
router.get("/history/:collectorId", getCollectionHistory);


module.exports = router;