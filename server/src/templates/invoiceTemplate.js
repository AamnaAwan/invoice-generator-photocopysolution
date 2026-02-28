const dayjs = require("dayjs");

function invoiceTemplate(data) {
  const {
    invoiceNumber,
    customerName,
    customerPhone,
    items,
    subtotal,
    tax,
    discount,
    total,
  } = data;

  const rows = items.map(item => `
      <tr>
        <td>${item.service}</td>
        <td>${item.size}</td>
        <td>${item.quantity}</td>
        <td>${item.price.toFixed(2)}</td>
        <td>${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
  `).join("");

  return `
  <html>
  <head>
    <style>
      body { font-family: Arial; padding:40px; color:#0F172A; }
      .header { display:flex; justify-content:space-between; }
      .logo { font-size:24px; font-weight:bold; color:#1E3A8A; }
      table { width:100%; border-collapse:collapse; margin-top:20px; }
      th { background:#1E3A8A; color:white; padding:10px; }
      td { padding:10px; border-bottom:1px solid #ddd; }
      .totals { width:40%; float:right; margin-top:20px; }
      .grand { background:#3B82F6; color:white; font-weight:bold; }
    </style>
  </head>
  <body>

    <div class="header">
      <div class="logo">🖨 PRINTFLOW</div>
      <div>
        <strong>Invoice:</strong> ${invoiceNumber}<br/>
        <strong>Date:</strong> ${dayjs().format("DD/MM/YYYY")}
      </div>
    </div>

    <p><strong>Customer:</strong> ${customerName}<br/>
       <strong>Phone:</strong> ${customerPhone}</p>

    <table>
      <thead>
        <tr>
          <th>Service</th>
          <th>Size</th>
          <th>Qty</th>
          <th>Unit</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <table class="totals">
      <tr><td>Subtotal</td><td>${subtotal.toFixed(2)}</td></tr>
      <tr><td>Tax</td><td>${tax.toFixed(2)}</td></tr>
      <tr><td>Discount</td><td>${discount.toFixed(2)}</td></tr>
      <tr class="grand"><td>Total</td><td>${total.toFixed(2)}</td></tr>
    </table>

  </body>
  </html>
  `;
}

module.exports = invoiceTemplate;