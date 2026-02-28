const puppeteer = require("puppeteer");
const invoiceTemplate = require("../templates/invoiceTemplate");

async function generateInvoicePDF(data) {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();
  const html = invoiceTemplate(data);

  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = { generateInvoicePDF };