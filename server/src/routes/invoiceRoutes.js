const express = require("express");
const router = express.Router();
const { generateInvoicePDF } = require("../services/pdfService");

router.post("/generate", async (req, res) => {
  try {
    const pdfBuffer = await generateInvoicePDF(req.body);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=invoice.pdf",
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "PDF generation failed" });
  }
});

module.exports = router;