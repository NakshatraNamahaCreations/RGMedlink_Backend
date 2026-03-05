const Order = require("../models/Order");
const Medicine = require("../models/Medicine");

/* =========================
   SALES REPORT
========================= */

exports.getSalesSummary = async (req, res) => {
  try {

    const trend = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const totalSales = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      }
    ]);

    const result = totalSales[0] || { total: 0, orders: 0 };

    res.json({
      trend,
      summary: {
        totalSales: result.total,
        orders: result.orders,
        avgOrder: result.orders
          ? Math.round(result.total / result.orders)
          : 0
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sales report error" });
  }
};

/* =========================
   ORDERS REPORT
========================= */

exports.getOrdersTrend = async (req, res) => {
  try {

    /* GRAPH DATA */

    const trend = await Order.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          orders: { $sum: 1 },
          amount: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    /* SUMMARY */

    const total = await Order.countDocuments();
    const completed = await Order.countDocuments({ status: "Completed" });
    const pending = await Order.countDocuments({ status: "Pending" });
    const cancelled = await Order.countDocuments({ status: "Cancelled" });

    /* ORDERS TABLE DATA */

    const ordersList = await Order.find()
      .populate("patient", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    const table = ordersList.map(o => ({
      orderId: o.orderId,
      customer: o.patient?.name || "Guest",
      date: o.createdAt.toISOString().slice(0,10),
      amount: o.totalAmount,
      status: o.status
    }));

    res.json({
      trend,
      summary: {
        total,
        completed,
        pending,
        cancelled
      },
      table
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Orders report error" });
  }
};

/* =========================
   REVENUE REPORT
========================= */

exports.getRevenueTrend = async (req, res) => {
  try {

    const trend = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const total = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      }
    ]);

    const result = total[0] || { revenue: 0, orders: 0 };

    res.json({
      trend,
      summary: {
        total: result.revenue,
        paid: result.orders,
        avg: result.orders
          ? Math.round(result.revenue / result.orders)
          : 0
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Revenue report error" });
  }
};

/* =========================
   INVENTORY REPORT
========================= */

exports.getInventoryReport = async (req, res) => {
  try {

    const medicines = await Medicine.find();

    const total = medicines.length;

    const lowStock = medicines.filter(
      (m) => m.stock <= m.minStock
    ).length;

    res.json({
      summary: {
        total,
        lowStock
      },
      items: medicines
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Inventory report error" });
  }
};