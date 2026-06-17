import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus, Member, OrderItem, PriceConfig, PaymentRecord, ReceiptData, PaymentMethod } from '@/types';
import { generateId } from '@/utils';
import { DEFAULT_MEMBERS, DEFAULT_PRICE_CONFIG, PAYMENT_METHOD_NAMES } from '@/config/prices';

let orderCounter = 1000;

function generateOrderNo(): string {
  orderCounter += 1;
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `XY${year}${month}${day}${String(orderCounter).padStart(4, '0')}`;
}

interface OrderStore {
  orders: Order[];
  members: Member[];
  priceConfig: PriceConfig;
  addOrder: (order: Omit<Order, 'id' | 'orderNo' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  processPayment: (orderId: string, data: {
    paymentMethod: PaymentMethod;
    receivedAmount: number;
  }) => { order: Order; receipt: ReceiptData };
  getOrderById: (orderId: string) => Order | undefined;
  searchOrders: (keyword: string) => Order[];
  getOrdersByStatus: (status?: OrderStatus) => Order[];
  getPrice: (washType: 'water' | 'dry', clothingType: OrderItem['clothingType']) => number;
  updatePriceConfig: (config: PriceConfig) => void;
  addMember: (member: Omit<Member, 'id' | 'createdAt'>) => Member;
  updateMember: (id: string, data: Partial<Omit<Member, 'id' | 'createdAt'>>) => void;
  deleteMember: (id: string) => void;
  searchMembers: (keyword: string) => Member[];
  getMemberByPhone: (phone: string) => Member | undefined;
  getMemberById: (id: string) => Member | undefined;
  generateMemberId: () => string;
}

function createMockOrders(priceConfig: PriceConfig): Order[] {
  const now = new Date();
  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

  const mockItems = (washType: 'water' | 'dry', clothingType: OrderItem['clothingType'], qty: number): OrderItem => {
    const unitPrice = priceConfig[washType][clothingType];
    return {
      id: generateId(),
      washType,
      clothingType,
      clothingTypeName: { shirt: '衬衫', pants: '裤子', coat: '外套', bedding: '被套' }[clothingType],
      washTypeName: washType === 'water' ? '水洗' : '干洗',
      quantity: qty,
      unitPrice,
      subtotal: unitPrice * qty,
    };
  };

  return [
    {
      id: generateId(),
      orderNo: generateOrderNo(),
      customerName: '张三',
      customerPhone: '13800138001',
      memberId: 'M001',
      memberDiscount: 0.9,
      status: 'pending',
      items: [mockItems('water', 'shirt', 3), mockItems('water', 'pants', 2)],
      totalAmount: 50,
      finalAmount: 45,
      createdAt: daysAgo(1),
    },
    {
      id: generateId(),
      orderNo: generateOrderNo(),
      customerName: '李四',
      customerPhone: '13800138002',
      memberId: 'M002',
      memberDiscount: 0.85,
      status: 'ready',
      items: [mockItems('dry', 'coat', 2)],
      totalAmount: 60,
      finalAmount: 51,
      createdAt: daysAgo(2),
      readyAt: daysAgo(1),
    },
    {
      id: generateId(),
      orderNo: generateOrderNo(),
      customerName: '王五',
      customerPhone: '13800138003',
      memberId: 'M003',
      memberDiscount: 0.8,
      status: 'ready',
      items: [mockItems('dry', 'bedding', 1), mockItems('water', 'coat', 1)],
      totalAmount: 55,
      finalAmount: 44,
      createdAt: daysAgo(5),
      readyAt: daysAgo(4),
    },
    {
      id: generateId(),
      orderNo: generateOrderNo(),
      customerName: '赵六',
      customerPhone: '13900139001',
      memberDiscount: 1,
      status: 'picked',
      items: [mockItems('water', 'shirt', 5)],
      totalAmount: 50,
      finalAmount: 50,
      payment: {
        id: generateId(),
        orderId: '',
        amount: 50,
        receivedAmount: 50,
        change: 0,
        paymentMethod: 'wechat',
        paidAt: daysAgo(6),
      },
      createdAt: daysAgo(8),
      readyAt: daysAgo(7),
      pickedAt: daysAgo(6),
    },
    {
      id: generateId(),
      orderNo: generateOrderNo(),
      customerName: '孙七',
      customerPhone: '13900139002',
      memberDiscount: 1,
      status: 'picked',
      items: [mockItems('dry', 'shirt', 2), mockItems('dry', 'pants', 2)],
      totalAmount: 80,
      finalAmount: 80,
      payment: {
        id: generateId(),
        orderId: '',
        amount: 80,
        receivedAmount: 100,
        change: 20,
        paymentMethod: 'cash',
        paidAt: daysAgo(8),
      },
      createdAt: daysAgo(10),
      readyAt: daysAgo(9),
      pickedAt: daysAgo(8),
    },
    {
      id: generateId(),
      orderNo: generateOrderNo(),
      customerName: '张三',
      customerPhone: '13800138001',
      memberId: 'M001',
      memberDiscount: 0.9,
      status: 'picked',
      items: [mockItems('dry', 'coat', 3)],
      totalAmount: 90,
      finalAmount: 81,
      payment: {
        id: generateId(),
        orderId: '',
        amount: 81,
        receivedAmount: 81,
        change: 0,
        paymentMethod: 'alipay',
        paidAt: daysAgo(13),
      },
      createdAt: daysAgo(15),
      readyAt: daysAgo(14),
      pickedAt: daysAgo(13),
    },
  ];
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: createMockOrders(DEFAULT_PRICE_CONFIG),
      members: DEFAULT_MEMBERS,
      priceConfig: DEFAULT_PRICE_CONFIG,

      getPrice: (washType, clothingType) => {
        return get().priceConfig[washType][clothingType];
      },

      updatePriceConfig: (config) => {
        set({ priceConfig: config });
      },

      addOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: generateId(),
          orderNo: generateOrderNo(),
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

      processPayment: (orderId, data) => {
        const order = get().getOrderById(orderId);
        if (!order) throw new Error('订单不存在');

        const paidAt = new Date().toISOString();
        const change = Math.max(0, Math.round((data.receivedAmount - order.finalAmount) * 100) / 100);

        const payment: PaymentRecord = {
          id: generateId(),
          orderId,
          amount: order.finalAmount,
          receivedAmount: data.receivedAmount,
          change,
          paymentMethod: data.paymentMethod,
          paidAt,
        };

        const receipt: ReceiptData = {
          orderId,
          orderNo: order.orderNo,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          items: order.items,
          totalAmount: order.totalAmount,
          memberDiscount: order.memberDiscount,
          finalAmount: order.finalAmount,
          paymentMethod: PAYMENT_METHOD_NAMES[data.paymentMethod],
          receivedAmount: data.receivedAmount,
          change,
          paidAt,
        };

        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;
            return {
              ...o,
              status: 'picked',
              pickedAt: paidAt,
              payment,
              receipt,
            };
          }),
        }));

        const updatedOrder = get().getOrderById(orderId)!;
        return { order: updatedOrder, receipt };
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
            (o.memberId && o.memberId.toLowerCase().includes(kw)) ||
            o.orderNo.toLowerCase().includes(kw)
        );
      },

      getOrdersByStatus: (status) => {
        if (!status) return get().orders;
        return get().orders.filter((o) => o.status === status);
      },

      generateMemberId: () => {
        const members = get().members;
        const maxId = members.reduce((max, m) => {
          const num = parseInt(m.id.replace('M', ''), 10);
          return num > max ? num : max;
        }, 0);
        return `M${String(maxId + 1).padStart(3, '0')}`;
      },

      addMember: (memberData) => {
        const newMember: Member = {
          ...memberData,
          id: get().generateMemberId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ members: [...state.members, newMember] }));
        return newMember;
      },

      updateMember: (id, data) => {
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? { ...m, ...data } : m)),
        }));
      },

      deleteMember: (id) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        }));
      },

      searchMembers: (keyword) => {
        const kw = keyword.trim().toLowerCase();
        if (!kw) return get().members;
        return get().members.filter(
          (m) =>
            m.name.toLowerCase().includes(kw) ||
            m.phone.includes(kw) ||
            m.id.toLowerCase().includes(kw)
        );
      },

      getMemberByPhone: (phone) => {
        return get().members.find((m) => m.phone === phone.trim());
      },

      getMemberById: (id) => {
        return get().members.find((m) => m.id.toLowerCase() === id.trim().toLowerCase());
      },
    }),
    {
      name: 'laundry-order-storage',
    }
  )
);
