const Prescription = require("../models/Prescription");
const Medicine = require("../models/Medicine");
const Order = require("../models/Order");
const PatientDetails = require("../models/PatientDetails");

// ============================
// CREATE PRESCRIPTION
// ============================

exports.createPrescription = async (req, res) => {
  try {
    const { patient, doctor, start, discount = 0, meds } = req.body;
    
    if (!patient || !doctor || !start) {
      return res.status(400).json({
        message: "Patient, doctor and start date are required"
      });
    }

    if (!meds || meds.length === 0)
      return res.status(400).json({ message: "No medicines provided" });

    let subtotal = 0;
    let maxDuration = 0;
    const processedMeds = [];

    for (let m of meds) {
      const medDoc = await Medicine.findById(m.medicine);

      if (!medDoc)
        return res.status(404).json({ message: "Medicine not found" });

      const daily =
  (m.freq?.m || 0) +
  (m.freq?.a || 0) +
  (m.freq?.n || 0);

      const qty = daily * m.duration;

      if (medDoc.stock < qty)
        return res.status(400).json({
          message: `Insufficient stock for ${medDoc.name}`,
        });

      const sub = qty * medDoc.price;

      subtotal += sub;
      maxDuration = Math.max(maxDuration, m.duration);

      // Reduce stock
      medDoc.stock -= qty;
      await medDoc.save();

      processedMeds.push({
        medicine: medDoc._id,
        duration: m.duration,
        freq: m.freq,
        qty,
        price: medDoc.price,
        subtotal: sub,
      });
    }

    const gst = subtotal * 0.12;

    const total = subtotal + gst - discount;

    const expiryDate = new Date(start);
    expiryDate.setDate(expiryDate.getDate() + maxDuration);

    const rx = await Prescription.create({
      rxId: `RX-${Date.now()}`,
      patient,
      doctor,
      start,
      expiry: expiryDate,
      subtotal,
      gst,
      discount,
      total,
      payStatus: "Unpaid",
      orderStatus: "Pending",
      meds: processedMeds,
    });

    res.status(201).json(rx);

  } catch (err) {
  console.error("Create Prescription Error:", err);
  res.status(500).json({ error: err.message });
}
};



// ============================
// GET ALL PRESCRIPTIONS
// ============================

exports.getPrescriptions = async (req, res) => {
  try {

    const rx = await Prescription.find()
      .populate("patient")
      .populate("meds.medicine")
      .sort({ createdAt: -1 });

    res.json(rx);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ============================
// GET ONE PRESCRIPTION
// ============================

exports.getPrescriptionById = async (req, res) => {
  try {

    const rx = await Prescription.findById(req.params.id)
      .populate("patient")
      .populate("meds.medicine");

    if (!rx)
      return res.status(404).json({ message: "Prescription not found" });

    res.json(rx);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ============================
// UPDATE PRESCRIPTION
// ============================

exports.updatePrescription = async (req, res) => {
  try {

    const rx = await Prescription.findByIdAndUpdate(
  req.params.id,
  req.body,
  { returnDocument: "after" }
);

    if (!rx)
      return res.status(404).json({ message: "Prescription not found" });

    res.json(rx);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cleanUnusedPrescriptions = async (req, res) => {
  try {

    const result = await Prescription.deleteMany({
      $or: [
        { payStatus: "Unpaid" },
        { patient: null }
      ]
    });

    res.json({
      message: "Unused prescriptions deleted",
      deletedCount: result.deletedCount
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================
// DELETE PRESCRIPTION
// ============================

exports.deletePrescription = async (req, res) => {
  try {

    const rx = await Prescription.findByIdAndDelete(req.params.id);

    if (!rx)
      return res.status(404).json({ message: "Prescription not found" });

    res.json({ message: "Prescription deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ============================
// MARK PAYMENT AS PAID
// ALSO CREATE ORDER
// ============================

exports.processPayment = async (req, res) => {
  try {

    const rx = await Prescription.findById(req.params.id);

    if (!rx) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // 🔒 Prevent duplicate payment
    if (rx.payStatus === "Paid") {
      return res.status(400).json({ message: "Already paid" });
    }

    // ✅ Step 1: Mark as paid
    rx.payStatus = "Paid";
    rx.orderStatus = "Processing";
    await rx.save();

    // 🔒 Prevent duplicate order
    let existingOrder = await Order.findOne({ prescription: rx._id });

    if (existingOrder) {
      return res.json({
        message: "Order already exists",
        prescription: rx,
        order: existingOrder
      });
    }

    // ✅ Step 2: Create order
const patientData = await PatientDetails.findById(rx.patient);

const order = await Order.create({
  prescription: rx._id,
  patient: rx.patient,
  totalAmount: rx.total,
  paymentStatus: "Paid",
  orderStatus: "Processing",

  // ✅ REAL SNAPSHOT
  patientDetails: {
  name: patientData.name,
  primaryPhone: patientData.primaryPhone,
  secondaryPhone: patientData.secondaryPhone || "",
  gender: patientData.gender,
  orderingFor: patientData.orderingFor
},
  addressDetails: {} // you can add later
});
    res.json({
      message: "Payment processed & order created",
      prescription: rx,
      order
    });

  } catch (err) {
    console.error("PROCESS PAYMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};



// ============================
// RENEW PRESCRIPTION
// ============================

exports.renewPrescription = async (req, res) => {
  try {

    const oldRx = await Prescription.findById(req.params.id);

    if (!oldRx)
      return res.status(404).json({ message: "Prescription not found" });

    const newStart = new Date();

    const maxDuration = Math.max(
      ...oldRx.meds.map(m => m.duration)
    );

    const newExpiry = new Date(newStart);

    newExpiry.setDate(newExpiry.getDate() + maxDuration);

    const newRx = await Prescription.create({
      rxId: `RX-${Date.now()}`,
      patient: oldRx.patient,
      doctor: oldRx.doctor,
      start: newStart,
      expiry: newExpiry,
      subtotal: oldRx.subtotal,
      gst: oldRx.gst,
      discount: oldRx.discount,
      total: oldRx.total,
      payStatus: "Unpaid",
      orderStatus: "Pending",
      meds: oldRx.meds,
    });

    res.json(newRx);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};