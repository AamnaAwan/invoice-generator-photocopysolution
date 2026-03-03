const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const app = express();

// Use environment PORT on Render
const PORT = process.env.PORT || 5000;

// Allow only your Netlify frontend
app.use(cors({ origin: "https://photocopysolutions-invoice.netlify.app" }));
app.use(express.json());

// POST /generate-pdf
app.post("/generate-pdf", async (req, res) => {
  console.log("POST /generate-pdf called with body:", req.body); // Debug log

  const {
    customer,
    billedTo,
    date,
    items,
    shippingFee = 0,
    paymentStatus = "Unpaid",
    total
  } = req.body;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--no-zygote"
      ]
    });

    const page = await browser.newPage();

    // Convert logo to base64
    const logoPath = path.join(__dirname, "logo.png");
    let logoBase64 = "";
    if (fs.existsSync(logoPath)) {
      const logoFile = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoFile.toString("base64")}`;
    }

    const subTotal = items.reduce(
      (sum, item) => sum + item.qty * item.price,
      0
    );

    const html = `
      <html>
        <head>
          <style>
            body { font-family: "Segoe UI", sans-serif; padding: 40px; color: #1e3a8a; position: relative; }
            .watermark { position: fixed; top: 35%; left: 50%; transform: translate(-50%, -50%); opacity: 0.06; width: 400px; z-index: -1; }
            h1 { color: #1e3a8a; margin-bottom: 5px; }
            .subtitle { color: #555; margin-bottom: 25px; }
            .info { margin-bottom: 20px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #2563eb; color: white; padding: 10px; text-align: center; }
            td { border-bottom: 1px solid #e5e7eb; padding: 10px; text-align: center; }
            .summary { margin-top: 30px; text-align: right; font-size: 15px; }
            .summary strong { font-size: 18px; }
            .status { margin-top: 10px; font-weight: bold; color: ${
              paymentStatus === "Paid" ? "#16a34a" : "#dc2626"
            }; }
            .footer { margin-top: 60px; text-align: center; font-size: 14px; color: #1e3a8a; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          </style>
        </head>
        <body>
          ${logoBase64 ? `<img src="${logoBase64}" class="watermark" />` : ""}
          <h1>Photocopy Solutions</h1>
          <div class="subtitle">Professional Photocopy Machines & Services</div>
          <div class="info">
            <p><strong>Customer:</strong> ${customer}</p>
            <p><strong>Billed To:</strong> ${billedTo || "-"}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Payment Status:</strong> ${paymentStatus}</p>
          </div>
          <table>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price (PKR)</th>
              <th>Total</th>
            </tr>
            ${items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${item.price}</td>
                <td>${item.qty * item.price}</td>
              </tr>
            `).join("")}
          </table>
          <div class="summary">
            <div>Subtotal: PKR ${subTotal}</div>
            <div>Shipping Fee: PKR ${shippingFee}</div>
            <div class="status">Status: ${paymentStatus}</div>
            <br/>
            <strong>Total: PKR ${total}</strong>
          </div>
          <div class="footer">Thank you for trusting Photocopy Solutions.</div>
        </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=invoice.pdf",
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).send("PDF generation failed");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});