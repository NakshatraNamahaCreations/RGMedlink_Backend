const express = require("express");
const router = express.Router();

const {
  createOrder,
  getBillingTable,
  getOrders,
  getOrderById,
  generateInvoice,
  updateOrderStatus,
  deleteOrder,
  markPaymentPaid   
} = require("../controllers/orderController");

// CREATE ORDER
router.post("/create", createOrder);

// BILLING TABLE
router.get("/billing", getBillingTable);

// GET ALL ORDERS
router.get("/", getOrders);

// GET SINGLE ORDER
router.get("/:id", getOrderById);
// ADD THIS 👇
router.patch("/:id/pay", markPaymentPaid);
// GENERATE INVOICE
router.patch("/:id/invoice", generateInvoice);

router.delete("/:id", deleteOrder);
// UPDATE STATUS
router.patch("/:id/status", updateOrderStatus);

module.exports = router;