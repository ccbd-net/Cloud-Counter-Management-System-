import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import type { Schedule } from '../types/index.ts';
import { formatTaka, toBengaliDigits, getTodayDhakaDate, formatBengaliDate } from '../utils/formatters.ts';
import {
  CalendarDays,
  Calendar,
  Bus,
  Clock,
  User,
  Phone,
  Armchair,
  Edit3,
  Moon,
  CheckCircle,
  RefreshCw,
  Search,
  ArrowRight,
  Trash2,
} from 'lucide-react';

export const DailySchedulesPage: React.FC<{ onSelectTripForBooking?: (tripId: string) => void }> = ({
  onSelectTripForBooking,
}) => {
  const { isMasterAdmin, isModerator, canManageTrips } = useAuth();
  const [date, setDate] = useState<string>(getTodayDhakaDate());
  const [directionTab, setDirectionTab] = useState<'UP' | 'DOWN'>('UP');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Edit Schedule Modal State
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editTime, setEditTime] = useState<string>('');
  const [editSupervisor, setEditSupervisor] = useState<string>('');
  const [editSupervisorPhone, setEditSupervisorPhone] = useState<string>('');
  const [editFare, setEditFare] = useState<number>(550);
  const [editReason, setEditReason] = useState<string>('');

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.getSchedules({ date, direction: directionTab });
      setSchedules(res.schedules);
    } catch (err) {
      console.error('Failed to load daily schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [date, directionTab]);

  const handleOpenEdit = (sch: Schedule) => {
    setEditingSchedule(sch);
    setEditTime(sch.departureTime);
    setEditSupervisor(sch.supervisor);
    setEditSupervisorPhone(sch.supervisorPhone);
    setEditFare(sch.fare);
    setEditReason('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;

    try {
      await api.updateSchedule(editingSchedule.id, {
        departureTime: editTime,
        supervisor: editSupervisor,
        supervisorPhone: editSupervisorPhone,
        fare: editFare,
        updateReason: editReason || 'সময়ানুবর্তিতা বা অপারেশনাল কারণে পরিবর্তন',
      });
      setEditingSchedule(null);
      await fetchSchedules();
    } catch (err: any) {
      alert(err.message || 'আপডেট ব্যর্থ হয়েছে');
    }
  };

  const handleDeleteTrip = async (sch: Schedule) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${sch.tripNo}" (${sch.vehicleRegNo}) ট্রিপটি মুছে ফেলতে চান?`)) {
      return;
    }
    try {
      await api.deleteSchedule(sch.id);
      await fetchSchedules();
    } catch (err: any) {
      alert(err.message || 'ট্রিপ মোছা যায়নি।');
    }
  };

  const filtered = schedules.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.tripNo.toLowerCase().includes(term) ||
      s.vehicleRegNo.toLowerCase().includes(term) ||
      s.supervisor.toLowerCase().includes(term) ||
      s.routeName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
            <span>দৈনিক ট্রিপ শিডিউল (Up & Down Trips)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            তারিখ অনুযায়ী আপ ও ডাউন ট্রিপ শিডিউল পর্যবেক্ষণ ও আসন বুকিং ব্যবস্থাপনা
          </p>
        </div>

        {/* Date Selector & Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={fetchSchedules}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Up / Down Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
          <button
            type="button"
            onClick={() => setDirectionTab('UP')}
            className={`px-4 py-2 rounded-lg transition-all ${
              directionTab === 'UP'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            আপ ট্রিপ (মাদারীপুর ➜ ঢাকা)
          </button>
          <button
            type="button"
            onClick={() => setDirectionTab('DOWN')}
            className={`px-4 py-2 rounded-lg transition-all ${
              directionTab === 'DOWN'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ডাউন ট্রিপ (ঢাকা ➜ মাদারীপুর)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="গাড়ি, ট্রিপ নং বা সুপারভাইজার..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Schedules Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            এই ক্যাটাগরিতে কোনো সক্রিয় ট্রিপ পাওয়া যায়নি।
          </div>
        ) : (
          filtered.map((sch) => {
            const booked = sch.totalBookedSeats || 0;
            const available = sch.seatCapacity - booked;
            const percent = Math.round((booked / sch.seatCapacity) * 100);

            return (
              <div
                key={sch.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Top Trip Header */}
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                      {sch.direction}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{sch.tripNo}</h4>
                      <span className="text-[10px] text-slate-400">তারিখ: {sch.date}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                      <Clock className="w-3 h-3" />
                      <span>{sch.departureTime}</span>
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="py-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">গাড়ি নম্বর:</span>
                    <span className="font-bold text-slate-800">{sch.vehicleRegNo}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">রুট:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                      {sch.routeName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">সুপারভাইজার:</span>
                    <span className="font-medium text-slate-800">
                      {sch.supervisor} ({sch.supervisorPhone || 'ফোন নেই'})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">টিকিট ভাড়া:</span>
                    <span className="font-bold text-emerald-700 text-sm">{formatTaka(sch.fare)}</span>
                  </div>

                  {sch.isNightHold && (
                    <div className="flex items-center gap-1.5 p-2 bg-purple-50 text-purple-700 rounded-xl text-[11px] font-semibold border border-purple-200">
                      <Moon className="w-3.5 h-3.5" />
                      <span>রাত্রীকালীন হোল্ড ট্রিপ (পরবর্তী দিন ডাউন সমন্বয়)</span>
                    </div>
                  )}
                </div>

                {/* Capacity Progress Bar */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>
                      বুকড: <strong>{toBengaliDigits(booked)}</strong>/{toBengaliDigits(sch.seatCapacity)} সিট
                    </span>
                    <span>{toBengaliDigits(percent)}% পূর্ণ</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percent > 80 ? 'bg-red-500' : percent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {canManageTrips && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(sch)}
                        className="px-2.5 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="ট্রিপ তথ্য পরিবর্তন করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>এডিট</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTrip(sch)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="ট্রিপ মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectTripForBooking) {
                        onSelectTripForBooking(sch.id);
                      }
                    }}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Armchair className="w-3.5 h-3.5" />
                    <span>সিট বুকিং করুন</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Schedule Modal */}
      {editingSchedule && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              ট্রিপ তথ্য পরিবর্তন ({editingSchedule.tripNo})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              পরিবর্তনটি পরিবর্তনের ইতিহাসে (Audit Log) লিপিবদ্ধ হবে এবং বুকিং স্ক্রিনে লাল সতর্কতা প্রদর্শন করবে।
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ছাড়ার সময়</label>
                <input
                  type="text"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  placeholder="যেমন: 07:30 AM"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সুপারভাইজার</label>
                <input
                  type="text"
                  value={editSupervisor}
                  onChange={(e) => setEditSupervisor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সুপারভাইজার ফোন</label>
                <input
                  type="text"
                  value={editSupervisorPhone}
                  onChange={(e) => setEditSupervisorPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ভাড়া (৳)</label>
                <input
                  type="number"
                  value={editFare}
                  onChange={(e) => setEditFare(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পরিবর্তনের কারণ (কাউন্টারদের সতর্কতা দেখাতে)
                </label>
                <textarea
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="যেমন: ট্রাফিক জ্যাম বা যান্ত্রিক কারণে সময় পেছানো হয়েছে।"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingSchedule(null)}
                  className="px-4 py-2 border rounded-xl text-xs text-slate-600 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md"
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
