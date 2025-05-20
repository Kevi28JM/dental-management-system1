const express = require("express");
const router = express.Router();
const PDFDocument = require('pdfkit');
const reportModel = require("../models/report");
const fs = require('fs');

// Helper function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

router.get("/appointment-report", async (req, res) => {
  try {
    const report = await reportModel.getAppointmentReport();
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch report", error });
  }
});

router.get('/appointment-report/pdf', async (req, res) => {
  try {
    const response = await fetch("http://localhost:5000/api/reports/appointment-report");
    const result = await response.json();

    if (!result.success) {
      return res.status(500).json({ message: 'Failed to fetch report data' });
    }

    const report = result.data;
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    // Set headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Family_Dental_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    doc.pipe(res);

    // Add logo (replace with your actual logo path)
    if (fs.existsSync('./public/images/logo.png')) {
      doc.image('./public/images/logo.png', 40, 30, { width: 60 });
    }

    // Header
    doc.fillColor('#2b6cb0') // Blue color
       .fontSize(20)
       .text('Family Dental Surgery', { align: 'center' });
    
    doc.fillColor('#4a5568') // Dark gray
       .fontSize(16)
       .text('Appointment Revenue Report', { align: 'center' });
    
    doc.fillColor('#718096') // Light gray
       .fontSize(10)
       .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    
    doc.moveDown(2);

    // Table header
    const tableTop = 150;
    const col1 = 50;
    const col2 = 250;
    const col3 = 400;
    
    doc.fillColor('#ffffff')
       .rect(col1-10, tableTop-20, 500, 20)
       .fill('#2b6cb0')
       .fillColor('#ffffff')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Appointment ID', col1, tableTop-15)
       .text('Date', col2, tableTop-15)
       .text('Payment (Rs)', col3, tableTop-15, { width: 100, align: 'right' });

    // Table rows
    let i = 0;
    let currentY = tableTop + 5;
    
    report.report.forEach(row => {
      if (i % 2 === 0) {
        doc.fillColor('#f7fafc') // Light blue-gray background
           .rect(col1-10, currentY-5, 500, 20)
           .fill();
      }
      
      doc.fillColor('#2d3748') // Dark text
         .font('Helvetica')
         .fontSize(10)
         .text(row.appointmentId, col1, currentY)
         .text(formatDate(row.date), col2, currentY)
         .text(row.payment.toFixed(2), col3, currentY, { width: 100, align: 'right' });
      
      currentY += 20;
      i++;
    });

    // Summary section
    doc.moveDown(2);
    doc.fillColor('#2b6cb0')
       .font('Helvetica-Bold')
       .fontSize(12)
       .text('Summary', { underline: true });
    
    doc.moveDown(0.5);
    doc.fillColor('#4a5568')
       .text(`Total Appointments: ${report.totalAppointments}`, { indent: 20 });
    
    doc.fillColor('#38a169') // Green for revenue
       .text(`Total Revenue: Rs ${report.totalRevenue.toFixed(2)}`, { indent: 20 });
    
    // Footer
    doc.page.margins.bottom = 0;
    doc.fontSize(8)
       .fillColor('#718096')
       .text('Confidential - Family Dental Surgery', 40, doc.page.height - 40, {
         align: 'center',
         width: 500
       });

    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating PDF',
      error: error.message 
    });
  }
});

module.exports = router;