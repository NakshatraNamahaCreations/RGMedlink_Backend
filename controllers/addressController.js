import Address from "../models/Address.js";

export const saveAddress = async (req, res) => {
  try {
    const address = new Address(req.body);
    const saved = await address.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.params.userId });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const updated = await Address.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;

    // 🔥 CHECK MINIMUM LIMIT
    const count = await Address.countDocuments({
      userId: req.body.userId,
    });

    if (count <= 1) {
      return res.status(400).json({
        message: "At least one address is required",
      });
    }

    await Address.findByIdAndDelete(addressId);

    res.json({ message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

