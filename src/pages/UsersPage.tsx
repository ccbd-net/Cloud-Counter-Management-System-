import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import type { User, Counter } from '../types/index.ts';
import { toBengaliDigits, formatBengaliDateTime } from '../utils/formatters.ts';
import {
  Users,
  Plus,
  Search,
  KeyRound,
  Shield,
  Phone,
  Building2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Edit,
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { isMasterAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loginId, setLoginId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<User['role']>('booking_point');
  const [counterId, setCounterId] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const fetchUsersAndCounters = async () => {
    setLoading(true);
    try {
      const [uRes, cRes] = await Promise.all([api.getUsers(), api.getCounters()]);
      setUsers(uRes.users);
      setCounters(cRes.counters);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndCounters();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setLoginId('');
    setName('');
    setRole('booking_point');
    setCounterId(counters[0]?.id || '');
    setPhone('');
    setPin('');
    setStatus('active');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setLoginId(u.loginId);
    setName(u.name);
    setRole(u.role);
    setCounterId(u.counterId || '');
    setPhone(u.phone || '');
    setPin('');
    setStatus(u.status);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          name,
          role,
          counterId: role === 'booking_point' ? counterId : null,
          phone,
          status,
          pin: pin.trim() ? pin.trim() : undefined,
        });
        setSuccessMsg(`ব্যবহারকারী "${name}" এর তথ্য সফলভাবে আপডেট হয়েছে!`);
      } else {
        if (!pin.trim() || pin.trim().length < 4 || pin.trim().length > 6) {
          setErrorMsg('নতুন ব্যবহারকারীর জন্য ৪-৬ ডিজিট পিন কোড আবশ্যক!');
          return;
        }
        await api.createUser({
          loginId,
          name,
          role,
          counterId: role === 'booking_point' ? counterId : undefined,
          phone,
          pin,
        });
        setSuccessMsg(`নতুন ব্যবহারকারী "${name}" সফলভাবে যুক্ত হয়েছে!`);
      }
      setIsModalOpen(false);
      await fetchUsersAndCounters();
    } catch (err: any) {
      setErrorMsg(err.message || 'সংরক্ষণ ব্যর্থ হয়েছে।');
    }
  };

  const filtered = users.filter((u) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.loginId.toLowerCase().includes(term) ||
      (u.counterName && u.counterName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>ইউজার, কাউন্টার অপারেটর ও সুপারভাইজার</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            নিরাপদ ৪-৬ ডিজিট পিন অথেন্টিকেশন এবং ৩ স্তরের ভূমিকা (অ্যাডমিন, মডারেটর, কাউন্টার বুকিং পয়েন্ট)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchUsersAndCounters}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isMasterAdmin && (
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ইউজার তৈরি করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* User Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800">
            নিবন্ধিত ইউজার তালিকা ({toBengaliDigits(filtered.length)} জন)
          </h3>
          <span className="text-xs text-slate-500">সুরক্ষিত PBKDF2 হ্যাশিং সমর্থিত</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b">
                <th className="py-3 px-4 font-bold">নাম ও লগইন আইডি</th>
                <th className="py-3 px-4 font-bold">সিস্টেম রোল (Role)</th>
                <th className="py-3 px-4 font-bold">নিযুক্ত কাউন্টার</th>
                <th className="py-3 px-4 font-bold">যোগাযোগ ফোন</th>
                <th className="py-3 px-4 font-bold text-center">স্ট্যাটাস</th>
                {isMasterAdmin && <th className="py-3 px-4 font-bold text-right">অ্যাকশন</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">লগইন আইডি: {u.loginId}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.role === 'master_admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'moderator'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {u.role === 'master_admin'
                        ? 'মাস্টার অ্যাডমিন'
                        : u.role === 'moderator'
                        ? 'মডারেটর / ম্যানেজার'
                        : 'বুকিং পয়েন্ট অপারেটর'}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {u.counterName ? (
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: u.counterColor || '#2563EB' }}
                        />
                        <span className="font-semibold text-slate-800">{u.counterName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">সকল কাউন্টার এক্সেস (হেড অফিস)</span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-700">
                    {u.phone || 'ফোন নেই'}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {u.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </td>

                  {isMasterAdmin && (
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(u)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-semibold"
                        title="সম্পাদনা ও পিন পরিবর্তন"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? 'ইউজার ও পিন সম্পাদনা' : 'নতুন ইউজার তৈরি করুন'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    লগইন আইডি (Login ID) *
                  </label>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="যেমন: mdp02, op_kamal"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono outline-none focus:bg-white"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ব্যবহারকারীর পূর্ণ নাম *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: কামাল হোসেন"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সিস্টেম ভূমিকা (User Role) *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-semibold"
                >
                  <option value="booking_point">booking_point (কাউন্টার সিট বুকিং ও টিকিট প্রিন্ট)</option>
                  <option value="moderator">moderator (শিডিউল, গাড়ি ও ট্রিপ সমন্বয়)</option>
                  <option value="master_admin">master_admin (সকল অপশন ও সিস্টেম কন্ট্রোল)</option>
                </select>
              </div>

              {role === 'booking_point' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    নিযুক্ত কাউন্টার (Assigned Counter) *
                  </label>
                  <select
                    value={counterId}
                    onChange={(e) => setCounterId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-semibold"
                    required
                  >
                    {counters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ফোন নম্বর</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="০১৭xxxxxxxx"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {editingUser ? 'নতুন পিন কোড (পরিবর্তন না করতে চাইলে খালি রাখুন)' : '৪-৬ ডিজিট পিন কোড *'}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono tracking-widest outline-none focus:bg-white"
                  required={!editingUser}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs text-slate-600 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
