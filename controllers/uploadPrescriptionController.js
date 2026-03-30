const Prescription = require("../models/Prescription");
const Medicine = require("../models/Medicine");
const fs = require("fs");

const extractTextFromPDF = require("../utils/pdfReader");
const generateStyledPDF = require("../utils/generateStyledPDF");

// ============================
// UPLOAD & AUTO CREATE
// ============================

exports.processPDFPrescription = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body); // 🔥 DEBUG

    // ✅ Check file
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // ✅ Check patientId
    if (!req.body.patientId) {
      return res.status(400).json({
        message: "patientId is required",
      });
    }

    const filePath = req.file.path;

    // ✅ Extract text from PDF
    const text = await extractTextFromPDF(filePath);
    console.log("EXTRACTED TEXT:", text);

    // ✅ Get medicines from DB
    const medicines = await Medicine.find();

    const foundMedicines = medicines.filter((med) =>
      text.includes(med.name.toLowerCase())
    );

    if (foundMedicines.length === 0) {
      return res.json({
        message: "No medicines matched",
        extractedText: text,
      });
    }

    // ✅ Convert to prescription format
    const processedMeds = foundMedicines.map((med) => {
      const duration = 5; // default
      const freq = { m: 1, a: 0, n: 1 }; // default

      const daily = freq.m + freq.a + freq.n;
      const qty = daily * duration;
      const subtotal = qty * med.price;

      return {
        medicine: med._id,
        duration,
        freq,
        qty,
        price: med.price,
        subtotal,
      };
    });

    // ✅ Calculate totals
    const subtotal = processedMeds.reduce((sum, m) => sum + m.subtotal, 0);
    const gst = subtotal * 0.12;
    const total = subtotal + gst;

    // ✅ Create prescription (FIXED HERE 🔥)
    const newPrescription = await Prescription.create({
      rxId: `RX-${Date.now()}`,
      patient: req.body.patientId, // ✅ IMPORTANT FIX
      doctor: "Auto Generated",
      start: new Date(),
      expiry: new Date(),
      subtotal,
      gst,
      discount: 0,
      total,
      payStatus: "Unpaid",
      orderStatus: "Pending",
      meds: processedMeds,
    });

    // ✅ Generate styled PDF
    const outputPath = `uploads/output-${Date.now()}.pdf`;
    generateStyledPDF(foundMedicines, outputPath);

    // ✅ Delete uploaded file
    fs.unlinkSync(filePath);

    res.json({
      message: "Prescription created from PDF",
      prescription: newPrescription,
      pdf: outputPath,
    });

  } catch (error) {
    console.error("UPLOAD PDF ERROR:", error);

    res.status(500).json({
      message: "Error processing PDF",
      error: error.message,
    });
  }
};