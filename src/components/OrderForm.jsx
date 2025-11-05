import { useState } from "react";
import { sendToTelegram } from "../utils/telegram";
import { sanitizeName, sanitizePhone, sanitizeAddress, sanitizeNote } from "../utils/sanitize";
import "../App.css"

export default function OrderForm({ cart, setCart }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Sanitize all form inputs
    const sanitizedData = {
      name: sanitizeName(formData.name),
      phone: sanitizePhone(formData.phone),
      address: sanitizeAddress(formData.address),
      note: sanitizeNote(formData.note),
    };

    if (!sanitizedData.name || cart.length === 0) {
      alert("Please enter your name and add at least one drink to the cart.");
      return;
    }

    let orderDetails = cart
      .map((item) => `${item.name} x${item.quantity}`)
      .join("\n");

    const total = cart
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);

    // Escape Markdown special characters in user inputs to prevent formatting issues
    const escapeMarkdown = (text) => {
      if (!text) return text;
      return text.replace(/([_*[\]()~`>#+=|{}.!-])/g, '\\$1');
    };

    const message = `
☕ *New Café Order*
👤 Name: ${escapeMarkdown(sanitizedData.name)}
📞 Phone: ${escapeMarkdown(sanitizedData.phone) || "N/A"}
🏠 Address: ${escapeMarkdown(sanitizedData.address) || "N/A"}
🧾 Order:
${orderDetails}
💵 Total: $${total}
📝 Note: ${escapeMarkdown(sanitizedData.note) || "Pay on Delivery"}
`;

    try {
      await sendToTelegram(message);
      alert("✅ Order sent! We'll contact you soon.");
      setFormData({ name: "", phone: "", address: "", note: "" });
      setCart([]); // clear cart after order
    } catch (error) {
      console.error("Error sending order:", error);
      alert("❌ Failed to send order. Please try again later.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 bg-white rounded-xl shadow-md mt-6">
      <h2 className="text-xl font-bold mb-3 text-center">បំពេញទីនេះ ដើម្បីបញ្ជាទិញ</h2>

      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="ឈ្មោះរបស់អ្នក"
        className="w-full p-2 border rounded mb-3"
        required
      />

      <input
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="លេខទូរស័ព្ទ"
        className="w-full p-2 border rounded mb-3"
      />

      <input
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="ទីតាំង​​"
        className="w-full p-2 border rounded mb-3"
      />

      <input
        name="note"
        value={formData.note}
        onChange={handleChange}
        placeholder='គិតថ្លៃរួច ឬ គិតតាមអ្នកដឺក'
        className="w-full p-2 border rounded mb-3"
      />

      {/* Cart display */}
      {cart.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">សម្រាប់ការទិញ:</h3>
          <ul className="list-disc list-inside space-y-2">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <button
                  type="button"
                  className="text-red-500 bg-red-100 px-2 py-0.5 rounded hover:bg-red-200 text-sm"
                  onClick={() => setCart(cart.filter((i) => i.id !== item.id))}>
                  លុប
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mt-4"
        id="send-order-btn">
        បញ្ជាទិញ
      </button>
    </form>
  );
}
