import type { PriceConfig, ClothingType, PaymentMethod } from '@/types';

export const DEFAULT_PRICE_CONFIG: PriceConfig = {
  water: {
    shirt: 10,
    pants: 10,
    coat: 15,
    bedding: 25,
  },
  dry: {
    shirt: 20,
    pants: 20,
    coat: 30,
    bedding: 40,
  }
};

export const CLOTHING_TYPE_NAMES: Record<ClothingType, string> = {
  shirt: '衬衫',
  pants: '裤子',
  coat: '外套',
  bedding: '被套',
};

export const WASH_TYPE_NAMES: Record<'water' | 'dry', string> = {
  water: '水洗',
  dry: '干洗',
};

export const ORDER_STATUS_NAMES: Record<'pending' | 'ready' | 'picked', string> = {
  pending: '待洗',
  ready: '已洗好',
  picked: '已取走',
};

export const PAYMENT_METHOD_NAMES: Record<PaymentMethod, string> = {
  cash: '现金',
  wechat: '微信',
  alipay: '支付宝',
  card: '会员卡',
};

export const DEFAULT_MEMBERS = [
  { id: 'M001', name: '张三', phone: '13800138001', discount: 0.9, balance: 500, points: 320, createdAt: new Date(Date.now() - 86400000 * 90).toISOString() },
  { id: 'M002', name: '李四', phone: '13800138002', discount: 0.85, balance: 200, points: 150, createdAt: new Date(Date.now() - 86400000 * 60).toISOString() },
  { id: 'M003', name: '王五', phone: '13800138003', discount: 0.8, balance: 1000, points: 580, createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
];
