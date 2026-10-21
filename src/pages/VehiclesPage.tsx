import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import type { Vehicle, SeatCapacity } from '../types/index.ts';
import { toBengaliDigits } from '../utils/formatters.ts';
import { SeatMap } from '../components/SeatMap.tsx';
import {
  Bus,
  Plus,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  X,
  Armchair,
  Check,
} from 'lucide-react';

export const VehiclesPage: React.FC = () => {
  const { isMasterAdmin, isModerator } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [regNo, setRegNo] = useState<string>('ঢাকা মেট্রো-ব-১২-');
  const [seatCapacity, setSeatCapacity] = useState<SeatCapacity>(42);
  const [model, setModel] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'maintenance' | 'inactive'>('active');
  const [notes, setNotes] = useState<string>('');

  // Seat Layout Preview Modal
  const [previewVehicle, setPreviewVehicle] = useState<Vehicle | null>(null);

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.getVehicles();
      setVehicles(res.vehicles);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setRegNo('ঢাকা মেট্রো-ব-১২-');
    setSeatCapacity(42);
    setModel('Hino 1J Plus AC');
    setStatus('active');
    setNotes('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (v: Vehicle) => {
    setEditingVehicle(v);
    setRegNo(v.regNo);
    setSeatCapacity(v.seatCapacity);
    setModel(v.model);
    setStatus(v.status);
    setNotes(v.notes || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (editingVehicle) {
        await api.updateVehicle(editingVehicle.id, {
          regNo,
          seatCapacity,
          model,
          status,
          notes,
        });
        setSuccessMsg(`গাড়ি "${regNo}" সফলভাবে আপডেট হয়েছে!`);
      } else {
        await api.createVehicle({
          regNo,
          seatCapacity,
          model,
          notes,
        });
        setSuccessMsg(`নতুন গাড়ি "${regNo}" (${seatCapacity} সিট) সফলভাবে যুক্ত হয়েছে!`);
      }
      setIsModalOpen(false);
      await fetchVehicles();
    } catch (err: any) {
      setErrorMsg(err.message || 'গাড়ি সংরক্ষণ ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Bus className="w-5 h-5 text-emerald-600" />
            <span>গাড়ি ব্যবস্থাপনা ও আসন লেআউট কনফিগারেশন</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ৪২ সিট (A–I সারি + J পেছনের ৫ আসন + EX-1) এবং ৪৬ সিট (A–J সারি + K পেছনের ৫ আসন + EX-1)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchVehicles}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {(isMasterAdmin || isModerator) && (
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন গাড়ি যুক্ত করুন</span>
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

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:shadow-md transition-shadow relative"
          >
            <div className="flex items-center justify-between pb-3 border-b mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Bus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{v.regNo}</h3>
                  <span className="text-[11px] text-slate-500">{v.model}</span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  v.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : v.status === 'maintenance'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {v.status === 'active' ? 'সক্রিয়' : v.status === 'maintenance' ? 'সার্ভিসিং' : 'নিষ্ক্রিয়'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">আসন সংখ্যা (কনফিগারেশন):</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                  {toBengaliDigits(v.seatCapacity)} আসন ({v.seatCapacity === 42 ? 'A-I + J5 + EX-1' : 'A-J + K5 + EX-1'})
                </span>
              </div>

              <div className="pt-2 text-slate-600 text-[11px] line-clamp-2">
                {v.notes || 'কোনো অতিরিক্ত নোট নেই'}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setPreviewVehicle(v)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>সিট ম্যাপ দেখুন</span>
              </button>

              {(isMasterAdmin || isModerator) && (
                <button
                  type="button"
                  onClick={() => openEditModal(v)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>সম্পাদনা</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingVehicle ? 'গাড়ি তথ্য সম্পাদনা' : 'নতুন গাড়ি সংযোজন'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  গাড়ির রেজিস্ট্রেশন নম্বর *
                </label>
                <input
                  type="text"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  placeholder="ঢাকা মেট্রো-ব-১২-"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সিট প্ল্যান কনফিগারেশন (Seat Capacity) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSeatCapacity(42)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      seatCapacity === 42
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">৪২ সিট বাস</div>
                    <div className="text-[10px] text-slate-500">A-I (৩৬) + J (৫) + EX-1 (১)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSeatCapacity(46)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      seatCapacity === 46
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">৪৬ সিট বাস</div>
                    <div className="text-[10px] text-slate-500">A-J (৪০) + K (৫) + EX-1 (১)</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  গাড়ির মডেল বা ব্র্যান্ড
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="যেমন: Hino 1J Plus AC, Hyundai Luxury"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white"
                />
              </div>

              {editingVehicle && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">স্ট্যাটাস</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs"
                  >
                    <option value="active">সক্রিয় (Active)</option>
                    <option value="maintenance">সার্ভিসিং / মেরামতে (Maintenance)</option>
                    <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">নোট / মন্তব্য</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="গাড়ির বর্তমান অবস্থা ইত্যাদি..."
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white"
                  rows={2}
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

      {/* Vehicle Seat Layout Preview Modal */}
      {previewVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {previewVehicle.regNo} — সিট লেআউট প্রিভিউ
                </h3>
                <p className="text-xs text-slate-500">
                  {toBengaliDigits(previewVehicle.seatCapacity)} আসন বিশিষ্ট বাস লেআউট
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVehicle(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center py-2">
              <SeatMap
                seatCapacity={previewVehicle.seatCapacity}
                bookedSeats={[]}
                selectedSeats={[]}
                onSeatToggle={() => {}}
                counters={[]}
                readOnly={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
