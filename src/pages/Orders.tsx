import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Eye } from 'lucide-react';
import { useOrderStore } from '@/store';
import type { OrderStatus } from '@/types';
import { ORDER_STATUS_NAMES } from '@/config/prices';
import { formatDate, formatCurrency, isOverdue, getOverdueDays } from '@/utils';
import OrderStatusBadge from '@/components/OrderStatusBadge';

export default function Orders() {
  const navigate = useNavigate();
  const { orders, searchOrders } = useOrderStore();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = searchOrders(keyword).filter(
    (o) => statusFilter === 'all' || o.status === statusFilter
  );

  const statusTabs: { key: OrderStatus | 'all'; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: ORDER_STATUS_NAMES.pending },
    { key: 'ready', label: ORDER_STATUS_NAMES.ready },
    { key: 'picked', label: ORDER_STATUS_NAMES.picked },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">订单管理</h2>
          <p className="text-sm text-slate-500 mt-1">共 {filteredOrders.length} 条订单记录</p>
        </div>
        <button
          onClick={() => navigate('/orders/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          新建订单
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索客户姓名、电话、会员号..."
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <div className="flex bg-slate-100 rounded-lg p-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === tab.key
                      ? 'bg-white text-sky-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">客户信息</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">衣物数量</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">金额</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">送洗时间</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    暂无订单记录
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const overdue = isOverdue(order);
                  const overdueDays = getOverdueDays(order);
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${overdue ? 'bg-orange-50/50' : ''}`}
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-cyan-300 flex items-center justify-center text-white font-semibold">
                            {order.customerName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{order.customerName}</p>
                            <p className="text-sm text-slate-500">{order.customerPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-slate-700 font-medium">
                          {order.items.reduce((sum, i) => sum + i.quantity, 0)} 件
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800">{formatCurrency(order.finalAmount)}</span>
                        {order.memberDiscount < 1 && (
                          <span className="ml-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            会员{Math.round(order.memberDiscount * 10)}折
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <OrderStatusBadge status={order.status} />
                          {overdue && (
                            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full font-medium">
                              超期{overdueDays}天
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/orders/${order.id}`);
                          }}
                          className="flex items-center gap-1 text-sm text-sky-600 hover:text-sky-700 font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          查看
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
