const express = require("express");
const router = express.Router();

const controller = require("../controllers/patientController");

/* CREATE */
router.post("/", controller.createPatient);

/* GET ALL */
router.get("/", controller.getPatients);

/* GET BY ID */
router.get("/:id", controller.getPatientById);

/* UPDATE */
router.put("/:id", controller.updatePatient);

/* DELETE */
router.delete("/:id", controller.deletePatient);

module.exports = router;