import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, User, Calendar, CheckCircle2, Package, Clock, Receipt, CreditCard } from 'lucide-react';
import { useOrderStore } from '@/store';
import type { OrderStatus, PaymentMethod } from '@/types';
import { formatDate, formatCurrency, isOverdue, getOverdueDays } from '@/utils';
import { PAYMENT_METHOD_NAMES } from '@/config/prices';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import PaymentModal from '@/components/PaymentModal';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderById, updateOrderStatus, processPayment } = useOrderStore();
  const [showPayment, setShowPayment] = useState(false);

  const order = getOrderById(id || '');

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">订单不存在</p>
        <button
          onClick={() => navigate('/orders')}
          className="mt-4 text-sky-600 hover:text-sky-700"
        >
          返回订单列表
        </button>
      </div>
    );
  }

  const overdue = isOverdue(order);
  const overdueDays = getOverdueDays(order);

  const nextStatus: Record<OrderStatus, { status: OrderStatus; label: string; icon: typeof CheckCircle2 } | null> = {
    pending: { status: 'ready', label: '标记已洗好', icon: CheckCircle2 },
    ready: { status: 'picked', label: '确认客户取走', icon: Package },
    picked: null,
  };

  const nextAction = nextStatus[order.status];

  const statusSteps: { status: OrderStatus; label: string; date?: string; icon: typeof Clock }[] = [
    { status: 'pending', label: '已下单', date: order.createdAt, icon: Clock },
    { status: 'ready', label: '已洗好', date: order.readyAt, icon: CheckCircle2 },
    { status: 'picked', label: '已取走', date: order.pickedAt, icon: Package },
  ];

  const statusOrder: OrderStatus[] = ['pending', 'ready', 'picked'];
  const currentStatusIndex = statusOrder.indexOf(order.status);

  const handleNextAction = () => {
    if (!nextAction) return;
    if (nextAction.status === 'ready') {
      updateOrderStatus(order.id, 'ready');
    } else if (nextAction.status === 'picked') {
      setShowPayment(true);
    }
  };

  const handlePaymentConfirm = (data: { paymentMethod: PaymentMethod; receivedAmount: number }) => {
    processPayment(order.id, data);
  };

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
          <h2 className="text-2xl font-bold text-slate-800">订单详情</h2>
          <p className="text-sm text-slate-500 mt-1">订单号：{order.orderNo}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">订单进度</h3>
            <div className="relative">
              <div className="absolute top-6 left-12 right-12 h-0.5 bg-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${(currentStatusIndex / 2) * 100}%` }}
                />
              </div>
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const isCompleted = index < currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  return (
                    <div key={step.status} className="flex flex-col items-center gap-3 z-10">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted || isCurrent
                            ? 'bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-200'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <p
                          className={`text-sm font-semibold ${
                            isCompleted || isCurrent ? 'text-slate-800' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.date && (
                          <p className="text-xs text-slate-500 mt-1">{formatDate(step.date)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">衣物明细</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase">洗涤类型</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase">衣物</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-slate-500 uppercase">单价</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-slate-500 uppercase">数量</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-slate-500 uppercase">小计</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-2">
                      <span
                        className={`text-sm font-medium ${
                          item.washType === 'dry' ? 'text-purple-600' : 'text-sky-600'
                        }`}
                      >
                        {item.washTypeName}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-700">{item.clothingTypeName}</td>
                    <td className="py-3 px-2 text-right text-slate-600">¥{item.unitPrice}</td>
                    <td className="py-3 px-2 text-right text-slate-600">{item.quantity}</td>
                    <td className="py-3 px-2 text-right font-semibold text-slate-800">¥{item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {order.payment && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="w-5 h-5 text-sky-600" />
                <h3 className="text-lg font-semibold text-slate-800">收款记录</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">付款方式</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {PAYMENT_METHOD_NAMES[order.payment.paymentMethod]}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">收款时间</p>
                  <p className="font-semibold text-slate-800">{formatDate(order.payment.paidAt)}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-emerald-600 mb-1">应收金额</p>
                  <p className="font-semibold text-emerald-700">{formatCurrency(order.payment.amount)}</p>
                </div>
                <div className="p-4 bg-sky-50 rounded-xl">
                  <p className="text-xs text-sky-600 mb-1">实收金额</p>
                  <p className="font-semibold text-sky-700">{formatCurrency(order.payment.receivedAmount)}</p>
                </div>
              </div>
              {order.payment.change > 0 && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl text-center">
                  <p className="text-sm text-amber-700">
                    找零：<span className="font-bold text-lg">{formatCurrency(order.payment.change)}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {order.receipt && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-sky-600" />
                  <h3 className="text-lg font-semibold text-slate-800">取衣小票</h3>
                </div>
                <button
                  onClick={() => window.print()}
                  className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
                >
                  <Receipt className="w-4 h-4" />
                  打印
                </button>
              </div>
              <div className="max-w-sm mx-auto border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/50">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center mx-auto mb-2 shadow">
                    <Receipt className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-slate-800">洁衣坊取衣小票</p>
                  <p className="text-xs text-slate-500">{formatDate(order.receipt.paidAt)}</p>
                </div>
                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">订单号</span>
                    <span className="font-mono font-semibold">{order.receipt.orderNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">客户</span>
                    <span>{order.receipt.customerName}</span>
                  </div>
                  <div className="border-t border-dashed border-slate-300 my-2" />
                  {order.receipt.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-slate-600">
                        {item.washTypeName} {item.clothingTypeName} × {item.quantity}
                      </span>
                      <span>¥{item.subtotal}</span>
                    </div>
                  ))}
                  <div className="border-t border-dashed border-slate-300 my-2" />
                  <div className="flex justify-between">
                    <span className="text-slate-500">原价</span>
                    <span>{formatCurrency(order.receipt.totalAmount)}</span>
                  </div>
                  {order.receipt.memberDiscount < 1 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>会员{Math.round(order.receipt.memberDiscount * 10)}折</span>
                      <span>-{formatCurrency(order.receipt.totalAmount - order.receipt.finalAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sky-600 text-sm mt-1">
                    <span>实付</span>
                    <span>{formatCurrency(order.receipt.finalAmount)}</span>
                  </div>
                  <div className="border-t border-dashed border-slate-300 my-2" />
                  <div className="flex justify-between">
                    <span className="text-slate-500">付款方式</span>
                    <span>{order.receipt.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">实收</span>
                    <span>{formatCurrency(order.receipt.receivedAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">找零</span>
                    <span>{formatCurrency(order.receipt.change)}</span>
                  </div>
                </div>
                <div className="text-center mt-4 pt-3 border-t border-dashed border-slate-300">
                  <p className="text-xs text-slate-400">感谢惠顾！衣物如有问题7天内联系</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className={`bg-white rounded-2xl p-6 border shadow-sm ${overdue ? 'border-orange-200' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">客户信息</h3>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">客户姓名</p>
                  <p className="font-semibold text-slate-800">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">联系电话</p>
                  <p className="font-semibold text-slate-800">{order.customerPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">送洗时间</p>
                  <p className="font-semibold text-slate-800">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              {order.memberId && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <p className="text-sm text-emerald-700">
                    会员号：<span className="font-semibold">{order.memberId}</span>
                    <span className="ml-2">享受 {Math.round(order.memberDiscount * 10)} 折优惠</span>
                  </p>
                </div>
              )}
              {overdue && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                  <p className="text-sm text-orange-700 font-semibold">
                    ⚠️ 已超期 {overdueDays} 天未取，请及时联系客户！
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">费用明细</h3>
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between text-slate-600">
                <span>原价合计</span>
                <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
              </div>
              {order.memberDiscount < 1 && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span>会员折扣 ({Math.round(order.memberDiscount * 10)}折)</span>
                  <span className="font-medium">
                    -{formatCurrency(Math.round((order.totalAmount - order.finalAmount) * 100) / 100)}
                  </span>
                </div>
              )}
            </div>
            <div className="pt-4">
              <div className="flex items-end justify-between">
                <span className="text-slate-700 font-medium">应付金额</span>
                <span className="text-3xl font-bold text-slate-800">{formatCurrency(order.finalAmount)}</span>
              </div>
            </div>
          </div>

          {nextAction && (
            <button
              onClick={handleNextAction}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all duration-200 hover:-translate-y-0.5"
            >
              <nextAction.icon className="w-5 h-5" />
              {nextAction.label}
            </button>
          )}
          {order.status === 'picked' && order.payment && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <p className="text-emerald-700 font-medium">✓ 订单已完成，客户已取走衣物</p>
              <p className="text-xs text-emerald-600 mt-1">
                {PAYMENT_METHOD_NAMES[order.payment.paymentMethod]} 收款 {formatCurrency(order.payment.receivedAmount)}
              </p>
            </div>
          )}
          {order.status === 'picked' && !order.payment && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <p className="text-amber-700 font-medium">⚠️ 订单已取走但无收款记录</p>
            </div>
          )}
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          orderNo={order.orderNo}
          customerName={order.customerName}
          customerPhone={order.customerPhone}
          amount={order.finalAmount}
          memberDiscount={order.memberDiscount}
          receipt={order.receipt || null}
          onConfirm={handlePaymentConfirm}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
