const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
{
  name: { type: String, required: true },
  category: String,
  price: { type: Number, default: 0 },

  stock: { type: Number, default: 0 },        // current stock
  minStock: { type: Number, default: 10 },    // minimum stock
  maxStock: { type: Number, default: 200 },

  expiry: Date,

  demand30: { type: Number, default: 0 },     // 30 day usage
  demand90: { type: Number, default: 0 },     // 90 day usage

  gstPct: { type: Number, default: 12 }
},
{ timestamps: true }
);





/* ===============================
   STATUS CALCULATION
================================ */

medicineSchema.virtual("status").get(function () {

  if (this.stock <= this.minStock * 0.5)
    return "Critical";

  if (this.stock <= this.minStock)
    return "Low Stock";

  return "In Stock";
});





/* ===============================
   AUTO REORDER QUANTITY
================================ */

medicineSchema.virtual("autoReorderQty").get(function () {

  if (this.stock >= this.minStock)
    return 0;

  return this.minStock + 20 - this.stock;
});





/* ===============================
   DAYS UNTIL STOCKOUT
================================ */

medicineSchema.virtual("daysUntilStockout").get(function () {

  const dailyUsage = this.demand30 / 30;

  if (dailyUsage === 0)
    return "∞";

  return Math.floor(this.stock / dailyUsage);
});





medicineSchema.set("toJSON", { virtuals: true });
medicineSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Medicine", medicineSchema);