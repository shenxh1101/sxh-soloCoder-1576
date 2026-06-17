import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Shirt,
  Droplets,
  Wind,
  DollarSign,
  Trophy,
  Award,
  Wallet,
  CreditCard,
  Clock,
  Coins,
  PieChart,
  Users,
  Gift,
} from 'lucide-react';
import { useOrderStore } from '@/store';
import {
  getMonthlyStatistics,
  getCustomerRankingByAmount,
  getCustomerRankingByItems,
  formatCurrency,
} from '@/utils';

export default function Statistics() {
  const { orders, getMemberStats } = useOrderStore();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const stats = useMemo(() => getMonthlyStatistics(orders, year, month), [orders, year, month]);
  const rankingByAmount = useMemo(() => getCustomerRankingByAmount(orders, year, month), [orders, year, month]);
  const rankingByItems = useMemo(() => getCustomerRankingByItems(orders, year, month), [orders, year, month]);
  const memberStats = useMemo(() => getMemberStats(year, month), [getMemberStats, year, month]);

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

  const revenueCards = [
    {
      label: '水洗收入',
      value: stats.waterRevenue,
      icon: Droplets,
      color: 'from-sky-500 to-cyan-400',
      bgColor: 'bg-sky-50',
      iconColor: 'text-sky-500',
    },
    {
      label: '干洗收入',
      value: stats.dryRevenue,
      icon: Wind,
      color: 'from-amber-500 to-orange-400',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      label: '已收金额',
      value: stats.receivedRevenue,
      icon: Wallet,
      color: 'from-emerald-500 to-green-400',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      label: '未收金额',
      value: stats.unpaidRevenue,
      icon: Clock,
      color: 'from-rose-500 to-red-400',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-500',
    },
  ];

  const memberStatCards = [
    {
      label: '会员充值总额',
      value: memberStats.totalRecharge,
      icon: Coins,
      color: 'from-emerald-500 to-teal-400',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      label: '会员消费总额',
      value: memberStats.totalMemberConsume,
      icon: Users,
      color: 'from-sky-500 to-cyan-400',
      bgColor: 'bg-sky-50',
      iconColor: 'text-sky-500',
    },
    {
      label: '普通订单收入',
      value: memberStats.normalOrderRevenue,
      icon: DollarSign,
      color: 'from-violet-500 to-purple-400',
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-500',
    },
    {
      label: '积分发放数量',
      value: memberStats.totalPointsIssued,
      icon: Gift,
      color: 'from-amber-500 to-orange-400',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
      unit: '分',
    },
  ];

  const waterPercent = stats.totalItems > 0 ? (stats.waterItems / stats.totalItems) * 100 : 0;
  const dryPercent = stats.totalItems > 0 ? (stats.dryItems / stats.totalItems) * 100 : 0;

  const rankColors = [
    'from-amber-400 to-yellow-300',
    'from-slate-300 to-slate-200',
    'from-orange-400 to-amber-300',
  ];

  const renderRanking = (
    ranking: Array<{ customerName: string; customerPhone: string; orderCount: number; totalAmount: number; totalItems: number }>,
    valueKey: 'totalAmount' | 'totalItems',
    valueLabel: string,
    title: string
  ) => {
    if (ranking.length === 0) {
      return (
        <div className="text-center py-12">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">本月暂无数据</p>
        </div>
      );
    }

    return (
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
            <div className="text-right">
              <span className="font-semibold text-slate-800">
                {valueKey === 'totalAmount'
                  ? formatCurrency(customer.totalAmount)
                  : `${customer.totalItems} 件`}
              </span>
              <p className="text-xs text-slate-400">{valueLabel}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
          <span className="px-4 font-semibold text-slate-800 min-w-[120px] text-center">
            {monthLabel}
          </span>
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

      <div className="grid grid-cols-4 gap-6">
        {revenueCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {formatCurrency(stat.value)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-6">
        {memberStatCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {stat.unit ? `${stat.value} ${stat.unit}` : formatCurrency(stat.value)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <PieChart className="w-5 h-5 text-sky-600" />
          <h3 className="text-lg font-semibold text-slate-800">会员经营分析</h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">余额支付金额</span>
                <span className="text-sm font-semibold text-sky-600">
                  {formatCurrency(memberStats.balancePaymentAmount)}
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, memberStats.balancePaymentRatio * 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                余额支付占比：{(memberStats.balancePaymentRatio * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-sky-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-sky-600" />
                <p className="text-xs text-sky-700">会员收入占比</p>
              </div>
              <p className="text-2xl font-bold text-sky-600">
                {stats.totalRevenue > 0
                  ? ((memberStats.totalMemberConsume / stats.totalRevenue) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <p className="text-xs text-emerald-700">普通订单占比</p>
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {stats.totalRevenue > 0
                  ? ((memberStats.normalOrderRevenue / stats.totalRevenue) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
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
              <span className="text-2xl font-bold text-emerald-600">
                {formatCurrency(stats.totalRevenue)}
              </span>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-slate-700 mb-4">水洗 / 干洗 占比</h4>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-500" />
                  水洗 {stats.waterItems} 件 · {formatCurrency(stats.waterRevenue)}
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
                  干洗 {stats.dryItems} 件 · {formatCurrency(stats.dryRevenue)}
                </span>
                <span className="text-sm font-semibold text-amber-600">
                  {dryPercent.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-700"
                  style={{ width: `${dryPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700 mb-4">收款情况</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm text-emerald-700">已收金额</p>
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(stats.receivedRevenue)}
                </p>
              </div>
              <div className="p-4 bg-rose-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <p className="text-sm text-rose-700">未收金额</p>
                </div>
                <p className="text-2xl font-bold text-rose-600">
                  {formatCurrency(stats.unpaidRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-slate-800">消费金额排行</h3>
            </div>
            {renderRanking(rankingByAmount.slice(0, 5), 'totalAmount', '累计消费', '消费金额排行')}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Shirt className="w-5 h-5 text-sky-500" />
              <h3 className="text-lg font-semibold text-slate-800">洗衣件数排行</h3>
            </div>
            {renderRanking(rankingByItems.slice(0, 5), 'totalItems', '累计件数', '洗衣件数排行')}
          </div>
        </div>
      </div>
    </div>
  );
}
