const express = require("express");
const router = express.Router();
const reportModel = require("../models/report");

router.get("/appointment-report", async (req, res) => {
  try {
    const report = await reportModel.getAppointmentReport();
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch report", error });
  }
});

module.exports = router;