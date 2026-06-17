export type WashType = 'water' | 'dry';

export type ClothingType = 'shirt' | 'pants' | 'coat' | 'bedding';

export type OrderStatus = 'pending' | 'ready' | 'picked';

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

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  memberId?: string;
  memberDiscount: number;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  finalAmount: number;
  createdAt: string;
  readyAt?: string;
  pickedAt?: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  discount: number;
}

export interface MonthlyStats {
  totalOrders: number;
  totalItems: number;
  waterItems: number;
  dryItems: number;
  totalRevenue: number;
}

export interface CustomerRank {
  customerName: string;
  customerPhone: string;
  orderCount: number;
  totalAmount: number;
}
