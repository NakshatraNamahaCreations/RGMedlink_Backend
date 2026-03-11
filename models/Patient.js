const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
{
  patientId: {
    type: String,
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  age: {
    type: Number
  },

  gender: {
    type: String,
    enum: ["Male", "Female", "Other"]
  },

  phone: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/ // 10 digit validation
  },

  email: {
    type: String
  },

  address: {
    type: String
  },

  city: {
    type: String
  },

  state: {
    type: String
  },

  pincode: {
    type: String
  },

  condition: {
    type: String
  },

  emergencyContact: {
    type: String
  },

  since: {
    type: Date
  },

  adherence: {
    type: Number
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);