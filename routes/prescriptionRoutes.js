const router = require("express").Router();
const controller = require("../controllers/prescriptionController");

// ✅ CLEANUP FIRST
router.delete("/cleanup", controller.cleanUnusedPrescriptions);

// CRUD
router.post("/", controller.createPrescription);
router.get("/", controller.getPrescriptions);
router.get("/:id", controller.getPrescriptionById);
router.put("/:id", controller.updatePrescription);
router.delete("/:id", controller.deletePrescription);

// Extra Actions
router.post("/:id/renew", controller.renewPrescription);
router.post("/:id/process-payment", controller.processPayment);

module.exports = router;