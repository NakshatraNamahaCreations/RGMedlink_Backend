const express = require("express");
const router = express.Router();

const {
  createPatientDetails,
  getPatientDetails,
  getPatientDetailsById,
  updatePatientDetails,
  deletePatientDetails
} = require("../controllers/patientDetailsController");

router.post("/create", createPatientDetails);
router.get("/", getPatientDetails);
router.get("/:id", getPatientDetailsById);
router.put("/:id", updatePatientDetails);
router.delete("/:id", deletePatientDetails);

module.exports = router;