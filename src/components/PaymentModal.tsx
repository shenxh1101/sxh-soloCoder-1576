import { useState, useMemo } from 'react';
import { X, DollarSign, Receipt, Check, Banknote, Smartphone, CreditCard, Award } from 'lucide-react';
import type { PaymentMethod, ReceiptData } from '@/types';
import { PAYMENT_METHOD_NAMES } from '@/config/prices';
import { formatCurrency, formatDate } from '@/utils';

interface Props {
  orderNo: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  memberDiscount: number;
  onConfirm: (data: { paymentMethod: PaymentMethod; receivedAmount: number }) => void;
  onCancel: () => void;
  receipt?: ReceiptData | null;
}

const paymentMethods: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: 'cash', label: '现金', icon: Banknote },
  { value: 'wechat', label: '微信', icon: Smartphone },
  { value: 'alipay', label: '支付宝', icon: Smartphone },
  { value: 'card', label: '会员卡', icon: CreditCard },
];

export default function PaymentModal({
  orderNo,
  customerName,
  customerPhone,
  amount,
  memberDiscount,
  onConfirm,
  onCancel,
  receipt,
}: Props) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [receivedAmount, setReceivedAmount] = useState<string>(amount.toString());
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<ReceiptData | null>(receipt || null);

  const numReceived = parseFloat(receivedAmount) || 0;
  const change = useMemo(
    () => Math.max(0, Math.round((numReceived - amount) * 100) / 100),
    [numReceived, amount]
  );

  const handleQuickAmount = (val: number) => {
    setReceivedAmount(val.toString());
  };

  const handleConfirm = () => {
    if (numReceived < amount) {
      alert('实收金额不能小于应收金额');
      return;
    }
    onConfirm({ paymentMethod, receivedAmount: numReceived });
    setShowReceipt(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const displayReceipt = lastReceipt || receipt;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {!showReceipt ? (
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">取衣收款</h3>
              <button
                onClick={onCancel}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="p-4 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">订单号</span>
                <span className="font-mono font-semibold text-sky-700">{orderNo}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">客户</span>
                <span className="font-medium text-slate-800">{customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">电话</span>
                <span className="text-slate-700">{customerPhone}</span>
              </div>
            </div>

            <div className="text-center py-4">
              <p className="text-sm text-slate-500 mb-1">应收金额</p>
              <p className="text-4xl font-bold text-slate-800">{formatCurrency(amount)}</p>
              {memberDiscount < 1 && (
                <p className="text-sm text-emerald-600 mt-2">
                  已享受会员 {Math.round(memberDiscount * 10)} 折优惠
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">付款方式</p>
              <div className="grid grid-cols-4 gap-2">
                {paymentMethods.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setPaymentMethod(m.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === m.value
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <m.icon className="w-5 h-5" />
                    <span className="text-xs font-semibold">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">实收金额</p>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xl font-semibold text-right focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-2 mt-3">
                {[amount, Math.ceil(amount / 10) * 10, Math.ceil(amount / 50) * 50, Math.ceil(amount / 100) * 100]
                  .filter((v, i, arr) => arr.indexOf(v) === i && v > 0)
                  .slice(0, 4)
                  .map((val) => (
                    <button
                      key={val}
                      onClick={() => handleQuickAmount(val)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        numReceived === val
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ¥{val}
                    </button>
                  ))}
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 font-medium">找零</span>
                <span className="text-2xl font-bold text-emerald-700">{formatCurrency(change)}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all duration-200"
            >
              <Check className="w-4 h-4" />
              确认收款
            </button>
          </div>
        </div>
      ) : (
        displayReceipt && (
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-6 text-center border-b-2 border-dashed border-slate-200">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">取衣小票</h3>
              <p className="text-sm text-slate-500 mt-1">洁衣坊洗衣店</p>
            </div>

            <div className="p-6 space-y-3 print:p-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">订单号</span>
                <span className="font-mono font-semibold">{displayReceipt.orderNo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">客户</span>
                <span className="text-slate-800">{displayReceipt.customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">电话</span>
                <span className="text-slate-800">{displayReceipt.customerPhone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">时间</span>
                <span className="text-slate-800">{formatDate(displayReceipt.paidAt)}</span>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-3 mt-3">
                {displayReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span className="text-slate-600">
                      {item.washTypeName} {item.clothingTypeName} × {item.quantity}
                    </span>
                    <span className="text-slate-800">¥{item.subtotal}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-200 pt-3 mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">原价</span>
                  <span className="text-slate-700">{formatCurrency(displayReceipt.totalAmount)}</span>
                </div>
                {displayReceipt.memberDiscount < 1 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>会员{Math.round(displayReceipt.memberDiscount * 10)}折</span>
                    <span>
                      -{formatCurrency(displayReceipt.totalAmount - displayReceipt.finalAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">实付</span>
                  <span className="text-lg text-sky-600">{formatCurrency(displayReceipt.finalAmount)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-3 mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">付款方式</span>
                  <span className="text-slate-800">{displayReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">实收</span>
                  <span className="text-slate-800">{formatCurrency(displayReceipt.receivedAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">找零</span>
                  <span className="text-slate-800">{formatCurrency(displayReceipt.change)}</span>
                </div>
              </div>

              <div className="text-center pt-4 mt-4 border-t border-dashed border-slate-200">
                <Award className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                <p className="text-xs text-slate-500">感谢您的惠顾！</p>
                <p className="text-xs text-slate-400 mt-1">衣物请妥善保管，如有问题7天内联系</p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
              >
                <Receipt className="w-4 h-4" />
                打印小票
              </button>
              <button
                onClick={() => {
                  onCancel();
                  setShowReceipt(false);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all duration-200"
              >
                完成
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
