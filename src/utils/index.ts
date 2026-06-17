import type { Order, OrderItem, WashType, ClothingType, MonthlyStats, CustomerRank } from '@/types';
import { PRICE_CONFIG } from '@/config/prices';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function calculateItemPrice(
  washType: WashType,
  clothingType: ClothingType,
  quantity: number
): { unitPrice: number; subtotal: number } {
  const unitPrice = PRICE_CONFIG[washType][clothingType];
  return {
    unitPrice,
    subtotal: unitPrice * quantity,
  };
}

export function calculateTotalAmount(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

export function calculateFinalAmount(totalAmount: number, discount: number): number {
  return Math.round(totalAmount * discount * 100) / 100;
}

export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function isOverdue(order: Order): boolean {
  if (order.status === 'picked') return false;
  const referenceDate = order.readyAt || order.createdAt;
  const days = getDaysBetween(new Date(referenceDate), new Date());
  return days > 3;
}

export function getOverdueDays(order: Order): number {
  if (order.status === 'picked') return 0;
  const referenceDate = order.readyAt || order.createdAt;
  const days = getDaysBetween(new Date(referenceDate), new Date());
  return Math.max(0, days - 3);
}

function getDaysBetween(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay);
}

export function getOrdersByMonth(orders: Order[], year: number, month: number): Order[] {
  return orders.filter((order) => {
    const date = new Date(order.createdAt);
    return date.getFullYear() === year && date.getMonth() === month;
  });
}

export function getMonthlyStatistics(orders: Order[], year: number, month: number): MonthlyStats {
  const monthOrders = getOrdersByMonth(orders, year, month);
  let totalItems = 0;
  let waterItems = 0;
  let dryItems = 0;
  let totalRevenue = 0;

  monthOrders.forEach((order) => {
    order.items.forEach((item) => {
      totalItems += item.quantity;
      if (item.washType === 'water') {
        waterItems += item.quantity;
      } else {
        dryItems += item.quantity;
      }
    });
    totalRevenue += order.finalAmount;
  });

  return {
    totalOrders: monthOrders.length,
    totalItems,
    waterItems,
    dryItems,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
  };
}

export function getCustomerRanking(orders: Order[], year: number, month: number): CustomerRank[] {
  const monthOrders = getOrdersByMonth(orders, year, month);
  const customerMap = new Map<string, CustomerRank>();

  monthOrders.forEach((order) => {
    const key = order.customerPhone;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        orderCount: 0,
        totalAmount: 0,
      });
    }
    const record = customerMap.get(key)!;
    record.orderCount += 1;
    record.totalAmount += order.finalAmount;
  });

  const ranking = Array.from(customerMap.values())
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10)
    .map((r) => ({ ...r, totalAmount: Math.round(r.totalAmount * 100) / 100 }));

  return ranking;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}
