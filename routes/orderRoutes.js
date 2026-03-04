const express = require("express");

const router = express.Router();

const Order = require("../models/Order");


// ============================
// GET ALL ORDERS
// ============================

router.get("/", async (req, res) => {
  try {

    const orders = await Order.find()
      .populate("patient")
     .populate({
  path: "prescription",
  populate: { path: "meds.medicine" }
})
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ============================
// GET SINGLE ORDER
// ============================

router.get("/:id", async (req, res) => {
  try {

    const order = await Order.findById(req.params.id)
      .populate("patient")
      .populate("prescription");

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.json(order);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ============================
// UPDATE ORDER STATUS
// ============================

router.patch("/:id/status", async (req, res) => {
  try {

    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.json(order);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;