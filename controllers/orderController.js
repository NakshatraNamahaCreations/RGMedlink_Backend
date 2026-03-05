const Order = require("../models/Order");
const Prescription = require("../models/Prescription");


/* =====================================
   GET BILLING TABLE (FOR UI)
===================================== */

exports.getBillingTable = async (req, res) => {
  try {

    const orders = await Order.find()
      .populate("patient")
      .populate("prescription")
      .sort({ createdAt: -1 });

    const table = orders.map(o => ({
      id: o._id,
      orderId: o.orderId,
      invoiceNumber: o.invoiceStatus === "Generated" ? o.invoiceNumber : "-",
      invoiceDate: o.invoiceDate || "-",
      customerName: o.patient?.name || "Unknown",
      billAmount: o.totalAmount,
      invoiceStatus: o.invoiceStatus,
      paymentStatus: o.paymentStatus
    }));

    res.json(table);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/* =====================================
   GET ALL ORDERS
===================================== */

exports.getOrders = async (req, res) => {
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
};



/* =====================================
   GET SINGLE ORDER (DETAIL PAGE)
===================================== */

exports.getOrderById = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id)
      .populate("patient")
      .populate({
        path: "prescription",
        populate: { path: "meds.medicine" }
      });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.json(order);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/* =====================================
   GENERATE INVOICE
===================================== */

exports.generateInvoice = async (req, res) => {

  try {

    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.invoiceStatus === "Generated") {
      return res.json({
        message: "Invoice already generated",
        order
      });
    }

    order.invoiceStatus = "Generated";
    order.invoiceDate = new Date();

    await order.save();

    res.json({
      message: "Invoice generated successfully",
      order
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

};



/* =====================================
   UPDATE ORDER STATUS
===================================== */

exports.updateOrderStatus = async (req, res) => {

  try {

    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { returnDocument: "after" }
    );

    res.json(order);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

};