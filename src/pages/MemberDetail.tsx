import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Wallet,
  Trophy,
  Plus,
  CreditCard,
  Receipt,
  Percent,
  ArrowUpRight,
  TrendingUp,
  Crown,
  Search,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { useOrderStore } from '@/store';
import { formatDate, formatCurrency, formatDiscount } from '@/utils';
import {
  getMemberLevelConfig,
  getNextLevelConfig,
  MEMBER_LEVEL_CONFIG,
  PAYMENT_METHOD_NAMES,
} from '@/config/prices';
import type { PaymentMethod } from '@/types';

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getMemberById,
    getMemberRechargeRecords,
    getMemberConsumeRecords,
    rechargeMember,
  } = useOrderStore();

  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('100');

  const [filterType, setFilterType] = useState<'all' | 'recharge' | 'consume'>('all');
  const [filterPayment, setFilterPayment] = useState<PaymentMethod | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const member = getMemberById(id || '');
  const rechargeRecords = useMemo(
    () => getMemberRechargeRecords(id || ''),
    [id, getMemberRechargeRecords]
  );
  const consumeRecords = useMemo(
    () => getMemberConsumeRecords(id || ''),
    [id, getMemberConsumeRecords]
  );

  const levelConfig = member ? getMemberLevelConfig(member.level) : null;
  const nextLevelConfig = member ? getNextLevelConfig(member.level) : null;

  const upgradeProgress = useMemo(() => {
    if (!member || !nextLevelConfig) return 100;
    const current = Math.max(member.totalConsume, member.points);
    const required = Math.max(nextLevelConfig.minConsume, nextLevelConfig.minPoints);
    return Math.min(100, Math.round((current / required) * 100));
  }, [member, nextLevelConfig]);

  const filteredRechargeRecords = useMemo(() => {
    let list = rechargeRecords;
    if (filterType !== 'all' && filterType !== 'recharge') return [];
    if (searchKeyword) {
      list = list.filter((r) => r.amount.toString().includes(searchKeyword));
    }
    if (startDate) {
      list = list.filter((r) => r.rechargeAt >= startDate);
    }
    if (endDate) {
      list = list.filter((r) => r.rechargeAt <= endDate + 'T23:59:59');
    }
    return list;
  }, [rechargeRecords, filterType, searchKeyword, startDate, endDate]);

  const filteredConsumeRecords = useMemo(() => {
    let list = consumeRecords;
    if (filterType !== 'all' && filterType !== 'consume') return [];
    if (searchKeyword) {
      list = list.filter(
        (r) =>
          r.orderNo.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          r.amount.toString().includes(searchKeyword)
      );
    }
    if (filterPayment !== 'all') {
      list = list.filter((r) => r.paymentMethod === filterPayment);
    }
    if (startDate) {
      list = list.filter((r) => r.consumeAt >= startDate);
    }
    if (endDate) {
      list = list.filter((r) => r.consumeAt <= endDate + 'T23:59:59');
    }
    return list;
  }, [consumeRecords, filterType, filterPayment, searchKeyword, startDate, endDate]);

  if (!member) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">会员不存在</p>
        <button
          onClick={() => navigate('/members')}
          className="mt-4 text-sky-600 hover:text-sky-700"
        >
          返回会员列表
        </button>
      </div>
    );
  }

  const handleRecharge = () => {
    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效的充值金额');
      return;
    }
    rechargeMember(member.id, amount);
    setShowRecharge(false);
    setRechargeAmount('100');
  };

  const quickAmounts = [50, 100, 200, 500];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/members')}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">会员详情</h2>
          <p className="text-sm text-slate-500 mt-1">会员号：{member.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-sky-500 to-cyan-400 rounded-2xl p-6 text-white shadow-lg shadow-sky-200">
            <div className="flex items-start justify-between">
              <div>
                {levelConfig && (
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${levelConfig.bgColor} ${levelConfig.color}`}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    {levelConfig.name}
                  </span>
                )}
                <p className="text-sky-100 text-sm">储值余额</p>
                <p className="text-4xl font-bold mt-1">{formatCurrency(member.balance)}</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Wallet className="w-8 h-8" />
              </div>
            </div>
            <div className="flex gap-6 mt-6">
              <div>
                <p className="text-sky-100 text-xs">当前积分</p>
                <p className="text-xl font-bold mt-1 flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  {member.points} 分
                </p>
              </div>
              <div>
                <p className="text-sky-100 text-xs">累计消费</p>
                <p className="text-xl font-bold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {formatCurrency(member.totalConsume)}
                </p>
              </div>
              <div>
                <p className="text-sky-100 text-xs">会员折扣</p>
                <p className="text-xl font-bold mt-1 flex items-center gap-1">
                  <Percent className="w-4 h-4" />
                  {formatDiscount(member.discount)}
                </p>
              </div>
            </div>
            {nextLevelConfig && (
              <div className="mt-5 p-4 bg-white/10 rounded-xl backdrop-blur">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-sky-100">升级进度</p>
                  <p className="text-sm font-semibold">
                    {upgradeProgress}% → {nextLevelConfig.name}
                  </p>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${upgradeProgress}%` }}
                  />
                </div>
                <p className="text-xs text-sky-100 mt-2">
                  再消费 {formatCurrency(Math.max(0, nextLevelConfig.minConsume - member.totalConsume))}
                  或再积累 {Math.max(0, nextLevelConfig.minPoints - member.points)} 积分即可升级
                </p>
              </div>
            )}
            {!nextLevelConfig && (
              <div className="mt-5 p-4 bg-amber-400/20 rounded-xl backdrop-blur text-center">
                <Crown className="w-6 h-6 mx-auto mb-1 text-amber-200" />
                <p className="text-sm font-semibold">已达到最高等级</p>
              </div>
            )}
            <button
              onClick={() => setShowRecharge(true)}
              className="mt-5 w-full py-3 bg-white text-sky-600 font-semibold rounded-xl hover:bg-sky-50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              立即充值
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">基本信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">会员姓名</p>
                  <p className="font-semibold text-slate-800">{member.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">手机号码</p>
                  <p className="font-semibold text-slate-800">{member.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">入会时间</p>
                  <p className="font-semibold text-slate-800">{formatDate(member.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">会员等级</p>
                  <p className="font-semibold text-slate-800">
                    {levelConfig?.name || '普通会员'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">累计消费</p>
                  <p className="font-semibold text-slate-800">{formatCurrency(member.totalConsume)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                  <Percent className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">会员折扣</p>
                  <p className="font-semibold text-slate-800">{formatDiscount(member.discount)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-sky-600" />
                <h3 className="text-lg font-semibold text-slate-800">交易流水</h3>
              </div>
              <div className="flex items-center gap-2">
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
                    onClick={() => setFilterType('recharge')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      filterType === 'recharge'
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    充值
                  </button>
                  <button
                    onClick={() => setFilterType('consume')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      filterType === 'consume'
                        ? 'bg-white text-rose-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    消费
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索订单号/金额"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              {filterType === 'consume' && (
                <div className="relative">
                  <select
                    value={filterPayment}
                    onChange={(e) => setFilterPayment(e.target.value as PaymentMethod | 'all')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none"
                  >
                    <option value="all">全部支付方式</option>
                    <option value="cash">现金</option>
                    <option value="wechat">微信</option>
                    <option value="alipay">支付宝</option>
                    <option value="card">会员卡</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              )}
              <div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="开始日期"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="结束日期"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filterType !== 'consume' &&
                filteredRechargeRecords.map((record) => (
                  <div
                    key={`recharge-${record.id}`}
                    className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-200 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">会员充值</p>
                        <p className="text-xs text-slate-500">{formatDate(record.rechargeAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">
                        +{formatCurrency(record.amount)}
                      </p>
                      <p className="text-xs text-slate-500">
                        余额: {formatCurrency(record.balanceBefore)} → {formatCurrency(record.balanceAfter)}
                      </p>
                    </div>
                  </div>
                ))}

              {filterType !== 'recharge' &&
                filteredConsumeRecords.map((record) => (
                  <div
                    key={`consume-${record.id}`}
                    className="flex items-center justify-between p-4 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/orders/${record.orderId}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-200 flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{record.orderNo}</p>
                        <p className="text-xs text-slate-500">
                          {formatDate(record.consumeAt)} · {PAYMENT_METHOD_NAMES[record.paymentMethod]}
                          {record.isBalancePayment && ' · 余额支付'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-rose-600">
                        -{formatCurrency(record.amount)}
                      </p>
                      <p className="text-xs text-slate-500">
                        +{record.pointsEarned} 积分
                        {record.balanceBefore !== undefined &&
                          record.balanceAfter !== undefined &&
                          ` · 余额: ${formatCurrency(record.balanceBefore)} → ${formatCurrency(record.balanceAfter)}`}
                      </p>
                    </div>
                  </div>
                ))}

              {filterType !== 'consume' &&
                filteredRechargeRecords.length === 0 &&
                filterType !== 'recharge' &&
                filteredConsumeRecords.length === 0 && (
                  <div className="text-center py-12">
                    <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">暂无交易记录</p>
                  </div>
                )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-semibold text-slate-800">等级规则</h3>
            </div>
            <div className="space-y-3">
              {MEMBER_LEVEL_CONFIG.map((config, index) => {
                const isCurrent = member?.level === config.level;
                return (
                  <div
                    key={config.level}
                    className={`p-3 rounded-xl border ${
                      isCurrent
                        ? 'border-sky-300 bg-sky-50'
                        : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${config.bgColor} ${config.color}`}
                        >
                          {index + 1}
                        </span>
                        <span
                          className={`font-semibold ${
                            isCurrent ? 'text-sky-700' : 'text-slate-700'
                          }`}
                        >
                          {config.name}
                        </span>
                      </div>
                      <span className="text-sm text-slate-600">
                        {formatDiscount(config.discount)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 ml-8">
                      累计消费 {formatCurrency(config.minConsume)} 或 {config.minPoints} 积分
                    </p>
                    {isCurrent && (
                      <span className="inline-block mt-2 ml-8 text-xs text-sky-600 font-medium">
                        ✓ 当前等级
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-amber-800">积分说明</h3>
            </div>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 每消费 1 元 = 1 积分</li>
              <li>• 积分可参与后续兑换活动</li>
              <li>• 积分永久有效</li>
            </ul>
          </div>
        </div>
      </div>

      {showRecharge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">会员充值</h3>
              <p className="text-sm text-slate-500 mt-1">
                当前余额：{formatCurrency(member.balance)}
              </p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  充值金额
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setRechargeAmount(String(amt))}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        rechargeAmount === String(amt)
                          ? 'bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      ¥{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="自定义金额"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-semibold text-center focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="p-4 bg-sky-50 rounded-xl">
                <p className="text-sm text-sky-700">
                  充值后余额：
                  <span className="font-bold text-lg">
                    {formatCurrency(parseFloat(rechargeAmount) + member.balance)}
                  </span>
                </p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowRecharge(false);
                  setRechargeAmount('100');
                }}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRecharge}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all"
              >
                确认充值
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
