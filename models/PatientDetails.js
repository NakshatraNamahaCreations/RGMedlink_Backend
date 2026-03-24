const mongoose = require("mongoose");

const patientDetailsSchema = new mongoose.Schema(
{
  userId: {
    type: String,
    required: true
  },

  name: {
    type: String,
    required: true
  },

  age: {
    type: Number
  },

  email: {
    type: String
  },

  gender: {
    type: String,
    enum: ["Male", "Female", "Other"]
  },

  orderingFor: {
    type: String,
    enum: ["myself", "someone"],
    default: "myself"
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("PatientDetails", patientDetailsSchema);