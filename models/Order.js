const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
{
  orderId: {
    type: String,
    unique: true,
  },

  invoiceNumber: {
    type: String,
    unique: true,
  },

  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prescription",
    required: true,
  },

  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },

  totalAmount: {
    type: Number,
    required: true,
  },

  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending",
  },

  orderStatus: {
    type: String,
    enum: ["Created", "Processing", "Packed", "Shipped", "Delivered"],
    default: "Created",
  },

  deliveryAddress: {
    type: String,
    default: "",
  },

  deliveredAt: {
    type: Date,
  },

},
{ timestamps: true }
);


// ================================
// AUTO GENERATE ORDER + INVOICE
// ================================

orderSchema.pre("save", function () {

  if (!this.orderId) {
    this.orderId = "ORD-" + Date.now();
  }

  if (!this.invoiceNumber) {
    this.invoiceNumber = "INV-" + Date.now();
  }

});
// ================================
// EXPORT MODEL
// ================================

module.exports = mongoose.model("Order", orderSchema);