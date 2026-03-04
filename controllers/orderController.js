const Order = require("../models/Order");
const Prescription = require("../models/Prescription");

/* CREATE ORDER AFTER PAYMENT */




/* GET ALL ORDERS */

exports.getOrders = async (req, res) => {

  const orders = await Order.find()
    .populate("patient")
    .populate({
      path: "prescription",
      populate: { path: "meds.medicine" }
    })
    .sort({ createdAt: -1 });

  res.json(orders);

};


/* UPDATE ORDER STATUS */

exports.updateOrderStatus = async (req, res) => {

  const { status } = req.body;

 const order = await Order.findByIdAndUpdate(
  req.params.id,
  { orderStatus: status },
  { returnDocument: "after" }
);

  res.json(order);
};