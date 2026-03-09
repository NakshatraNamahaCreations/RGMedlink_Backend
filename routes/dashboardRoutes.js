const router = require("express").Router();
const controller = require("../controllers/dashboardController");

/* Main Dashboard */
router.get("/summary", controller.getDashboardSummary);

module.exports = router;