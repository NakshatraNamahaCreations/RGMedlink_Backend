require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const addressRoutes = require("./routes/addressRoutes");
const reportRoutes = require("./routes/reportRoutes");
const otpRoutes = require("./routes/otpRoutes");
const patientDetailsRoutes = require("./routes/patientDetailsRoutes");

const medicineRoutes = require("./routes/medicineRoutes");
const patientRoutes = require("./routes/patientRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");

connectDB();

const app = express();


app.use(cors());
app.use(express.json());

/* ROUTES */
app.use("/api/medicines", medicineRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/patient-details", patientDetailsRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("RG Medlink API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});