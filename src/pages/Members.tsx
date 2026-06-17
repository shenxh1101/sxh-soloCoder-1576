import { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  Percent,
  Phone,
  User,
  X,
  Check,
  Eye,
  Wallet,
  Trophy,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '@/store';
import type { Member } from '@/types';
import { formatDateShort, formatDiscount, formatCurrency } from '@/utils';

export default function Members() {
  const navigate = useNavigate();
  const { members, searchMembers, addMember, updateMember, deleteMember, generateMemberId } = useOrderStore();
  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', discount: 0.9 });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredMembers = searchMembers(keyword);

  const resetForm = () => {
    setFormData({ name: '', phone: '', discount: 0.9 });
    setEditingMember(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setFormData({ name: member.name, phone: member.phone, discount: member.discount });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('请填写姓名和手机号');
      return;
    }
    if (formData.discount <= 0 || formData.discount > 1) {
      alert('折扣需在0-1之间（如0.9表示9折）');
      return;
    }

    if (editingMember) {
      updateMember(editingMember.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        discount: formData.discount,
      });
    } else {
      addMember({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        discount: formData.discount,
      });
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteMember(id);
    setConfirmDelete(null);
  };

  const discountOptions = [
    { value: 1, label: '不打折' },
    { value: 0.95, label: '95折' },
    { value: 0.9, label: '9折' },
    { value: 0.85, label: '85折' },
    { value: 0.8, label: '8折' },
    { value: 0.75, label: '75折' },
    { value: 0.7, label: '7折' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">会员管理</h2>
            <p className="text-sm text-slate-500 mt-1">共 {members.length} 位会员</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          新增会员
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索会员姓名、手机号、会员号..."
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">会员号</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">姓名</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">手机号</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">折扣</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">余额</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">积分</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">入会时间</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {keyword ? '未找到匹配的会员' : '暂无会员'}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/members/${member.id}`)}
                  >
                    <td className="py-4 px-4">
                      <span className="font-mono font-semibold text-sky-600">{member.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-cyan-300 flex items-center justify-center text-white font-semibold text-sm">
                          {member.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{member.phone}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          member.discount < 0.85
                            ? 'bg-emerald-50 text-emerald-700'
                            : member.discount < 1
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Percent className="w-3 h-3 mr-1" />
                        {formatDiscount(member.discount)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-semibold text-emerald-600 flex items-center justify-end gap-1">
                        <Wallet className="w-4 h-4" />
                        {formatCurrency(member.balance)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-semibold text-amber-600 flex items-center justify-end gap-1">
                        <Trophy className="w-4 h-4" />
                        {member.points}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-500">
                      {formatDateShort(member.createdAt)}
                    </td>
                    <td className="py-4 px-4">
                      {confirmDelete === member.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(member.id);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500 text-white text-xs font-medium rounded-lg hover:bg-rose-600 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            确认
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete(null);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-300 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            取消
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/members/${member.id}`);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            详情
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(member);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Edit2 className="w-4 h-4" />
                            编辑
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete(member.id);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            删除
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">
                  {editingMember ? '编辑会员' : '新增会员'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {!editingMember && (
                <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl">
                  <p className="text-sm text-sky-700">
                    系统将自动生成会员号：<span className="font-semibold">{generateMemberId()}</span>
                  </p>
                </div>
              )}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <User className="w-4 h-4 text-slate-400" />
                  会员姓名
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入姓名"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  手机号码
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="请输入11位手机号"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Percent className="w-4 h-4 text-slate-400" />
                  会员折扣
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {discountOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFormData({ ...formData, discount: opt.value })}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.discount === opt.value
                          ? 'bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-md shadow-sky-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  当前折扣：{formatDiscount(formData.discount)}
                </p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all duration-200"
              >
                <UserPlus className="w-4 h-4" />
                {editingMember ? '保存修改' : '添加会员'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
