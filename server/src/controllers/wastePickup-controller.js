const PickupRequest = require("../model/pickupRequest-model");
const User = require("../model/user/user-model");
const { notifyWasteCollectors, sendConfirmationEmail } = require("../utils/mail");

// Create a new pickup request
exports.createPickupRequest = async (req, res) => {
  try {
    const { userId, wasteType, quantity, address, preferredTimeSlot, subcategory } = req.body;
  
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }
    // Convert image to Base64 if uploaded
    let photoBase64 = null;
    if (req.file) {
      photoBase64 = req.file.buffer.toString("base64");
    }

    const pickupRequest = new PickupRequest({
      userId,
      wasteType,
      quantity,
      address,
      preferredTimeSlot,
      subcategory,
      photo: photoBase64,
      // otherWasteType,
    });

    await pickupRequest.save();

    // Fetch all waste collectors
    const wasteCollectors = await User.find({ usertype: "waste-collector" }, "email");
    const collectorEmails = wasteCollectors.map((collector) => collector.email);
    if (collectorEmails.length > 0) {
      await notifyWasteCollectors(collectorEmails, req.body);
    }
    res.status(201).json({ message: "Pickup request created, emails sent to collectors." });
  } catch (error) {
    console.log("Error from backend-", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get notifications for a waste collector
exports.getNotifications = async (req, res) => {
  try {
    const { wasteCollectorId } = req.params;
    const notifications = await Notification.find({ wasteCollectorId, seen: false });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark notification as seen
exports.markNotificationSeen = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndUpdate(notificationId, { seen: true });
    res.json({ message: "Notification marked as seen." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getAllWasteRequests = async (req, res) => {
  try {
    const wasteRequests = await PickupRequest.find().populate("userId", "name email phone address");
    res.status(200).json(wasteRequests);
  } catch (error) {
    console.error("Error fetching waste requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Get all pending requests
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await WasteRequest.find({ status: "pending" }).populate("userId", "name phone");
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error });
  }
};


// Waste Collector Accepts Request
exports.acceptRequest = async (req, res) => {
  try {
    const { requestId, wasteCollectorId } = req.body;
    if (!requestId || !wasteCollectorId) {
      return res.status(400).json({ message: "Missing requestId or wasteCollectorId" });
    }

    const request = await PickupRequest.findById(requestId).populate("userId");
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Ensure the request is still pending before accepting
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is already accepted or completed" });
    }

    request.wasteCollector = wasteCollectorId;
    request.status = "accepted";
    await request.save();

    // Send confirmation email
    const user = await User.findById(request.userId);
    const wasteCollector = await User.findById(wasteCollectorId);
    if (user && wasteCollector) {
      await sendConfirmationEmail(user.email, wasteCollector);
    }

    res.status(200).json({ message: "Request accepted", request });
  } catch (error) {
    console.error("Error in accept Request:", error);
    res.status(500).json({ message: error.message });
  }
};

// Cancel an accepted request
exports.cancelAcceptedRequest = async (req, res) => {
  const { requestId, wasteCollectorId } = req.body;

  if (!requestId || !wasteCollectorId) {
    return res.status(400).json({ message: "Missing request ID or collector ID" });
  }

  try {
    const request = await PickupRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "accepted" || request.wasteCollector.toString() !== wasteCollectorId) {
      return res.status(400).json({ message: "You can only cancel requests you accepted" });
    }

    request.status = "pending";
    request.wasteCollector = null;
    await request.save();

    res.status(200).json({ message: "Request cancelled successfully, available for others", request });
  } catch (error) {
    res.status(500).json({ message: "Error canceling request", error });
  }
};


// router.post('/complete-request', async (req, res) => {
exports.markCompleted = async (req,res) => {
  try {
    const { requestId, wasteCollectorId } = req.body;

    // Validate input
    if (!requestId || !wasteCollectorId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the request
    const request = await PickupRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Verify the collector is the one who accepted it
    if (request.wasteCollector.toString() !== wasteCollectorId) {
      return res.status(403).json({ message: 'Not authorized to complete this request' });
    }

    // Verify the request is in accepted state
    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'Request must be accepted before completion' });
    }

    // Update the request
    request.status = 'completed';
    request.completedAt = new Date();
    await request.save();

    // Optionally: Update user stats or trigger notifications here

    res.json({ message: 'Request marked as completed', request });
  } catch (error) {
    console.error('Error completing request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all requests for a specific waste collector
// router.get('/collector-requests/:collectorId', async (req, res) => {
exports.collectorCompletedRequests = async (req,res) => {
  try {
    const { collectorId } = req.params;
    
    // Find all requests where this collector is involved
    const requests = await PickupRequest.find({
      $or: [
        { wasteCollector: collectorId },
        { 'history.collectorId': collectorId }
      ]
    })
    .populate('userId', 'name phone')
    .populate('wasteCollector', 'name phone vehicle')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching collector requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
