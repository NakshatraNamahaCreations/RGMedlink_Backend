const Medicine = require("../models/Medicine");





/* ===============================
   CREATE MEDICINE
================================ */

exports.createMedicine = async (req, res) => {

  try {

    const medicine = await Medicine.create(req.body);

    res.status(201).json(medicine);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};





/* ===============================
   GET ALL MEDICINES
================================ */

exports.getMedicines = async (req, res) => {

  const medicines = await Medicine.find();

  res.json(medicines);

};





/* ===============================
   GET SINGLE MEDICINE
================================ */

exports.getMedicineById = async (req, res) => {

  const medicine = await Medicine.findById(req.params.id);

  res.json(medicine);

};





/* ===============================
   UPDATE MEDICINE
================================ */

exports.updateMedicine = async (req, res) => {

  const medicine = await Medicine.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(medicine);

};





/* ===============================
   DELETE MEDICINE
================================ */

exports.deleteMedicine = async (req, res) => {

  await Medicine.findByIdAndDelete(req.params.id);

  res.json({ message: "Medicine deleted" });

};





/* ===============================
   ADJUST STOCK
================================ */

exports.adjustStock = async (req, res) => {

  try {

    const { type, quantity } = req.body;

    const medicine = await Medicine.findById(req.params.id);

    if (!medicine)
      return res.status(404).json({ message: "Medicine not found" });

    const qty = Number(quantity);

    if (type === "add") {
      medicine.stock += qty;
    }

    if (type === "reduce") {

      if (medicine.stock < qty)
        return res.status(400).json({ message: "Insufficient stock" });

      medicine.stock -= qty;
    }

    await medicine.save();

    res.json({
      message: "Stock updated successfully",
      medicine
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};