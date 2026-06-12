const multer = require("multer");
const fs = require("fs");

const storage = multer.memoryStorage(); // Store file in memory (RAM)
const upload = multer({ storage });

module.exports = upload;
