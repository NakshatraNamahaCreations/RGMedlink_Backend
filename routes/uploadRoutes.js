const router = require("express").Router();
const multer = require("multer");

const uploadController = require("../controllers/uploadPrescriptionController");

const upload = multer({ dest: "uploads/" });

// ✅ DEBUG + ROUTE
router.post(
  "/upload-prescription",
  upload.single("file"),
  (req, res, next) => {
    console.log("BODY AFTER MULTER:", req.body); // 🔥 DEBUG
    next();
  },
  uploadController.processPDFPrescription
);

module.exports = router;