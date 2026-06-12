const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = require("../middleware/upload");
const PickupRequest = require("../model/pickupRequest-model");
const { createPickupRequest, 
    getNotifications, 
    markNotificationSeen, 
    getAllWasteRequests, 
    acceptRequest,
    markCompleted,
    cancelAcceptedRequest,
  collectorCompletedRequests} = require("../controller/wastePickup-controller");


// Create pickup request
router.post("/request", upload.single("photo"), createPickupRequest);
router.get("/waste-requests", getAllWasteRequests);
router.post("/accept-request", acceptRequest);
router.post("/cancel-request", cancelAcceptedRequest);
router.post("/complete-request",markCompleted);
router.get('/collector-requests/:collectorId',collectorCompletedRequests);

// Get all pickup requests for a user (including wasteCollector details)
router.get("/user-requests/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const requests = await PickupRequest.find({ userId })
        .populate("wasteCollector", "name phone") // Populate collector details
        .sort({ createdAt: -1 }); // Sort by latest requests
  
      res.json(requests);
    } catch (error) {
      console.error("Error fetching pickup requests:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

// Get notifications for a waste collector
router.get("/notifications/:wasteCollectorId", getNotifications);

// Mark notification as seen
router.put("/notification/:notificationId", markNotificationSeen);

module.exports = router;
