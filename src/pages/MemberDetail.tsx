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
} from 'lucide-react';
import { useOrderStore } from '@/store';
import { formatDate, formatCurrency, formatDiscount } from '@/utils';

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

  const member = getMemberById(id || '');
  const rechargeRecords = useMemo(
    () => getMemberRechargeRecords(id || ''),
    [id, getMemberRechargeRecords]
  );
  const consumeRecords = useMemo(
    () => getMemberConsumeRecords(id || ''),
    [id, getMemberConsumeRecords]
  );

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
            <div className="flex items-center justify-between">
              <div>
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
                <p className="text-sky-100 text-xs">会员折扣</p>
                <p className="text-xl font-bold mt-1 flex items-center gap-1">
                  <Percent className="w-4 h-4" />
                  {formatDiscount(member.discount)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRecharge(true)}
              className="mt-6 w-full py-3 bg-white text-sky-600 font-semibold rounded-xl hover:bg-sky-50 transition-colors flex items-center justify-center gap-2"
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
                  <Percent className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">会员折扣</p>
                  <p className="font-semibold text-slate-800">{formatDiscount(member.discount)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-semibold text-slate-800">消费记录</h3>
            </div>
            {consumeRecords.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">暂无消费记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consumeRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/orders/${record.orderId}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{record.orderNo}</p>
                        <p className="text-xs text-slate-500">{formatDate(record.consumeAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">
                        -{formatCurrency(record.amount)}
                      </p>
                      <p className="text-xs text-slate-500">+{record.pointsEarned} 积分</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-semibold text-slate-800">充值记录</h3>
            </div>
            {rechargeRecords.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">暂无充值记录</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rechargeRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <span className="text-sm text-slate-600">
                      {formatDate(record.rechargeAt)}
                    </span>
                    <span className="font-semibold text-emerald-600">
                      +{formatCurrency(record.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
