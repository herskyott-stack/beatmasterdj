import React, { createContext, useContext, useState, ReactNode } from "react";

export type CartItem = {
  id: string;
  type: "package" | "addon";
  category?: string;
  name: string;
  price: number;
  description: string;
  features?: string[];
};

export type EventDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventType: string;
  notes: string;
};

type CartContextType = {
  items: CartItem[];
  eventDetails: EventDetails;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateEventDetails: (details: Partial<EventDetails>) => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getDeposit: () => number;
  isInCart: (id: string) => boolean;
};

const TAX_RATE = 0.13; // 13% HST

const defaultEventDetails: EventDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  eventDate: "",
  eventTime: "",
  eventLocation: "",
  eventType: "",
  notes: "",
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [eventDetails, setEventDetails] = useState<EventDetails>(defaultEventDetails);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      // For packages, only allow one package in cart
      if (item.type === "package") {
        const withoutPackages = prev.filter((i) => i.type !== "package");
        return [...withoutPackages, item];
      }
      // For addons, check if already exists
      if (prev.some((i) => i.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setEventDetails(defaultEventDetails);
  };

  const updateEventDetails = (details: Partial<EventDetails>) => {
    setEventDetails((prev) => ({ ...prev, ...details }));
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  const getTax = () => {
    return Math.round(getSubtotal() * TAX_RATE * 100) / 100;
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const getDeposit = () => {
    return Math.ceil(getTotal() * 0.5);
  };

  const isInCart = (id: string) => {
    return items.some((item) => item.id === id);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        eventDetails,
        addItem,
        removeItem,
        clearCart,
        updateEventDetails,
        getSubtotal,
        getTax,
        getTotal,
        getDeposit,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
