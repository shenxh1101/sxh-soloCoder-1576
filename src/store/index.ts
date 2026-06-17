import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Order,
  OrderStatus,
  Member,
  OrderItem,
  PriceConfig,
  PaymentRecord,
  ReceiptData,
  PaymentMethod,
  RechargeRecord,
  ConsumeRecord,
  ReminderRecord,
} from '@/types';
import { generateId, calculateTotalAmount, calculateFinalAmount } from '@/utils';
import {
  DEFAULT_MEMBERS,
  DEFAULT_PRICE_CONFIG,
  PAYMENT_METHOD_NAMES,
  CLOTHING_TYPE_NAMES,
  WASH_TYPE_NAMES,
} from '@/config/prices';

let orderCounter = 1000;

function generateOrderNo(): string {
  orderCounter += 1;
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `XY${year}${month}${day}${String(orderCounter).padStart(4, '0')}`;
}

const POINTS_PER_YUAN = 1;

interface OrderStore {
  orders: Order[];
  members: Member[];
  priceConfig: PriceConfig;
  rechargeRecords: RechargeRecord[];
  consumeRecords: ConsumeRecord[];

  addOrder: (order: Omit<Order, 'id' | 'orderNo' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderItems: (orderId: string, items: OrderItem[]) => void;
  processPayment: (
    orderId: string,
    data: {
      paymentMethod: PaymentMethod;
      receivedAmount: number;
    }
  ) => { order: Order; receipt: ReceiptData };
  getOrderById: (orderId: string) => Order | undefined;
  searchOrders: (keyword: string) => Order[];
  getOrdersByStatus: (status?: OrderStatus) => Order[];
  addReminder: (orderId: string, note?: string) => void;

  getPrice: (washType: 'water' | 'dry', clothingType: OrderItem['clothingType']) => number;
  updatePriceConfig: (config: PriceConfig) => void;

  addMember: (member: Omit<Member, 'id' | 'createdAt' | 'balance' | 'points'>) => Member;
  updateMember: (id: string, data: Partial<Omit<Member, 'id' | 'createdAt'>>) => void;
  deleteMember: (id: string) => void;
  searchMembers: (keyword: string) => Member[];
  getMemberByPhone: (phone: string) => Member | undefined;
  getMemberById: (id: string) => Member | undefined;
  generateMemberId: () => string;
  rechargeMember: (memberId: string, amount: number) => RechargeRecord;
  getMemberRechargeRecords: (memberId: string) => RechargeRecord[];
  getMemberConsumeRecords: (memberId: string) => ConsumeRecord[];
}

function createMockOrders(priceConfig: PriceConfig): Order[] {
  const now = new Date();
  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

  const mockItems = (
    washType: 'water' | 'dry',
    clothingType: OrderItem['clothingType'],
    qty: number
  ): OrderItem => {
    const unitPrice = priceConfig[washType][clothingType];
    return {
      id: generateId(),
      washType,
      clothingType,
      clothingTypeName: CLOTHING_TYPE_NAMES[clothingType],
      washTypeName: WASH_TYPE_NAMES[washType],
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
      reminderRecords: [
        { id: generateId(), orderId: '', remindedAt: daysAgo(0), note: '电话提醒' },
      ],
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
      reminderRecords: [
        { id: generateId(), orderId: '', remindedAt: daysAgo(2), note: '已电话通知' },
      ],
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

function createMockRechargeRecords(): RechargeRecord[] {
  const now = new Date();
  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };
  return [
    { id: generateId(), memberId: 'M001', amount: 300, rechargeAt: daysAgo(60) },
    { id: generateId(), memberId: 'M001', amount: 200, rechargeAt: daysAgo(30) },
    { id: generateId(), memberId: 'M002', amount: 200, rechargeAt: daysAgo(45) },
    { id: generateId(), memberId: 'M003', amount: 500, rechargeAt: daysAgo(20) },
    { id: generateId(), memberId: 'M003', amount: 500, rechargeAt: daysAgo(10) },
  ];
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: createMockOrders(DEFAULT_PRICE_CONFIG),
      members: DEFAULT_MEMBERS,
      priceConfig: DEFAULT_PRICE_CONFIG,
      rechargeRecords: createMockRechargeRecords(),
      consumeRecords: [],

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

      updateOrderItems: (orderId, newItems) => {
        const order = get().getOrderById(orderId);
        if (!order) return;
        if (order.payment) return;

        const totalAmount = calculateTotalAmount(newItems);
        const finalAmount = calculateFinalAmount(totalAmount, order.memberDiscount);

        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;
            return {
              ...o,
              items: newItems,
              totalAmount,
              finalAmount,
            };
          }),
        }));
      },

      processPayment: (orderId, data) => {
        const order = get().getOrderById(orderId);
        if (!order) throw new Error('订单不存在');

        const paidAt = new Date().toISOString();
        const change = Math.max(
          0,
          Math.round((data.receivedAmount - order.finalAmount) * 100) / 100
        );

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

        if (data.paymentMethod === 'card' && order.memberId) {
          const member = get().getMemberById(order.memberId);
          if (!member) throw new Error('会员不存在');
          if (member.balance < order.finalAmount) {
            throw new Error('会员余额不足');
          }

          const newBalance = Math.round((member.balance - order.finalAmount) * 100) / 100;
          const pointsEarned = Math.floor(order.finalAmount * POINTS_PER_YUAN);
          const newPoints = member.points + pointsEarned;

          set((state) => ({
            members: state.members.map((m) =>
              m.id === order.memberId ? { ...m, balance: newBalance, points: newPoints } : m
            ),
          }));

          const consumeRecord: ConsumeRecord = {
            id: generateId(),
            memberId: order.memberId,
            orderId,
            orderNo: order.orderNo,
            amount: order.finalAmount,
            pointsEarned,
            consumeAt: paidAt,
          };
          set((state) => ({
            consumeRecords: [consumeRecord, ...state.consumeRecords],
          }));
        } else if (order.memberId) {
          const member = get().getMemberById(order.memberId);
          if (member) {
            const pointsEarned = Math.floor(order.finalAmount * POINTS_PER_YUAN);
            const newPoints = member.points + pointsEarned;

            set((state) => ({
              members: state.members.map((m) =>
                m.id === order.memberId ? { ...m, points: newPoints } : m
              ),
            }));

            const consumeRecord: ConsumeRecord = {
              id: generateId(),
              memberId: order.memberId,
              orderId,
              orderNo: order.orderNo,
              amount: order.finalAmount,
              pointsEarned,
              consumeAt: paidAt,
            };
            set((state) => ({
              consumeRecords: [consumeRecord, ...state.consumeRecords],
            }));
          }
        }

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

      addReminder: (orderId, note) => {
        const reminder: ReminderRecord = {
          id: generateId(),
          orderId,
          remindedAt: new Date().toISOString(),
          note,
        };
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;
            const records = o.reminderRecords || [];
            return { ...o, reminderRecords: [reminder, ...records] };
          }),
        }));
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
          balance: 0,
          points: 0,
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

      rechargeMember: (memberId, amount) => {
        const member = get().getMemberById(memberId);
        if (!member) throw new Error('会员不存在');
        if (amount <= 0) throw new Error('充值金额必须大于0');

        const newBalance = Math.round((member.balance + amount) * 100) / 100;

        set((state) => ({
          members: state.members.map((m) =>
            m.id === memberId ? { ...m, balance: newBalance } : m
          ),
        }));

        const record: RechargeRecord = {
          id: generateId(),
          memberId,
          amount,
          rechargeAt: new Date().toISOString(),
        };
        set((state) => ({
          rechargeRecords: [record, ...state.rechargeRecords],
        }));

        return record;
      },

      getMemberRechargeRecords: (memberId) => {
        return get().rechargeRecords.filter((r) => r.memberId === memberId);
      },

      getMemberConsumeRecords: (memberId) => {
        return get().consumeRecords.filter((r) => r.memberId === memberId);
      },
    }),
    {
      name: 'laundry-order-storage',
    }
  )
);
