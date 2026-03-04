const router = require("express").Router();
const controller = require("../controllers/dashboardController");

router.get("/summary", controller.getDashboardSummary);

module.exports = router;