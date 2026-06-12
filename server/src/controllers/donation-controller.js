const Donation = require("../model/donation");

exports.createDonation = async (req, res) => {
  try {
    const { userId, amount, message } = req.body;
    if (!amount || amount < 1) {
      return res.status(400).json({ message: "Donation amount must be at least 1." });
    }

    const newDonation = new Donation({
      userId,
      amount,
      message
    });

    await newDonation.save();
    res.status(201).json({ message: "Donation successful. Thank you for your support!", donation: newDonation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserDonations = async (req, res) => {
  try {
    const { userId } = req.params;
    const donations = await Donation.find({ userId });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find();
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};