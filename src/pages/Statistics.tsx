import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Shirt, Droplets, Wind, DollarSign, Trophy, Award } from 'lucide-react';
import { useOrderStore } from '@/store';
import { getMonthlyStatistics, getCustomerRanking, formatCurrency } from '@/utils';

export default function Statistics() {
  const { orders } = useOrderStore();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const stats = useMemo(() => getMonthlyStatistics(orders, year, month), [orders, year, month]);
  const ranking = useMemo(() => getCustomerRanking(orders, year, month), [orders, year, month]);

  const goPrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const monthLabel = `${year}年${month + 1}月`;

  const statCards = [
    {
      label: '总订单数',
      value: stats.totalOrders,
      unit: '单',
      icon: TrendingUp,
      color: 'from-sky-500 to-cyan-400',
      bgColor: 'bg-sky-50',
      iconColor: 'text-sky-500',
    },
    {
      label: '总件数',
      value: stats.totalItems,
      unit: '件',
      icon: Shirt,
      color: 'from-violet-500 to-purple-400',
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-500',
    },
    {
      label: '水洗件数',
      value: stats.waterItems,
      unit: '件',
      icon: Droplets,
      color: 'from-blue-500 to-sky-400',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      label: '干洗件数',
      value: stats.dryItems,
      unit: '件',
      icon: Wind,
      color: 'from-amber-500 to-orange-400',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
  ];

  const waterPercent = stats.totalItems > 0 ? (stats.waterItems / stats.totalItems) * 100 : 0;
  const dryPercent = stats.totalItems > 0 ? (stats.dryItems / stats.totalItems) * 100 : 0;

  const rankColors = [
    'from-amber-400 to-yellow-300',
    'from-slate-300 to-slate-200',
    'from-orange-400 to-amber-300',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">统计报表</h2>
          <p className="text-sm text-slate-500 mt-1">查看月度经营数据和客户消费排行</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={goPrevMonth}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 font-semibold text-slate-800 min-w-[120px] text-center">{monthLabel}</span>
          <button
            onClick={goNextMonth}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {statCards.map((stat) => (
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
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">本月收入</h3>
              <p className="text-sm text-slate-500 mt-0.5">{monthLabel} 营业总额</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</span>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-slate-700 mb-4">水洗 / 干洗 占比</h4>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-500" />
                  水洗 {stats.waterItems} 件
                </span>
                <span className="text-sm font-semibold text-sky-600">{waterPercent.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-amber-500" />
                  干洗 {stats.dryItems} 件
                </span>
                <span className="text-sm font-semibold text-amber-600">{dryPercent.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-700"
                  style={{ width: `${dryPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-800">客户消费排行</h3>
          </div>

          {ranking.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">本月暂无订单数据</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ranking.map((customer, index) => (
                <div
                  key={customer.customerPhone}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    index < 3 ? 'bg-gradient-to-r from-slate-50 to-transparent' : 'hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      index < 3
                        ? `bg-gradient-to-br ${rankColors[index]} text-white shadow-sm`
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{customer.customerName}</p>
                    <p className="text-xs text-slate-500">{customer.orderCount} 单</p>
                  </div>
                  <span className="font-semibold text-slate-800">{formatCurrency(customer.totalAmount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
