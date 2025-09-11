export interface CartItem {
  id: string;
  serviceId: string;
  serviceName: string;
  providerId?: string;
  providerName?: string;
  price: number;
  quantity: number;
  serviceDetails?: any;
  // Add scheduling properties
  date?: string;
  time?: string;
  displayDate?: string;
}

export interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
}