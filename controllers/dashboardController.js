const Medicine = require("../models/Medicine");
const Patient = require("../models/Patient");
const Prescription = require("../models/Prescription");

exports.getDashboardSummary = async (req, res) => {
  try {

    /* =============================
       BASIC COUNTS
    ============================== */

    const totalUsers = await Patient.countDocuments();
    const totalOrders = await Prescription.countDocuments();
    const pendingPres = await Prescription.countDocuments({ status: "Pending" });



    /* =============================
       MEDICINE DATA
    ============================== */

    const medicines = await Medicine.find();

    const totalSKUs = medicines.length;

    const criticalStock = medicines.filter(
      (m) => m.stock <= m.minStock * 0.5
    ).length;

    const lowStockItems = medicines.filter(
      (m) => m.stock <= m.minStock && m.stock > m.minStock * 0.5
    ).length;



    /* =============================
       REORDER COST CALCULATION
    ============================== */

    const reorderCost = medicines.reduce((sum, m) => {

      if (m.stock < m.minStock) {

        const reorderQty = m.minStock - m.stock;

        return sum + reorderQty * (m.price || 0);

      }

      return sum;

    }, 0);



    /* =============================
       GRAPH DATA
       (30 Day Demand vs Stock)
    ============================== */

    const graphData = medicines.map((m) => ({
      name: m.name,
      demand: m.demand30 || 0,
      stock: m.stock
    }));



    /* =============================
       EXPIRY RISK MONITOR
    ============================== */

    const today = new Date();

    const expiryRisk = medicines.map((m) => {

      if (!m.expiry) return null;

      const diffDays =
        (new Date(m.expiry) - today) /
        (1000 * 60 * 60 * 24);

      let risk = "LOW";

      if (diffDays < 30) risk = "HIGH";
      else if (diffDays < 90) risk = "MEDIUM";

      return {
        name: m.name,
        expiry: m.expiry,
        stock: m.stock,
        risk,
        remainingDays: Math.floor(diffDays)
      };

    }).filter(Boolean);



    /* =============================
       TOTAL REVENUE
    ============================== */

    const totalRevenue = await Prescription.aggregate([
      { $match: { payStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);



    /* =============================
       FINAL RESPONSE
    ============================== */

    res.json({

      /* Old dashboard data */
      totalUsers,
      totalOrders,
      pendingPres,
      totalRevenue: totalRevenue[0]?.total || 0,

      /* Inventory dashboard */
      totalSKUs,
      criticalStock,
      lowStockItems,
      reorderCost,

      graphData,
      expiryRisk,

      medicines

    });

  }

  catch (err) {

    res.status(500).json({ error: err.message });

  }
};