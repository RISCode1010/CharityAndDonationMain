const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Charity/Organization schema
const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username:{
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  // mission: {
  //   type: String,
  // },
  description: {
    type: String,
    trim: true,
  },
  registrationNumber: {
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
    default: "organization",
  },
  campaigns: [          //==============
    {
      type: mongoose.Types.ObjectId,
      ref: "Campaign",
    },
  ],
  contact: {
    email: {
      type: String,
      required: true,
    },
    phoneNumber: String,
    address: {
      // street: String,
      city: String,
      state: String,
      // postalCode: String,
      country: String,
    },
    // website: String,
  },
  // socialMediaLinks: {
  //   facebook: String,
  //   twitter: String,
  //   instagram: String,
  //   linkedin: String,
  // },
});


organizationSchema.methods.getJwtToken = function () {
  const token = jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET);
  return token;
};

organizationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 10);
});

organizationSchema.methods.comparePassword = async function (enteredPassword) {
  const validPassword = await bcrypt.compare(enteredPassword, this.password);
  return validPassword;
};

// Charity/Organization model
const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
