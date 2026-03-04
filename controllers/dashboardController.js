const Medicine = require("../models/Medicine");
const Patient = require("../models/Patient");
const Prescription = require("../models/Prescription");

exports.getDashboardSummary = async (req, res) => {
  try {
    const totalUsers = await Patient.countDocuments();
    const totalOrders = await Prescription.countDocuments();
    const pendingPres = await Prescription.countDocuments({ status: "Pending" });

    const medicines = await Medicine.find();
    const lowStockItems = medicines.filter(
      (m) => m.stock <= m.minStock
    ).length;

    const totalRevenue = await Prescription.aggregate([
      { $match: { payStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    res.json({
      totalUsers,
      totalOrders,
      pendingPres,
      totalRevenue: totalRevenue[0]?.total || 0,
      lowStockItems,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};