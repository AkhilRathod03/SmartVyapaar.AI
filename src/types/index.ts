export type ProductCategory =
  | 'Groceries'
  | 'Dairy & Bread'
  | 'Personal Care'
  | 'Electrical & Hardware'
  | 'Snacks & Beverages'
  | 'Cleaning & Household'
  | 'Pooja Needs';

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  locality: string;
  city: string;
  address: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  openingHours: string;
  isOpen: boolean;
  isDeliveryAvailable: boolean;
  isPickupAvailable: boolean;
  deliveryMinOrder: number;
  deliveryFee: number;
  avatarUrl: string;
  isVerified: boolean;
  tags: string[];
}

export interface InventoryItem {
  id: string;
  shopId: string;
  productName: string;
  category: ProductCategory;
  price: number;
  quantity: number;
  unit: string; // e.g. "packet", "piece", "kg", "bottle"
  minStockLevel: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
  description?: string;
  brand?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  locality: string;
  khataBalance: number; // positive means customer owes shopkeeper
  totalOrders: number;
  lastVisit: string;
}

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isAvailable: boolean;
  unit?: string;
}

export type OrderStatus =
  | 'request_sent'
  | 'shop_accepted'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'rejected';

export interface OrderVoiceLog {
  timestamp: string;
  speaker: 'ai' | 'shopkeeper' | 'customer';
  text: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g., "LS-1024"
  shopId: string;
  shopName: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  orderType: 'pickup' | 'delivery';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  estimatedTime: string;
  notes?: string;
  statusNotes?: string;
  packagingTimeMinutes?: number;
  lastUpdatedStatus?: string;
  voiceLog?: OrderVoiceLog[];
}

export type ExpenseCategory =
  | 'Stock Purchase'
  | 'Shop Rent'
  | 'Electricity & Utilities'
  | 'Transport & Fuel'
  | 'Tea & Refreshments'
  | 'Helper Wages'
  | 'Repairs & Maintenance'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  shopId: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  notes: string;
}

export interface Transaction {
  id: string;
  shopId: string;
  date: string;
  type: 'cash' | 'upi' | 'khata_credit' | 'khata_settlement';
  customerName?: string;
  amount: number;
  itemsSummary: string;
}

export interface KhataTransaction {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  date: string;
  itemDescription: string;
  items?: { name: string; quantity: number; price: number }[];
  debit: number; // Credit given (customer owes this)
  credit: number; // Payment received (reduces balance)
  previousBalance: number;
  remainingBalance: number;
  notes?: string;
}

export interface ParsedProductRequest {
  rawQuery: string;
  name: string;
  canonicalName: string;
  quantity: number;
  unit: string;
}

export interface MatchedItem {
  product: InventoryItem;
  requestedQuantity: number;
  unitPrice: number;
  itemTotal: number;
  availableQuantity: number;
  isSufficient: boolean;
}

export interface ShopSearchResult {
  shop: Shop;
  availableItems: MatchedItem[];
  missingItems: ParsedProductRequest[];
  isCompleteMatch: boolean;
  totalBasketPrice: number;
  distanceKm: number;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  matchScore: number;
}

export interface SplitOrderOption {
  shopA: Shop;
  shopAItems: MatchedItem[];
  shopATotal: number;
  shopB: Shop;
  shopBItems: MatchedItem[];
  shopBTotal: number;
  combinedTotal: number;
  missingItemsCount: number;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  structuredConfirmation?: {
    type: 'inventory_add' | 'credit_sale' | 'cash_sale' | 'expense' | 'clarification_needed';
    title: string;
    fields: { label: string; value: string | number }[];
    payload: any;
    status: 'pending' | 'confirmed' | 'cancelled';
  };
  suggestedPrompts?: string[];
}

