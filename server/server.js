const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/generate-pdf", async (req, res) => {
  const { customer, date, items, total } = req.body;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial; padding: 40px; }
            h1 { color: #1e3a8a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #1e3a8a; color: white; padding: 8px; }
            td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            .total { text-align: right; margin-top: 20px; font-size: 18px; }
          </style>
        </head>
        <body>
          <h1>Photocopy Solutions</h1>
          <p><strong>Customer:</strong> ${customer}</p>
          <p><strong>Date:</strong> ${date}</p>
          <table>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
            ${items
              .map(
                (item) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${item.price}</td>
                <td>${item.qty * item.price}</td>
              </tr>
            `
              )
              .join("")}
          </table>
          <div class="total"><strong>Total: PKR ${total}</strong></div>
        </body>
      </html>
    `;

    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: "A4" });

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
  console.log(`Server running on http://localhost:${PORT}`);
});