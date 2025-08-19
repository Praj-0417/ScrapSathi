const User = require("../../model/user/user-model")
const bcrypt = require("bcrypt")
const OTP = require("../../model/user/otp-model")
// const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")


const home = async (req, res) => {
  try {
    res.status(200).send("Welcome to ScrapSathi platform ")
  } catch (error) {
    console.log(error)
  }
}

const register = async (req, res) => {
  try {
    const { name, phone, password,address, wasteType,  otpVerified, email, userType, termsAccepted, companyName, businessLicenseNo, recyclingCapabilities } = req.body;
    
    if (!termsAccepted) {
      return res.status(400).json({ message: "You must accept the Terms and Conditions to register." });
    }
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists', });
    }

    // const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    // if (response.length === 0 || otp !== response[0].otp) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'The OTP is not valid',
    //   });
    // }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Hashing password error ` + error.message,
      });
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      address,
      userType,
      otpVerified: otpVerified,
      termsAccepted,
      companyName: userType !== "individual" ? companyName : undefined,
      businessLicenseNo: userType !== "individual" ? businessLicenseNo : undefined,
      wasteType: userType === "big-organization" ? wasteType : undefined,
      recyclingCapabilities: userType === "recycle-company" ? recyclingCapabilities : undefined,
    });

    console.log(req.body)
    await newUser.save();
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({error: "User not found"});
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({
      userId: user._id,
      email: user.email,
      userType: user.userType || 'individual',
      name: user.name || 'user',
      phone: user.phone || ''
    },
      `${process.env.JWT_SECRET || 'achhaLol'}`,
      {
        expiresIn: '24h'
      })
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000
    })
    console.log("Generated JWT Token:", token);
    console.log(user);
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    console.log(req.body);
    // Check if all details are provided
    if (!email || !password || !otp) {
      console.log('input error');
      return res.status(403).json({
        success: false,
        message: 'All fields are required',
      });
    }
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (response.length === 0 || otp !== response[0].otp) {
      console.log('otp error');
      return res.status(400).json({
        success: false,
        message: 'The OTP is not valid',
      });
    }
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);

    } catch (error) {
      console.log('password error');
      return res.status(500).json({
        success: false,
        message: `Hashing password error for ${password}: ` + error.message,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.log('user error');
      return res.status(404).json({ error: "User not found" });
    }
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// LOGIC TO SEND USER DATA IN CONTACT US FORM
const user = async (req, res) => {
  try {
    const userData = req.user;
    console.log(userData);
    return res.status(200).json({ userData })
  } catch (error) {
    console.log(`Error from the user route: ${error}`);
  }
}

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("User from getProfile:", user);
    res.json(user);
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { email} = req.body;
    const updatedData = req.body;
    // const user = await User.findById(req.user._id);
    const updatedProfile = await User.findOneAndUpdate({ email }, updatedData, { new: true });
    // if (!user) return res.status(404).json({ message: "User not found" });
    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = { home, register, login, user, 
  updatePassword, getProfile, updateUserProfile };