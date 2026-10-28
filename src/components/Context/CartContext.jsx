
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext();

const CART_KEY = "nearshop-cart";

function readCart() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(CART_KEY) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readCart);

  const refreshCart = useCallback(() => {
    setCart(readCart());
  }, []);

  useEffect(() => {
    // Listen for cart updates within this tab.
    window.addEventListener(
      "nearshop-cart-updated",
      refreshCart
    );

    // Listen for localStorage updates from other tabs.
    window.addEventListener("storage", refreshCart);

    return () => {
      window.removeEventListener(
        "nearshop-cart-updated",
        refreshCart
      );
      window.removeEventListener("storage", refreshCart);
    };
  }, [refreshCart]);

  // Count total units, including quantities.
  const cartCount = cart.reduce(
    (total, item) =>
      total + Math.max(0, Number(item.quantity) || 1),
    0
  );

  return (
    <CartContext.Provider value={{ cart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
