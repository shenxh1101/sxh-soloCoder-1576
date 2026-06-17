import type { Order, OrderItem, WashType, ClothingType, MonthlyStats, CustomerRank } from '@/types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
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
  let waterRevenue = 0;
  let dryRevenue = 0;
  let receivedRevenue = 0;
  let unpaidRevenue = 0;

  monthOrders.forEach((order) => {
    order.items.forEach((item) => {
      totalItems += item.quantity;
      if (item.washType === 'water') {
        waterItems += item.quantity;
      } else {
        dryItems += item.quantity;
      }
    });

    const orderItemsTotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
    const waterSubtotal = order.items
      .filter((i) => i.washType === 'water')
      .reduce((sum, i) => sum + i.subtotal, 0);
    const drySubtotal = order.items
      .filter((i) => i.washType === 'dry')
      .reduce((sum, i) => sum + i.subtotal, 0);

    const discountRatio = order.totalAmount > 0 ? order.finalAmount / order.totalAmount : 1;

    totalRevenue += order.finalAmount;
    waterRevenue += Math.round(waterSubtotal * discountRatio * 100) / 100;
    dryRevenue += Math.round(drySubtotal * discountRatio * 100) / 100;

    if (order.payment) {
      receivedRevenue += order.finalAmount;
    } else if (order.status === 'picked') {
      receivedRevenue += order.finalAmount;
    } else {
      unpaidRevenue += order.finalAmount;
    }
  });

  return {
    totalOrders: monthOrders.length,
    totalItems,
    waterItems,
    dryItems,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    waterRevenue: Math.round(waterRevenue * 100) / 100,
    dryRevenue: Math.round(dryRevenue * 100) / 100,
    receivedRevenue: Math.round(receivedRevenue * 100) / 100,
    unpaidRevenue: Math.round(unpaidRevenue * 100) / 100,
  };
}

export function getCustomerRankingByAmount(
  orders: Order[],
  year: number,
  month: number
): CustomerRank[] {
  const monthOrders = getOrdersByMonth(orders, year, month);
  const customerMap = new Map<string, CustomerRank>();

  monthOrders.forEach((order) => {
    const key = order.customerPhone;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        orderCount: 0,
        totalItems: 0,
        totalAmount: 0,
      });
    }
    const record = customerMap.get(key)!;
    record.orderCount += 1;
    record.totalItems += order.items.reduce((sum, i) => sum + i.quantity, 0);
    record.totalAmount += order.finalAmount;
  });

  return Array.from(customerMap.values())
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10)
    .map((r) => ({ ...r, totalAmount: Math.round(r.totalAmount * 100) / 100 }));
}

export function getCustomerRankingByItems(
  orders: Order[],
  year: number,
  month: number
): CustomerRank[] {
  const monthOrders = getOrdersByMonth(orders, year, month);
  const customerMap = new Map<string, CustomerRank>();

  monthOrders.forEach((order) => {
    const key = order.customerPhone;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        orderCount: 0,
        totalItems: 0,
        totalAmount: 0,
      });
    }
    const record = customerMap.get(key)!;
    record.orderCount += 1;
    record.totalItems += order.items.reduce((sum, i) => sum + i.quantity, 0);
    record.totalAmount += order.finalAmount;
  });

  return Array.from(customerMap.values())
    .sort((a, b) => b.totalItems - a.totalItems)
    .slice(0, 10)
    .map((r) => ({ ...r, totalAmount: Math.round(r.totalAmount * 100) / 100 }));
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

export function formatReceipt(content: string): string {
  return content;
}
