import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, User, Phone, IdCard, Tag, Check, AlertCircle } from 'lucide-react';
import { useOrderStore } from '@/store';
import type { WashType, ClothingType, OrderItem } from '@/types';
import { CLOTHING_TYPE_NAMES, WASH_TYPE_NAMES } from '@/config/prices';
import { generateId, calculateTotalAmount, calculateFinalAmount, formatCurrency, formatDiscount } from '@/utils';

const clothingOptions: ClothingType[] = ['shirt', 'pants', 'coat', 'bedding'];

export default function NewOrder() {
  const navigate = useNavigate();
  const { addOrder, getMemberById, getMemberByPhone, getPrice } = useOrderStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [memberIdInput, setMemberIdInput] = useState('');
  const [memberDiscount, setMemberDiscount] = useState(1);
  const [memberName, setMemberName] = useState('');
  const [memberId, setMemberId] = useState<string | undefined>(undefined);
  const [memberError, setMemberError] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [currentWashType, setCurrentWashType] = useState<WashType>('water');
  const [currentClothing, setCurrentClothing] = useState<ClothingType>('shirt');
  const [currentQuantity, setCurrentQuantity] = useState(1);

  const resetMemberState = useCallback(() => {
    setMemberDiscount(1);
    setMemberName('');
    setMemberId(undefined);
    setMemberError('');
  }, []);

  const searchMember = useCallback(
    (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) {
        resetMemberState();
        return;
      }

      let member = getMemberById(trimmed);
      if (!member && /^\d{11}$/.test(trimmed)) {
        member = getMemberByPhone(trimmed);
      }

      if (member) {
        setMemberDiscount(member.discount);
        setMemberName(member.name);
        setMemberId(member.id);
        setMemberError('');
        if (!customerName) setCustomerName(member.name);
        if (!customerPhone) setCustomerPhone(member.phone);
      } else {
        resetMemberState();
        setMemberError('未找到该会员，请检查会员号或手机号');
      }
    },
    [getMemberById, getMemberByPhone, customerName, customerPhone, resetMemberState]
  );

  useEffect(() => {
    searchMember(memberIdInput);
  }, [memberIdInput, searchMember]);

  const handleMemberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMemberIdInput(e.target.value);
  };

  const getCurrentUnitPrice = useCallback(
    (washType: WashType, clothingType: ClothingType) => {
      return getPrice(washType, clothingType);
    },
    [getPrice]
  );

  const addItem = () => {
    if (currentQuantity < 1) return;
    const unitPrice = getCurrentUnitPrice(currentWashType, currentClothing);
    const subtotal = unitPrice * currentQuantity;
    const newItem: OrderItem = {
      id: generateId(),
      washType: currentWashType,
      clothingType: currentClothing,
      clothingTypeName: CLOTHING_TYPE_NAMES[currentClothing],
      washTypeName: WASH_TYPE_NAMES[currentWashType],
      quantity: currentQuantity,
      unitPrice,
      subtotal,
    };
    setItems([...items, newItem]);
    setCurrentQuantity(1);
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter((i) => i.id !== itemId));
  };

  const handleSubmit = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('请填写客户姓名和电话');
      return;
    }
    if (items.length === 0) {
      alert('请至少添加一件衣物');
      return;
    }

    let finalMemberDiscount = 1;
    let finalMemberId: string | undefined = undefined;
    const input = memberIdInput.trim();

    if (input) {
      let member = getMemberById(input);
      if (!member && /^\d{11}$/.test(input)) {
        member = getMemberByPhone(input);
      }
      if (member) {
        finalMemberDiscount = member.discount;
        finalMemberId = member.id;
      }
    }

    const recalculatedItems = items.map((item) => ({
      ...item,
      unitPrice: getPrice(item.washType, item.clothingType),
      subtotal: getPrice(item.washType, item.clothingType) * item.quantity,
    }));
    const recalculatedTotal = calculateTotalAmount(recalculatedItems);
    const recalculatedFinal = calculateFinalAmount(recalculatedTotal, finalMemberDiscount);

    addOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      memberId: finalMemberId,
      memberDiscount: finalMemberDiscount,
      status: 'pending',
      items: recalculatedItems,
      totalAmount: recalculatedTotal,
      finalAmount: recalculatedFinal,
    });

    navigate('/orders');
  };

  const totalAmount = useMemo(() => calculateTotalAmount(items), [items]);
  const finalAmount = useMemo(() => calculateFinalAmount(totalAmount, memberDiscount), [totalAmount, memberDiscount]);
  const discountAmount = useMemo(() => Math.round((totalAmount - finalAmount) * 100) / 100, [totalAmount, finalAmount]);
  const currentUnitPrice = getCurrentUnitPrice(currentWashType, currentClothing);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">创建新订单</h2>
          <p className="text-sm text-slate-500 mt-1">录入客户衣物信息，系统自动计算价格</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">客户信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <User className="w-4 h-4 text-slate-400" />
                  客户姓名
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="请输入客户姓名"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  联系电话
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="请输入手机号码"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <IdCard className="w-4 h-4 text-slate-400" />
                  会员号 / 手机号（选填）
                </label>
                <input
                  type="text"
                  value={memberIdInput}
                  onChange={handleMemberInputChange}
                  placeholder="输入会员号或手机号，实时查询会员折扣"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
                {memberDiscount < 1 && memberName && (
                  <div className="mt-3 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm text-emerald-700">
                      会员「{memberName}」（{memberId}），享 <strong>{formatDiscount(memberDiscount)}</strong> 优惠
                    </span>
                  </div>
                )}
                {memberError && memberIdInput.trim() && (
                  <div className="mt-3 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                    <span className="text-sm text-rose-700">{memberError}</span>
                  </div>
                )}
                {!memberIdInput.trim() && (
                  <p className="mt-2 text-xs text-slate-500">
                    未输入会员信息，按原价计算
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">添加衣物</h3>

            <div className="mb-4">
              <p className="text-sm font-medium text-slate-700 mb-3">洗涤类型</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCurrentWashType('water')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    currentWashType === 'water'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className={`font-semibold ${currentWashType === 'water' ? 'text-sky-700' : 'text-slate-700'}`}>
                    💧 水洗
                  </p>
                  <p className="text-xs text-slate-500 mt-1">经济实惠，适合日常衣物</p>
                </button>
                <button
                  onClick={() => setCurrentWashType('dry')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    currentWashType === 'dry'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className={`font-semibold ${currentWashType === 'dry' ? 'text-sky-700' : 'text-slate-700'}`}>
                    ✨ 干洗
                  </p>
                  <p className="text-xs text-slate-500 mt-1">高档护理，适合西装外套</p>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-slate-700 mb-3">衣物类型</p>
              <div className="grid grid-cols-4 gap-3">
                {clothingOptions.map((type) => {
                  const price = getCurrentUnitPrice(currentWashType, type);
                  return (
                    <button
                      key={type}
                      onClick={() => setCurrentClothing(type)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        currentClothing === type
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className={`font-semibold ${currentClothing === type ? 'text-sky-700' : 'text-slate-700'}`}>
                        {CLOTHING_TYPE_NAMES[type]}
                      </p>
                      <p className={`text-xs mt-1 ${currentClothing === type ? 'text-sky-600' : 'text-slate-500'}`}>
                        ¥{price}/件
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 mb-2 block">件数</label>
                <input
                  type="number"
                  min="1"
                  value={currentQuantity}
                  onChange={(e) => setCurrentQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="pb-2">
                <p className="text-sm text-slate-500">小计</p>
                <p className="text-xl font-bold text-slate-800">
                  {formatCurrency(currentUnitPrice * currentQuantity)}
                </p>
              </div>
              <button
                onClick={addItem}
                className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                添加
              </button>
            </div>
          </div>

          {items.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">已添加衣物</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase">洗涤类型</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase">衣物</th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-slate-500 uppercase">单价</th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-slate-500 uppercase">数量</th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-slate-500 uppercase">小计</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-2">
                        <span className={`text-sm font-medium ${item.washType === 'dry' ? 'text-purple-600' : 'text-sky-600'}`}>
                          {item.washTypeName}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-700">{item.clothingTypeName}</td>
                      <td className="py-3 px-2 text-right text-slate-600">¥{item.unitPrice}</td>
                      <td className="py-3 px-2 text-right text-slate-600">{item.quantity}</td>
                      <td className="py-3 px-2 text-right font-semibold text-slate-800">¥{item.subtotal}</td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm sticky top-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">订单金额</h3>

            <div className="space-y-4 pb-6 border-b border-slate-100">
              <div className="flex items-center justify-between text-slate-600">
                <span>衣物件数</span>
                <span className="font-medium">{items.reduce((s, i) => s + i.quantity, 0)} 件</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>原价合计</span>
                <span className="font-medium">{formatCurrency(totalAmount)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {formatDiscount(memberDiscount)}
                  </span>
                  <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="py-6">
              <div className="flex items-end justify-between">
                <span className="text-slate-700 font-medium">应付金额</span>
                <span className="text-3xl font-bold text-slate-800">{formatCurrency(finalAmount)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!customerName || !customerPhone || items.length === 0}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              确认创建订单
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
