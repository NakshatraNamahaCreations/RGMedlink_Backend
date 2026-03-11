const Patient = require("../models/Patient");


/* =====================================
   CREATE PATIENT
===================================== */

exports.createPatient = async (req, res) => {
  try {

    const count = await Patient.countDocuments();

    const patientId = "P" + String(count + 1).padStart(3, "0");

    const patient = await Patient.create({
      ...req.body,
      patientId
    });

    res.status(201).json(patient);

  } catch (error) {

    res.status(500).json({
      message: "Failed to create patient",
      error: error.message
    });

  }
};


/* =====================================
   GET ALL PATIENTS
===================================== */

exports.getPatients = async (req, res) => {
  try {

    const search = req.query.search || "";

    const patients = await Patient.find({
      name: { $regex: search, $options: "i" }
    }).sort({ createdAt: -1 });

    res.json(patients);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch patients",
      error: error.message
    });

  }
};


/* =====================================
   GET PATIENT BY ID
===================================== */

exports.getPatientById = async (req, res) => {
  try {

    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    res.json(patient);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching patient",
      error: error.message
    });

  }
};


/* =====================================
   UPDATE PATIENT
===================================== */

exports.updatePatient = async (req, res) => {
  try {

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // corrected option
    );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    res.json({
      message: "Patient updated successfully",
      data: patient
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to update patient",
      error: error.message
    });

  }
};


/* =====================================
   DELETE PATIENT
===================================== */

exports.deletePatient = async (req, res) => {
  try {

    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    res.json({
      message: "Patient deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to delete patient",
      error: error.message
    });

  }
};