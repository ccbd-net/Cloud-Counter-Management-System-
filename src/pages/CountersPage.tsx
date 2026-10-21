import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import type { Counter } from '../types/index.ts';
import { toBengaliDigits, formatBengaliDateTime } from '../utils/formatters.ts';
import {
  Building2,
  Plus,
  Search,
  Edit,
  Phone,
  MapPin,
  Users,
  Palette,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  X,
} from 'lucide-react';

export const CountersPage: React.FC = () => {
  const { isMasterAdmin } = useAuth();
  const [counters, setCounters] = useState<(Counter & { assignedUsers?: any[] })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCounter, setEditingCounter] = useState<Counter | null>(null);
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [seatColor, setSeatColor] = useState<string>('#2563EB');
  const [counterType, setCounterType] = useState<'master_booking' | 'road_booking'>('road_booking');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Popular distinct bus seat colors
  const presetColors = [
    '#2563EB', // Blue
    '#059669', // Emerald
    '#D97706', // Amber
    '#7C3AED', // Purple
    '#DB2777', // Pink
    '#DC2626', // Red
    '#0891B2', // Cyan
    '#4F46E5', // Indigo
    '#EA580C', // Orange
    '#0D9488', // Teal
  ];

  const fetchCounters = async () => {
    setLoading(true);
    try {
      const res = await api.getCounters();
      setCounters(res.counters);
    } catch (err) {
      console.error('Failed to load counters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounters();
  }, []);

  const openAddModal = () => {
    setEditingCounter(null);
    setName('');
    setCode('');
    setAddress('');
    setPhone('');
    setCounterType('road_booking');
    // Pick an unused preset color if available
    const usedColors = new Set(counters.filter((c) => c.status === 'active').map((c) => c.seatColor.toUpperCase()));
    const available = presetColors.find((c) => !usedColors.has(c.toUpperCase())) || '#2563EB';
    setSeatColor(available);
    setStatus('active');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Counter) => {
    setEditingCounter(c);
    setName(c.name);
    setCode(c.code);
    setAddress(c.address);
    setPhone(c.phone);
    setSeatColor(c.seatColor);
    setCounterType(c.counterType || 'road_booking');
    setStatus(c.status);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (editingCounter) {
        await api.updateCounter(editingCounter.id, {
          name,
          code,
          address,
          phone,
          seatColor,
          counterType,
          status,
        });
        setSuccessMsg(`কাউন্টার "${name}" এর তথ্য সফলভাবে আপডেট হয়েছে!`);
      } else {
        await api.createCounter({
          name,
          code,
          address,
          phone,
          seatColor,
          counterType,
        });
        setSuccessMsg(`নতুন কাউন্টার "${name}" সফলভাবে যুক্ত হয়েছে!`);
      }
      setIsModalOpen(false);
      await fetchCounters();
    } catch (err: any) {
      setErrorMsg(err.message || 'কাউন্টার সংরক্ষণ ব্যর্থ হয়েছে।');
    }
  };

  const filteredCounters = counters.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term) ||
      c.address.toLowerCase().includes(term) ||
      c.phone.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>কাউন্টার ব্যবস্থাপনা ও অনন্য সিট রঙ নির্ধারণ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            প্রতিটি কাউন্টারের জন্য স্বতন্ত্র কোড, ঠিকানা, ফোন ও ইউনিক সিট কালার প্যালেট পরিচালনা করুন
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchCounters}
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
              <span>নতুন কাউন্টার যোগ করুন</span>
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

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="কাউন্টারের নাম, কোড বা অবস্থান দিয়ে অনুসন্ধান করুন..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
          />
        </div>
      </div>

      {/* Counter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCounters.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            কোনো কাউন্টার পাওয়া যায়নি।
          </div>
        ) : (
          filteredCounters.map((cnt) => (
            <div
              key={cnt.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Top Bar with Counter Seat Color Swatch */}
              <div className="flex items-center justify-between pb-3 border-b mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-xl shadow-xs ring-2 ring-black/10 shrink-0 flex items-center justify-center text-white"
                    style={{ backgroundColor: cnt.seatColor }}
                  >
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">{cnt.name}</h3>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">
                      কোড: {cnt.code}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cnt.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cnt.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cnt.counterType === 'master_booking'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}
                  >
                    {cnt.counterType === 'master_booking' ? 'মাষ্টার কাউন্টার' : 'রোড কাউন্টার'}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                  <span className="line-clamp-2">{cnt.address || 'ঠিকানা দেওয়া হয়নি'}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="font-mono">{cnt.phone || 'ফোন নেই'}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500 font-medium">নির্ধারিত সিট রঙ:</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-md shadow-2xs ring-1 ring-black/20"
                      style={{ backgroundColor: cnt.seatColor }}
                    />
                    <span className="font-mono font-bold text-slate-700">{cnt.seatColor}</span>
                  </div>
                </div>

                {/* Assigned operators count */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>নিযুক্ত অপারেটর:</span>
                  <span className="font-bold text-slate-700">
                    {toBengaliDigits(cnt.assignedUsers?.length || 0)} জন
                  </span>
                </div>
              </div>

              {/* Actions */}
              {isMasterAdmin && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => openEditModal(cnt)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>সম্পাদনা</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Counter Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingCounter ? 'কাউন্টার সম্পাদনা' : 'নতুন কাউন্টার তৈরি'}
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
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  কাউন্টারের ধরণ (Counter Category) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCounterType('master_booking')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      counterType === 'master_booking'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                      <span>মাষ্টার বুকিং কাউন্টার</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                      ট্রিপ শিডিউল তৈরি, এডিট ও ডিলিট করতে পারবে + সিট বুকিং।
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCounterType('road_booking')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      counterType === 'road_booking'
                        ? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                      <span>রোড বুকিং কাউন্টার</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                      সাধারণ কাউন্টার; শুধুমাত্র যাত্রী ও সিট বুকিং এবং টিকিট প্রিন্ট।
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  কাউন্টারের নাম *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: মাদারীপুর নতুন বাস টার্মিনাল কাউন্টার"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ইউনিক কাউন্টার কোড *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="যেমন: MDP-01, SYD-01"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono font-bold uppercase outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  কাউন্টার ঠিকানা
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ঠিকানা ও ল্যান্ডমার্ক"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  যোগাযোগ ফোন নম্বর
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="০১৭xxxxxxxx"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white"
                />
              </div>

              {/* Unique Seat Color Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>অনন্য সিট কালার (Seat Color Picker) *</span>
                  <span className="text-[10px] text-slate-400">প্রতিটি সক্রিয় কাউন্টারের রঙ ভিন্ন হতে হবে</span>
                </label>

                {/* Preset circles */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {presetColors.map((color) => {
                    const isSelected = seatColor.toUpperCase() === color.toUpperCase();
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSeatColor(color)}
                        className={`w-6 h-6 rounded-full shadow-xs transition-transform ${
                          isSelected ? 'scale-125 ring-2 ring-black' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={seatColor}
                    onChange={(e) => setSeatColor(e.target.value.toUpperCase())}
                    className="w-10 h-9 p-0.5 border rounded-lg cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={seatColor}
                    onChange={(e) => setSeatColor(e.target.value.toUpperCase())}
                    className="px-3 py-1.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold uppercase outline-none"
                    required
                  />
                </div>
              </div>

              {editingCounter && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">স্ট্যাটাস</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs"
                  >
                    <option value="active">সক্রিয় (Active)</option>
                    <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
                  </select>
                </div>
              )}

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
