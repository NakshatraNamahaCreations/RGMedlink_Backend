const Order = require("../models/Order");
const PatientDetails = require("../models/PatientDetails");
const Address = require("../models/Address");

exports.createOrder = async (req, res) => {
  try {
    const { patientId, addressId, prescriptionId, totalAmount } = req.body;

    if (!patientId || !prescriptionId || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // ✅ GET PATIENT
    const patient = await PatientDetails.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    const userId = patient.userId;

    // ✅ GET ADDRESS
    let address = addressId
      ? await Address.findById(addressId)
      : await Address.findOne({ userId, isDefault: true });

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address not found"
      });
    }

    // ✅ SNAPSHOT (FINAL FIX)
    const patientSnapshot = {
      name: patient.name,
      phone: patient.primaryPhone,
      secondaryPhone: patient.secondaryPhone || "",   // ✅ FIX
      gender: patient.gender,
      orderingFor: patient.orderingFor || "myself"    // ✅ FIX
    };

    const addressSnapshot = {
      fullAddress: address.fullAddress,
      city: address.city,
      state: address.state,
      pincode: address.pincode
    };

    const order = await Order.create({
      userId,
      prescription: prescriptionId,
      patient: patient._id,
      totalAmount,
      patientDetails: patientSnapshot,
      addressDetails: addressSnapshot,
      deliveryAddress: address.fullAddress
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Order creation failed",
      error: error.message
    });
  }
};



// ============================
// BILLING TABLE
// ============================
exports.getBillingTable = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    const table = orders.map(o => ({
      id: o._id,
      orderId: o.orderId || "-",
      invoiceNumber: o.invoiceStatus === "Generated" ? o.invoiceNumber : "-",
      invoiceDate: o.invoiceDate || "-",
      customerName: o.patientDetails?.name || "Unknown",
      billAmount: o.totalAmount || 0,
      invoiceStatus: o.invoiceStatus,
      paymentStatus: o.paymentStatus
    }));

    res.json({
      success: true,
      data: table
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ============================
// GET ALL ORDERS
// ============================
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "prescription",
        populate: { path: "meds.medicine" }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ============================
// GET SINGLE ORDER
// ============================
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: "prescription",
        populate: { path: "meds.medicine" }
      })
      .populate("patient"); // ✅ IMPORTANT FIX

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ============================
// GENERATE INVOICE
// ============================
exports.generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.invoiceStatus === "Generated") {
      return res.json({
        success: true,
        message: "Invoice already generated",
        order
      });
    }

    order.invoiceStatus = "Generated";
    order.invoiceDate = new Date();

    await order.save();

    res.json({
      success: true,
      message: "Invoice generated successfully",
      order
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ============================
// DELETE ORDER
// ============================
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order deleted successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.markPaymentPaid = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: "Paid",
        paymentDate: new Date()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Payment marked as Paid",
      data: order
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ============================
// UPDATE ORDER STATUS
// ============================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["Created", "Processing", "Packed", "Shipped", "Delivered"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};