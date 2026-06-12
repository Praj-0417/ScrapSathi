const nodemailer = require('nodemailer');
const OTP = require("../model/user/otp-model");
const User = require("../model/user/user-model");

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({ 
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  degug:true
});

// async function sendConfirmationEmail(customerEmail, customerName, shopName, location, selectedTimeSlot) {
//   let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'sbthelp123@gmail.com',
//       pass: 'pigw wfcs pidv aibo',
//     },
//   });

//   const selectedTimeSlotHTML = selectedTimeSlot && selectedTimeSlot.length > 0
//     ? selectedTimeSlot.map(slot => `
//       Date: ${new Date(slot.showtimeDate).toLocaleDateString()},
//                 Time: ${new Date(slot.showtimeDate).toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//     })}
//     `).join('') : "No time slot selected";

//   const mailOptions = {
//     from: '"Salon Booking Time" sbthelp123@gmail.com',
//     to: customerEmail,
//     subject: 'Appointment Booking Confirmation',
//     text: `Dear ${customerName},
//       Your payment for booking at ${shopName}, located at ${location}, has been successfully received.
//       You have booked the following time slot:
//       ${selectedTimeSlotHTML}
//       Thank you for choosing us!
//       Best regards,
//       Salon Booking Team`,
//   };

//   return transporter.sendMail(mailOptions);
// }

// Send email to all waste collectors when a new pickup request is raised.
const notifyWasteCollectors = async (collectorEmails, requestDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: collectorEmails, // Send email to all collectors
      subject: "New Waste Pickup Request Available",
      text: `A new waste pickup request has been made.\n\nDetails:\n📍 Location: ${requestDetails.address}\n🗑 Waste Type: ${requestDetails.wasteType}\n📏 Quantity: ${requestDetails.quantity}\n🕒 Preferred Time: ${requestDetails.preferredTimeSlot}\n\nPlease check your dashboard to accept the request.`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending collector notification email:", error);
  }
};

// Send Confirmation Email
const sendConfirmationEmail = async (userEmail, wasteCollector) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: "Your Waste Pickup Request Has Been Accepted",
      html: `<p>Hello,</p>
             <p>Your waste pickup request has been accepted by:</p>
             <p><strong>${wasteCollector.name}</strong></p>
             <p>Phone: ${wasteCollector.phone}</p>
             <p>Email: ${wasteCollector.email}</p>
             <p>Thank you for using our service!</p>`,
    };
    await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent successfully");
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
};

// const sendConfirmationEmail = async (userEmail, wasteCollector) => {
//   let mailOptions = {
//     from: process.env.EMAIL,
//     to: userEmail,
//     subject: "Waste Collection Request Accepted",
//     html: `<p>Your waste collection request has been accepted.</p>
//            <p>Waste Collector Details:</p>
//            <ul>
//               <li>Name: ${wasteCollector.name}</li>
//               <li>Phone: ${wasteCollector.phone}</li>
//               <li>Email: ${wasteCollector.email}</li>
//            </ul>`,
//   };
//   await transporter.sendMail(mailOptions);
// };

const mailOtp = async (otp, email, subject = 'OTP') => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    text: `Your OTP code is ${otp}`
  }
  await transporter.sendMail(mailOptions)
}


// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the latest OTP for the email
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

    // Check if OTP exists
    if (!response.length) {
      return res.status(400).json({ success: false, message: "OTP not found. Request a new one." });
    }

    const latestOTP = response[0]; // Since response is an array, take the first element

    // Check if OTP is expired
    if (latestOTP.expiresAt < Date.now()) {
      await OTP.deleteOne({ email }); // Remove expired OTP
      return res.status(400).json({ success: false, message: "OTP expired. Request a new one." });
    }

    // Check if OTP matches
    if (latestOTP.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }

    // If OTP is correct, delete it and return success
    await OTP.deleteOne({ email });

    return res.status(200).json({ success: true, message: "OTP verified successfully" });

  } catch (err) {
    console.error("OTP Verification Error:", err);
    res.status(500).json({ success: false, message: "OTP verification failed", error: err.message });
  }
};


module.exports = {
  mailOtp,
  notifyWasteCollectors,
  sendConfirmationEmail,
  verifyOTP
}

