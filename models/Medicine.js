const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: String,
    price: Number,

    stock: { type: Number, default: 0 },          // current stock
    minStock: { type: Number, default: 10 },     // low stock threshold
    maxStock: Number,

    expiry: String,
    interactions: [Number],
    gstPct: { type: Number, default: 12 },
  },
  { timestamps: true }
);

/* 🔥 Virtual Status (Auto Low Stock Detection) */
medicineSchema.virtual("status").get(function () {
  return this.stock <= this.minStock
    ? "Low Stock"
    : "In Stock";
});

medicineSchema.set("toJSON", { virtuals: true });
medicineSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Medicine", medicineSchema);