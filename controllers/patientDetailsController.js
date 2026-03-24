const PatientDetails = require("../models/PatientDetails");


// CREATE
exports.createPatientDetails = async (req, res) => {
  try {

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const data = await PatientDetails.create(req.body);

    res.status(201).json({
      message: "Patient details saved",
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to save patient details",
      error: error.message
    });
  }
};


// GET ALL (USER BASED)
exports.getPatientDetails = async (req, res) => {
  try {

    const data = await PatientDetails.find({
      userId: req.query.userId
    }).sort({ createdAt: -1 });

    res.json(data);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch patient details",
      error: error.message
    });
  }
};


// GET SINGLE
exports.getPatientDetailsById = async (req, res) => {
  try {

    const data = await PatientDetails.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching data",
      error: error.message
    });
  }
};


// UPDATE
exports.updatePatientDetails = async (req, res) => {
  try {

    const data = await PatientDetails.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({
      message: "Updated successfully",
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Update failed",
      error: error.message
    });
  }
};


// DELETE
exports.deletePatientDetails = async (req, res) => {
  try {

    const data = await PatientDetails.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Deleted successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
      error: error.message
    });
  }
};