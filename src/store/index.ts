import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus, Member, OrderItem } from '@/types';
import { generateId } from '@/utils';
import { DEFAULT_MEMBERS } from '@/config/prices';

interface OrderStore {
  orders: Order[];
  members: Member[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrderById: (orderId: string) => Order | undefined;
  searchOrders: (keyword: string) => Order[];
  getOrdersByStatus: (status?: OrderStatus) => Order[];
}

function createMockOrders(): Order[] {
  const now = new Date();
  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

  const mockOrders: Order[] = [
    {
      id: generateId(),
      customerName: '张三',
      customerPhone: '13800138001',
      memberId: 'M001',
      memberDiscount: 0.9,
      status: 'pending',
      items: [
        {
          id: generateId(),
          washType: 'water',
          clothingType: 'shirt',
          clothingTypeName: '衬衫',
          washTypeName: '水洗',
          quantity: 3,
          unitPrice: 10,
          subtotal: 30,
        },
        {
          id: generateId(),
          washType: 'water',
          clothingType: 'pants',
          clothingTypeName: '裤子',
          washTypeName: '水洗',
          quantity: 2,
          unitPrice: 10,
          subtotal: 20,
        },
      ],
      totalAmount: 50,
      finalAmount: 45,
      createdAt: daysAgo(1),
    },
    {
      id: generateId(),
      customerName: '李四',
      customerPhone: '13800138002',
      memberId: 'M002',
      memberDiscount: 0.85,
      status: 'ready',
      items: [
        {
          id: generateId(),
          washType: 'dry',
          clothingType: 'coat',
          clothingTypeName: '外套',
          washTypeName: '干洗',
          quantity: 2,
          unitPrice: 30,
          subtotal: 60,
        },
      ],
      totalAmount: 60,
      finalAmount: 51,
      createdAt: daysAgo(2),
      readyAt: daysAgo(1),
    },
    {
      id: generateId(),
      customerName: '王五',
      customerPhone: '13800138003',
      memberId: 'M003',
      memberDiscount: 0.8,
      status: 'ready',
      items: [
        {
          id: generateId(),
          washType: 'dry',
          clothingType: 'bedding',
          clothingTypeName: '被套',
          washTypeName: '干洗',
          quantity: 1,
          unitPrice: 40,
          subtotal: 40,
        },
        {
          id: generateId(),
          washType: 'water',
          clothingType: 'coat',
          clothingTypeName: '外套',
          washTypeName: '水洗',
          quantity: 1,
          unitPrice: 15,
          subtotal: 15,
        },
      ],
      totalAmount: 55,
      finalAmount: 44,
      createdAt: daysAgo(5),
      readyAt: daysAgo(4),
    },
    {
      id: generateId(),
      customerName: '赵六',
      customerPhone: '13900139001',
      memberDiscount: 1,
      status: 'picked',
      items: [
        {
          id: generateId(),
          washType: 'water',
          clothingType: 'shirt',
          clothingTypeName: '衬衫',
          washTypeName: '水洗',
          quantity: 5,
          unitPrice: 10,
          subtotal: 50,
        },
      ],
      totalAmount: 50,
      finalAmount: 50,
      createdAt: daysAgo(8),
      readyAt: daysAgo(7),
      pickedAt: daysAgo(6),
    },
    {
      id: generateId(),
      customerName: '孙七',
      customerPhone: '13900139002',
      memberDiscount: 1,
      status: 'picked',
      items: [
        {
          id: generateId(),
          washType: 'dry',
          clothingType: 'shirt',
          clothingTypeName: '衬衫',
          washTypeName: '干洗',
          quantity: 2,
          unitPrice: 20,
          subtotal: 40,
        },
        {
          id: generateId(),
          washType: 'dry',
          clothingType: 'pants',
          clothingTypeName: '裤子',
          washTypeName: '干洗',
          quantity: 2,
          unitPrice: 20,
          subtotal: 40,
        },
      ],
      totalAmount: 80,
      finalAmount: 80,
      createdAt: daysAgo(10),
      readyAt: daysAgo(9),
      pickedAt: daysAgo(8),
    },
    {
      id: generateId(),
      customerName: '张三',
      customerPhone: '13800138001',
      memberId: 'M001',
      memberDiscount: 0.9,
      status: 'picked',
      items: [
        {
          id: generateId(),
          washType: 'dry',
          clothingType: 'coat',
          clothingTypeName: '外套',
          washTypeName: '干洗',
          quantity: 3,
          unitPrice: 30,
          subtotal: 90,
        },
      ],
      totalAmount: 90,
      finalAmount: 81,
      createdAt: daysAgo(15),
      readyAt: daysAgo(14),
      pickedAt: daysAgo(13),
    },
  ];

  return mockOrders;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: createMockOrders(),
      members: DEFAULT_MEMBERS,

      addOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ orders: [newOrder, ...state.orders] }));
        return newOrder;
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            const updated: Order = { ...order, status };
            if (status === 'ready' && !order.readyAt) {
              updated.readyAt = new Date().toISOString();
            }
            if (status === 'picked' && !order.pickedAt) {
              updated.pickedAt = new Date().toISOString();
            }
            return updated;
          }),
        }));
      },

      getOrderById: (orderId) => {
        return get().orders.find((o) => o.id === orderId);
      },

      searchOrders: (keyword) => {
        const kw = keyword.trim().toLowerCase();
        if (!kw) return get().orders;
        return get().orders.filter(
          (o) =>
            o.customerName.toLowerCase().includes(kw) ||
            o.customerPhone.includes(kw) ||
            (o.memberId && o.memberId.toLowerCase().includes(kw))
        );
      },

      getOrdersByStatus: (status) => {
        if (!status) return get().orders;
        return get().orders.filter((o) => o.status === status);
      },
    }),
    {
      name: 'laundry-order-storage',
    }
  )
);
