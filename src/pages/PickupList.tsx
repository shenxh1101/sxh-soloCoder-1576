import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  Clock,
  AlertTriangle,
  ChevronRight,
  Search,
  Filter,
  CheckCircle,
  Calendar,
  User,
} from 'lucide-react';
import { useOrderStore } from '@/store';
import { formatDate, formatCurrency, isOverdue, getReadyDays, formatDiscount } from '@/utils';
import OrderStatusBadge from '@/components/OrderStatusBadge';

export default function PickupList() {
  const navigate = useNavigate();
  const { getOrdersByStatus, addReminder } = useOrderStore();
  const [phoneKeyword, setPhoneKeyword] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'overdue' | 'normal'>('all');
  const [sortBy, setSortBy] = useState<'days' | 'date'>('days');

  const readyOrders = useMemo(() => {
    return getOrdersByStatus('ready');
  }, [getOrdersByStatus]);

  const filteredOrders = useMemo(() => {
    let list = readyOrders;

    if (phoneKeyword) {
      list = list.filter((o) => o.customerPhone.includes(phoneKeyword));
    }

    if (filterType === 'overdue') {
      list = list.filter((o) => isOverdue(o));
    } else if (filterType === 'normal') {
      list = list.filter((o) => !isOverdue(o));
    }

    list = [...list].sort((a, b) => {
      if (sortBy === 'days') {
        return getReadyDays(b) - getReadyDays(a);
      } else {
        return new Date(b.readyAt || '').getTime() - new Date(a.readyAt || '').getTime();
      }
    });

    return list;
  }, [readyOrders, phoneKeyword, filterType, sortBy]);

  const handleReminder = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要记录一次电话催取吗？')) {
      addReminder(orderId, '电话提醒客户取衣');
    }
  };

  const getLastReminder = (order: { reminderRecords?: { remindedAt: string }[] }) => {
    if (!order.reminderRecords || order.reminderRecords.length === 0) return null;
    return order.reminderRecords[0];
  };

  const overdueCount = readyOrders.filter((o) => isOverdue(o)).length;
  const normalCount = readyOrders.length - overdueCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">待取列表</h2>
          <p className="text-sm text-slate-500 mt-1">
            共 {readyOrders.length} 单待取，其中超期 {overdueCount} 单
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{readyOrders.length}</p>
              <p className="text-sm text-slate-500">待取总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{overdueCount}</p>
              <p className="text-sm text-slate-500">已超期</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{normalCount}</p>
              <p className="text-sm text-slate-500">正常待取</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索客户手机号..."
              value={phoneKeyword}
              onChange={(e) => setPhoneKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filterType === 'all'
                    ? 'bg-white text-sky-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterType('overdue')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filterType === 'overdue'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                超期
              </button>
              <button
                onClick={() => setFilterType('normal')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filterType === 'normal'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                正常
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">排序：</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'days' | 'date')}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="days">按洗好天数</option>
              <option value="date">按洗好日期</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
            <p className="text-slate-500">暂无待取订单</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredOrders.map((order) => {
              const overdue = isOverdue(order);
              const readyDays = getReadyDays(order);
              const lastReminder = getLastReminder(order);

              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className={`p-5 hover:bg-slate-50 cursor-pointer transition-colors ${
                    overdue ? 'bg-orange-50/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          overdue
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        {overdue ? (
                          <AlertTriangle className="w-7 h-7" />
                        ) : (
                          <CheckCircle className="w-7 h-7" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-800">
                            {order.customerName}
                          </span>
                          <OrderStatusBadge status={order.status} />
                          {overdue && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                              已超期 {readyDays - 3} 天
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {order.customerPhone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            洗好 {readyDays} 天
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {order.orderNo}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-lg font-bold text-slate-800">
                            {formatCurrency(order.finalAmount)}
                          </span>
                          {order.memberId && (
                            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                              会员 {formatDiscount(order.memberDiscount)}
                            </span>
                          )}
                          {lastReminder && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              最近催取：{formatDate(lastReminder.remindedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => handleReminder(order.id, e)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        电话催取
                      </button>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
