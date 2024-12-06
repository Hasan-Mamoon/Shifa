const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "doctor", "patient"],
    required: true,
  },
  licenseNo: {
    type: String,
    unique: true,
    sparse: true,
  },
});

// static signup method
userSchema.statics.signup = async function (email, password, role, licenseNo) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  //validate fields
  if (!email || !password || !role) {
    throw Error("All fields must be filled");
  }
  if (role === "doctor" && !licenseNo) {
    throw Error("licenseNo is required for doctors");
  }

  // validate email format
  if (!emailPattern.test(email)) {
    throw Error("Email format is not valid");
  }

  // Split and check email domain parts
  const emailParts = email.split("@");
  if (emailParts.length !== 2) {
    throw Error("Invalid email structure");
  }

  const [localPart, domain] = emailParts;
  const domainParts = domain.split(".");

  // check for invalid domain
  const domainString = domainParts.join(".");
  if (/(\.\w+)\1/.test(domainString)) {
    throw Error("Email contains repetitive domain patterns like .com.com");
  }

  // Check local part length
  if (localPart.length < 2 || localPart.length > 64) {
    throw Error("Email local part must be between 2 and 64 characters long");
  }

  // Check domain parts length and number
  if (
    domainParts.length < 2 ||
    domainParts.some((part) => part.length < 2 || part.length > 63)
  ) {
    throw Error("Invalid email domain structure");
  }

  // Stronger email validations for TLD and subdomains
  const tld = domainParts[domainParts.length - 1];
  if (!/^[a-zA-Z]{2,}$/.test(tld)) {
    throw Error("Invalid top-level domain in email");
  }

  // Additional checks using validator
  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }

  // Password strength validation
  if (!validator.isStrongPassword(password)) {
    throw Error("Password is not strong enough");
  }

  //unique constraints
  if (role === "doctor" && (await this.findOne({ licenseNo }))) {
    throw Error("licenseNo already in use");
  }
  if (!["admin", "doctor", "patient"].includes(role)) {
    throw Error("Invalid role");
  }

  const exists = await this.findOne({ email });

  if (exists) {
    throw Error("Email already in use");
  }

  // Hash password and create user
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({ email, password: hash, role, licenseNo });
  return user;
};

//static login method
userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields must be filled");
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw Error("Incorrect email");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect password");
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
