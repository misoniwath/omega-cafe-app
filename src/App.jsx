import { useState } from "react";
import QRCodeDisplay from "./components/QRCodeDisplay";
import DrinkList from "./components/DrinkList";
import OrderForm from "./components/OrderForm";

export default function App() {
  const [cart, setCart] = useState([]);

  const handleAddToCart = (drink) => {
    // If drink already in cart, increase quantity
    const existing = cart.find((item) => item.id === drink.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === drink.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, drink]);
    }
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-4">
        កម្មង់ភេសជ្ជរបស់អ្នកទីនេះ
      </h1>

      <DrinkList onAddToCart={handleAddToCart} />

      <OrderForm cart={cart} setCart={setCart} />

      <QRCodeDisplay />
    </div>
  );
}
