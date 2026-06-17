export type WashType = 'water' | 'dry';

export type ClothingType = 'shirt' | 'pants' | 'coat' | 'bedding';

export type OrderStatus = 'pending' | 'ready' | 'picked';

export type PaymentMethod = 'cash' | 'wechat' | 'alipay' | 'card';

export type MemberLevel = 'normal' | 'silver' | 'gold';

export interface MemberLevelConfig {
  level: MemberLevel;
  name: string;
  discount: number;
  minConsume: number;
  minPoints: number;
  color: string;
  bgColor: string;
}

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
  balanceDeducted?: number;
  balanceBefore?: number;
  balanceAfter?: number;
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
  isBalancePayment?: boolean;
  balanceDeducted?: number;
  balanceBefore?: number;
  balanceAfter?: number;
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
  level: MemberLevel;
  totalConsume: number;
  createdAt: string;
}

export interface RechargeRecord {
  id: string;
  memberId: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  rechargeAt: string;
}

export interface ConsumeRecord {
  id: string;
  memberId: string;
  orderId: string;
  orderNo: string;
  amount: number;
  pointsEarned: number;
  paymentMethod: PaymentMethod;
  isBalancePayment: boolean;
  balanceDeducted?: number;
  balanceBefore?: number;
  balanceAfter?: number;
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

export interface MemberStats {
  totalRecharge: number;
  totalMemberConsume: number;
  balancePaymentAmount: number;
  balancePaymentRatio: number;
  totalPointsIssued: number;
  normalOrderRevenue: number;
}

export interface CustomerRank {
  customerName: string;
  customerPhone: string;
  orderCount: number;
  totalItems: number;
  totalAmount: number;
}
