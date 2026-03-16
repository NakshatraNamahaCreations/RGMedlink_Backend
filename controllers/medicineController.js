const Medicine = require("../models/Medicine");



/* ===============================
   CREATE MEDICINE
================================ */

exports.createMedicine = async (req,res)=>{

  try{

    const data = req.body;

    if(data.status === "Inactive" && !data.inactiveReason){
      return res.status(400).json({
        message:"Reason required for inactive medicine"
      });
    }

    const medicine = await Medicine.create(data);

    res.status(201).json(medicine);

  }
  catch(error){
    res.status(500).json({error:error.message});
  }

};





/* ===============================
   GET ALL MEDICINES
================================ */

exports.getMedicines = async (req,res)=>{

  try{

    const medicines = await Medicine
      .find()
      .sort({ createdAt: -1 });

    res.json(medicines);

  }
  catch(error){
    res.status(500).json({error:error.message});
  }

};





/* ===============================
   GET SINGLE MEDICINE
================================ */

exports.getMedicineById = async (req,res)=>{

  try{

    const medicine = await Medicine.findById(req.params.id);

    res.json(medicine);

  }
  catch(error){
    res.status(500).json({error:error.message});
  }

};





/* ===============================
   UPDATE MEDICINE
================================ */

exports.updateMedicine = async (req,res)=>{

  try{

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new:true }
    );

    res.json(medicine);

  }
  catch(error){
    res.status(500).json({error:error.message});
  }

};





/* ===============================
   DELETE MEDICINE
================================ */

exports.deleteMedicine = async (req,res)=>{

  try{

    await Medicine.findByIdAndDelete(req.params.id);

    res.json({
      message:"Medicine deleted successfully"
    });

  }
  catch(error){
    res.status(500).json({error:error.message});
  }

};





/* ===============================
   ADJUST STOCK
================================ */

exports.adjustStock = async (req,res)=>{

  try{

    const { type, quantity } = req.body;

    const medicine = await Medicine.findById(req.params.id);

    if(!medicine)
      return res.status(404).json({message:"Medicine not found"});

    const qty = Number(quantity);

    if(type === "add"){
      medicine.stock += qty;
    }

    if(type === "reduce"){

      if(medicine.stock < qty)
        return res.status(400).json({message:"Insufficient stock"});

      medicine.stock -= qty;

      /* update demand */

      medicine.demand30 += qty;
      medicine.demand90 += qty;

    }

    await medicine.save();

    res.json({
      message:"Stock updated successfully",
      medicine
    });

  }
  catch(error){
    res.status(500).json({error:error.message});
  }

};