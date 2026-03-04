const router = require("express").Router();
const controller = require("../controllers/prescriptionController");

// CRUD
router.post("/", controller.createPrescription);
router.get("/", controller.getPrescriptions);
router.get("/:id", controller.getPrescriptionById);
router.put("/:id", controller.updatePrescription);
router.delete("/:id", controller.deletePrescription);

// Extra Actions
router.patch("/:id/pay", controller.markPaid);
router.post("/:id/renew", controller.renewPrescription);

module.exports = router;