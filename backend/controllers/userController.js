const User = require("../models/userModel");
const PendingDoctor = require("../models/pendingDoctorModel");
const jwt = require("jsonwebtoken");
const { putObjectURL } = require("../utils/awsutils");

const createToken = (_id, role) => {
  return jwt.sign({ _id, role }, process.env.SECRET, { expiresIn: "3d" });
};
// login a user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);

    //create a token
    const token = createToken(user._id, user.role);
    //token=header(algo)+payload(id)+secret
    res.status(200).json({ email, role: user.role, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// signup a user
const signupUser = async (req, res) => {
  const { email, password, role, licenseNo, licensePicture } = req.body;

  try {
    if (role === "doctor") {
      const uploadURL = await putObjectURL(
        `license-${Date.now()}.jpeg`,
        "image/jpeg"
      );

      // Save to PendingDoctor collection
      const pendingDoctor = new PendingDoctor({
        email,
        password,
        role,
        licenseNo,
        licensePicture: uploadURL,
      });
      await pendingDoctor.save();
      return res.status(200).json({
        message: "Registration pending admin approval",
        uploadURL,
      });
    }

    const user = await User.signup(email, password, role, licenseNo);
    //create a token
    const token = createToken(user._id, user.role);
    //token=header(algo)+payload(id)+secret
    res
      .status(200)
      .json({ email, role: user.role, licenseNo: user.licenseNo, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { signupUser, loginUser };
