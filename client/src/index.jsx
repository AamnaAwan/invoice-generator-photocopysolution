import { useState } from "react";
import "./App.css";
import logo from "./assets/logo.png";

function App() {
  const [customer, setCustomer] = useState("");
  const [billedTo, setBilledTo] = useState("");
  const [date, setDate] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");

  const [items, setItems] = useState([{ name: "", qty: 1, price: 0 }]);

  const handleChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === "name" ? value : Number(value);
    setItems(updated);
  };

  const addItem = () => setItems([...items, { name: "", qty: 1, price: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const subTotal = items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  const totalAmount = subTotal + Number(shippingFee);

  const handleGeneratePDF = async () => {
    try {
      const response = await fetch("http://localhost:5000/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          billedTo,
          date,
          items,
          shippingFee,
          paymentStatus,
          total: totalAmount,
        }),
      });

      if (!response.ok) throw new Error("PDF generation failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "invoice.pdf";
      a.click();
    } catch (err) {
      console.error(err);
      alert("Error generating PDF. Check backend server.");
    }
  };

  return (
    <div className="page">
      <div className="invoice-card">

        {/* Header */}
        <div className="header">
          <div className="logo-box">
            <img
              src={logo}
              alt="Logo"
              className="logo-img"
            />
          </div>
          <div className="title-box">
            <h1>Photocopy Solutions</h1>
            <p>Photocopy Machines & Services Okara</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="info-section">

          <div className="input-group">
            <label>Customer Name</label>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Enter customer name"
            />
          </div>

          <div className="input-group">
            <label>Billed To</label>
            <input
              type="text"
              value={billedTo}
              onChange={(e) => setBilledTo(e.target.value)}
              placeholder="Billing address / company"
            />
          </div>

          <div className="input-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {/* Items Table */}
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price (PKR)</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                    placeholder="Item name"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) =>
                      handleChange(index, "qty", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      handleChange(index, "price", e.target.value)
                    }
                  />
                </td>
                <td>{item.qty * item.price}</td>
                <td>
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(index)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="add-btn" onClick={addItem}>
          + Add Item
        </button>

        {/* Totals */}
        <div className="total-section">
          <div>Subtotal: PKR {subTotal}</div>
          <div>
            Shipping Fee: PKR{" "}
            <input
              type="number"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              className="shipping-input"
            />
          </div>
          <h2>Total: PKR {totalAmount}</h2>
        </div>

        {/* PDF Button */}
        <div className="pdf-container">
          <button className="pdf-btn" onClick={handleGeneratePDF}>
            Generate PDF
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;