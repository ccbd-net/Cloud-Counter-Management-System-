import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import type { Vehicle, RouteItem, Schedule } from '../types/index.ts';
import { getTodayDhakaDate, formatTaka, toBengaliDigits } from '../utils/formatters.ts';
import {
  CalendarPlus,
  Bus,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Moon,
  ArrowRight,
  User,
  Phone,
} from 'lucide-react';

export const ScheduleMakerPage: React.FC<{ onScheduleCreated?: () => void }> = ({
  onScheduleCreated,
}) => {
  const { user } = useAuth();

  const [date, setDate] = useState<string>(getTodayDhakaDate());
  const [direction, setDirection] = useState<'UP' | 'DOWN'>('UP');
  const [departureTime, setDepartureTime] = useState<string>('07:00 AM');
  const [vehicleId, setVehicleId] = useState<string>('');
  const [routeId, setRouteId] = useState<string>('');
  const [supervisor, setSupervisor] = useState<string>('রফিকুল ইসলাম');
  const [supervisorPhone, setSupervisorPhone] = useState<string>('01711-000111');
  const [fare, setFare] = useState<number>(550);
  const [isNightHold, setIsNightHold] = useState<boolean>(false);

  // Lists
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);

  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Warning Modal for multiple trips on same date
  const [multiTripWarning, setMultiTripWarning] = useState<string | null>(null);

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [vRes, rRes] = await Promise.all([api.getVehicles(), api.getRoutes()]);
        setVehicles(vRes.vehicles.filter((v) => v.status === 'active'));
        if (vRes.vehicles.length > 0) setVehicleId(vRes.vehicles[0].id);

        setRoutes(rRes.routes.filter((r) => r.status === 'active'));
        if (rRes.routes.length > 0) {
          setRouteId(rRes.routes[0].id);
          setFare(rRes.routes[0].baseFare || 550);
        }
      } catch (err) {
        console.error('Failed to load vehicles or routes:', err);
      }
    };
    loadPrerequisites();
  }, []);

  // Update fare when route changes
  const handleRouteChange = (rId: string) => {
    setRouteId(rId);
    const selected = routes.find((r) => r.id === rId);
    if (selected && selected.baseFare) {
      setFare(selected.baseFare);
    }
  };

  const handleCreate = async (confirmMultiTrip = false) => {
    if (!date || !departureTime || !vehicleId || !routeId || !supervisor || !fare) {
      setErrorMsg('অনুগ্রহ করে সকল প্রয়োজনীয় ফিল্ড পূরণ করুন।');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setMultiTripWarning(null);

    try {
      const res = await api.createSchedule({
        date,
        departureTime,
        vehicleId,
        routeId,
        supervisor,
        supervisorPhone,
        direction,
        fare,
        isNightHold,
        confirmMultiTrip,
      });

      setSuccessMsg(
        `অভিনন্দন! ট্রিপ (${res.schedule.tripNo}) সফলভাবে শিডিউল করা হয়েছে। গাড়ি: ${res.schedule.vehicleRegNo}, সময়: ${res.schedule.departureTime}`
      );
      if (onScheduleCreated) onScheduleCreated();
    } catch (err: any) {
      if (err.data && err.data.code === 'MULTI_TRIP_WARNING') {
        // Trigger multi-trip confirmation dialog
        setMultiTripWarning(err.data.message);
      } else {
        setErrorMsg(err.message || 'শিডিউল তৈরিতে সমস্যা হয়েছে।');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <CalendarPlus className="w-5 h-5 text-emerald-600" />
          <span>শিডিউল মেকার — নতুন ট্রিপ সংযোজন</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          গাড়ি, রুট, সুপারভাইজার এবং সময় নির্ধারণ করে নির্ভুল ট্রিপ শিডিউল তৈরি করুন। ডুপ্লিকেট ট্রিপ রোধে স্বয়ংক্রিয় সতর্কীকরণ ব্যবস্থা কার্যকর রয়েছে।
        </p>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-semibold border border-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        {/* Direction Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            ট্রিপ ডিরেকশন (দিক) নির্বাচন করুন
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDirection('UP')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                direction === 'UP'
                  ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-sm">আপ ট্রিপ (UP TRIP)</div>
              <div className="text-xs text-slate-500 mt-0.5">মাদারীপুর ➜ ঢাকা (সায়েদাবাদ/গাবতলী)</div>
            </button>

            <button
              type="button"
              onClick={() => setDirection('DOWN')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                direction === 'DOWN'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-sm">ডাউন ট্রিপ (DOWN TRIP)</div>
              <div className="text-xs text-slate-500 mt-0.5">ঢাকা (সায়েদাবাদ/গাবতলী) ➜ মাদারীপুর</div>
            </button>
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              অপারেশনাল তারিখ (Asia/Dhaka)
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              টার্মিনাল থেকে ছাড়ার সময়
            </label>
            <input
              type="text"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              placeholder="যেমন: 06:30 AM, 08:00 AM, 07:30 PM"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
        </div>

        {/* Vehicle and Route */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              গাড়ি নির্বাচন (Vehicle)
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.regNo} ({toBengaliDigits(v.seatCapacity)} আসন, {v.model})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              রুট নির্বাচন (Route)
            </label>
            <select
              value={routeId}
              onChange={(e) => handleRouteChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (মূল ভাড়া: {formatTaka(r.baseFare)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Supervisor and Fare */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              সুপারভাইজার নাম
            </label>
            <input
              type="text"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              placeholder="দায়িত্বপ্রাপ্ত সুপারভাইজার"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              সুপারভাইজার ফোন
            </label>
            <input
              type="tel"
              value={supervisorPhone}
              onChange={(e) => setSupervisorPhone(e.target.value)}
              placeholder="০১xxxxxxxx"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              টিকিট ভাড়া প্রতি আসন (৳)
            </label>
            <input
              type="number"
              value={fare}
              onChange={(e) => setFare(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
        </div>

        {/* Night-Hold Option */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">
                রাত্রীকালীন হোল্ড ট্রিপ (Night-Hold Trip)
              </div>
              <div className="text-[11px] text-slate-500">
                গাড়িটি গন্তব্যে রাত্রিযাপন করবে এবং পরবর্তী দিনের ফিরতি ট্রিপের সাথে সমন্বয়যোগ্য হবে
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isNightHold}
              onChange={(e) => setIsNightHold(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleCreate(false)}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            'শিডিউল সংরক্ষিত হচ্ছে...'
          ) : (
            <>
              <CalendarPlus className="w-4 h-4" />
              <span>ট্রিপ শিডিউল নিশ্চিত ও সংরক্ষণ করুন</span>
            </>
          )}
        </button>
      </div>

      {/* Multi-Trip Confirmation Warning Modal */}
      {multiTripWarning && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 text-center mb-2">
              মাল্টি-ট্রিপ সতর্কতা (Multi-Trip Warning)
            </h3>

            <p className="text-xs text-slate-600 text-center mb-6 leading-relaxed">
              {multiTripWarning}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMultiTripWarning(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                বাতিল করুন
              </button>

              <button
                type="button"
                onClick={() => handleCreate(true)}
                className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md"
              >
                হ্যাঁ, অতিরিক্ত ট্রিপ তৈরি করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
