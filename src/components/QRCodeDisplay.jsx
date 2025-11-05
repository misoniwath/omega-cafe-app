import React from "react";
import "../App.css"; // or import "./QRCodeDisplay.css";
import cafeQR from "../assets/qr-img.jpg";

export default function QRCodeDisplay() {
  return (
    <div className="qr-code-container">
      <h2>Scan to Pay (ABA)</h2>
      <img src={cafeQR} alt="ABA QR" className="qr-image" />
      <p>You can pay before delivery or choose “Pay on Delivery”</p>
    </div>
  );
}
