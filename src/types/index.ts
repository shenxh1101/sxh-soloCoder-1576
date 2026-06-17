export type WashType = 'water' | 'dry';

export type ClothingType = 'shirt' | 'pants' | 'coat' | 'bedding';

export type OrderStatus = 'pending' | 'ready' | 'picked';

export type PaymentMethod = 'cash' | 'wechat' | 'alipay' | 'card';

export interface PriceConfig {
  water: Record<ClothingType, number>;
  dry: Record<ClothingType, number>;
}

export interface OrderItem {
  id: string;
  washType: WashType;
  clothingType: ClothingType;
  clothingTypeName: string;
  washTypeName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  receivedAmount: number;
  change: number;
  paymentMethod: PaymentMethod;
  paidAt: string;
}

export interface ReceiptData {
  orderId: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  memberDiscount: number;
  finalAmount: number;
  paymentMethod: string;
  receivedAmount: number;
  change: number;
  paidAt: string;
}

export interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  memberId?: string;
  memberDiscount: number;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  finalAmount: number;
  payment?: PaymentRecord;
  receipt?: ReceiptData;
  reminderRecords?: ReminderRecord[];
  createdAt: string;
  readyAt?: string;
  pickedAt?: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  discount: number;
  balance: number;
  points: number;
  createdAt: string;
}

export interface RechargeRecord {
  id: string;
  memberId: string;
  amount: number;
  rechargeAt: string;
}

export interface ConsumeRecord {
  id: string;
  memberId: string;
  orderId: string;
  orderNo: string;
  amount: number;
  pointsEarned: number;
  consumeAt: string;
}

export interface ReminderRecord {
  id: string;
  orderId: string;
  remindedAt: string;
  note?: string;
}

export interface MonthlyStats {
  totalOrders: number;
  totalItems: number;
  waterItems: number;
  dryItems: number;
  totalRevenue: number;
  waterRevenue: number;
  dryRevenue: number;
  receivedRevenue: number;
  unpaidRevenue: number;
}

export interface CustomerRank {
  customerName: string;
  customerPhone: string;
  orderCount: number;
  totalItems: number;
  totalAmount: number;
}
