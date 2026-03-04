require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

/* ROUTES */

app.use("/api/medicines", require("./routes/medicineRoutes"));
app.use("/api/patients", require("./routes/patientRoutes"));
app.use("/api/prescriptions", require("./routes/prescriptionRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

/* NEW ORDER ROUTE */

app.use("/api/orders", require("./routes/orderRoutes"));

app.get("/", (req, res) => {
  res.send("RG Medlink API Running");
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);