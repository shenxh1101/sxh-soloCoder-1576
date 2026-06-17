import type { PriceConfig, ClothingType, PaymentMethod, MemberLevelConfig, MemberLevel } from '@/types';

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

export const MEMBER_LEVEL_CONFIG: MemberLevelConfig[] = [
  {
    level: 'normal',
    name: '普通会员',
    discount: 0.95,
    minConsume: 0,
    minPoints: 0,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
  },
  {
    level: 'silver',
    name: '银卡会员',
    discount: 0.88,
    minConsume: 500,
    minPoints: 500,
    color: 'text-slate-500',
    bgColor: 'bg-slate-200',
  },
  {
    level: 'gold',
    name: '金卡会员',
    discount: 0.8,
    minConsume: 2000,
    minPoints: 2000,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
  },
];

export const getMemberLevelConfig = (level: MemberLevel): MemberLevelConfig => {
  return MEMBER_LEVEL_CONFIG.find((c) => c.level === level) || MEMBER_LEVEL_CONFIG[0];
};

export const getNextLevelConfig = (level: MemberLevel): MemberLevelConfig | null => {
  const currentIndex = MEMBER_LEVEL_CONFIG.findIndex((c) => c.level === level);
  if (currentIndex < MEMBER_LEVEL_CONFIG.length - 1) {
    return MEMBER_LEVEL_CONFIG[currentIndex + 1];
  }
  return null;
};

export const calculateMemberLevel = (totalConsume: number, points: number): MemberLevel => {
  for (let i = MEMBER_LEVEL_CONFIG.length - 1; i >= 0; i--) {
    const config = MEMBER_LEVEL_CONFIG[i];
    if (totalConsume >= config.minConsume || points >= config.minPoints) {
      return config.level;
    }
  }
  return 'normal';
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
  { id: 'M001', name: '张三', phone: '13800138001', discount: 0.88, balance: 500, points: 320, level: 'silver' as MemberLevel, totalConsume: 680, createdAt: new Date(Date.now() - 86400000 * 90).toISOString() },
  { id: 'M002', name: '李四', phone: '13800138002', discount: 0.8, balance: 200, points: 150, level: 'gold' as MemberLevel, totalConsume: 2580, createdAt: new Date(Date.now() - 86400000 * 60).toISOString() },
  { id: 'M003', name: '王五', phone: '13800138003', discount: 0.95, balance: 1000, points: 580, level: 'normal' as MemberLevel, totalConsume: 320, createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
];
