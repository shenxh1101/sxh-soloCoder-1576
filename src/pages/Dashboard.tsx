import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  AlertTriangle,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { useOrderStore } from '@/store';
import { isToday, isOverdue, getOverdueDays, formatCurrency, formatDateShort } from '@/utils';
import OrderStatusBadge from '@/components/OrderStatusBadge';

export default function Dashboard() {
  const navigate = useNavigate();
  const { orders } = useOrderStore();

  const todayOrders = orders.filter((o) => isToday(o.createdAt));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.finalAmount, 0);
  const pendingCount = orders.filter((o) => o.status !== 'picked').length;
  const overdueOrders = orders.filter(isOverdue).sort((a, b) => getOverdueDays(b) - getOverdueDays(a));

  const stats = [
    {
      label: '今日订单',
      value: todayOrders.length,
      unit: '单',
      icon: ShoppingBag,
      color: 'from-sky-500 to-cyan-400',
      bgColor: 'bg-sky-50',
    },
    {
      label: '今日收入',
      value: todayRevenue.toFixed(2),
      unit: '元',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-400',
      bgColor: 'bg-emerald-50',
    },
    {
      label: '待取衣物',
      value: pendingCount,
      unit: '件',
      icon: Clock,
      color: 'from-amber-500 to-orange-400',
      bgColor: 'bg-amber-50',
    },
    {
      label: '超期提醒',
      value: overdueOrders.length,
      unit: '单',
      icon: AlertTriangle,
      color: 'from-rose-500 to-pink-400',
      bgColor: 'bg-rose-50',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">仪表盘</h2>
        <p className="text-sm text-slate-500 mt-1">欢迎回来，今天也要加油哦！</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {stat.value}
                  <span className="text-base font-normal text-slate-400 ml-1">{stat.unit}</span>
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} style={{ color: stat.color.includes('sky') ? '#0ea5e9' : stat.color.includes('emerald') ? '#10b981' : stat.color.includes('amber') ? '#f59e0b' : '#f43f5e' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">超期未取提醒</h3>
                <p className="text-sm text-slate-500 mt-0.5">超过3天未取的订单，请及时联系客户</p>
              </div>
              <button
                onClick={() => navigate('/orders')}
                className="flex items-center gap-1 text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                查看全部
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {overdueOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-slate-500">太棒了！目前没有超期未取的订单</p>
              </div>
            ) : (
              <div className="space-y-3">
                {overdueOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 hover:border-orange-200 transition-colors cursor-pointer"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-800">{order.customerName}</p>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">{order.customerPhone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">超期 {getOverdueDays(order)} 天</p>
                      <p className="text-sm text-slate-500 mt-0.5">送洗日期：{formatDateShort(order.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">快捷操作</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders/new')}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-medium hover:shadow-lg hover:shadow-sky-200 transition-all duration-200 hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-5 h-5" />
              创建新订单
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              查看所有订单
            </button>
            <button
              onClick={() => navigate('/statistics')}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
            >
              <DollarSign className="w-5 h-5" />
              查看经营统计
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
