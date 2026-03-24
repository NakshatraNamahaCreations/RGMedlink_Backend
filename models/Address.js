  import mongoose from "mongoose";

  const addressSchema = new mongoose.Schema({
    userId: String,
    type: String,

    house: String,
    street: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String,

    fullAddress: String,

    latitude: Number,
    longitude: Number,
  });

  export default mongoose.model("Address", addressSchema);