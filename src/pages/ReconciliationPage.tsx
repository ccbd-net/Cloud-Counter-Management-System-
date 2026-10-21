import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import type { Reconciliation, Schedule } from '../types/index.ts';
import { formatTaka, toBengaliDigits, getTodayDhakaDate, formatBengaliDateTime } from '../utils/formatters.ts';
import {
  Scale,
  Calendar,
  CheckCircle,
  AlertCircle,
  Bus,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const ReconciliationPage: React.FC = () => {
  const { user, isMasterAdmin, isModerator } = useAuth();
  const [date, setDate] = useState<string>(getTodayDhakaDate());
  const [loading, setLoading] = useState<boolean>(true);
  const [pairs, setPairs] = useState<any[]>([]);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [reconcilingVehicleId, setReconcilingVehicleId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchReconciliationData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.getReconciliationCandidates(date);
      setPairs(res.pairs);
      setReconciliations(res.existingReconciliations || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'সমন্বয় তথ্য লোড ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliationData();
  }, [date]);

  const handleReconcile = async (pair: any) => {
    if (!isMasterAdmin && !isModerator) {
      alert('আপনার ট্রিপ সমন্বয় করার অনুমতি নেই!');
      return;
    }

    setReconcilingVehicleId(pair.vehicleId);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.saveReconciliation({
        operationalDate: date,
        vehicleId: pair.vehicleId,
        upTripId: pair.upTrip?.id,
        downTripId: pair.downTrip?.id,
        notes: pair.isNightHoldMatch ? 'নাইট-হোল্ড আপ ট্রিপের সাথে ডাউন ট্রিপ সমন্বয়' : '',
      });

      setSuccessMsg(`গাড়ি "${pair.vehicleRegNo}" এর আপ ও ডাউন ট্রিপের আর্থিক সমন্বয় সফল হয়েছে!`);
      await fetchReconciliationData();
    } catch (err: any) {
      setErrorMsg(err.message || 'সমন্বয় ব্যর্থ হয়েছে।');
    } finally {
      setReconcilingVehicleId(null);
    }
  };

  // Grand totals
  const totalCombinedCollection = pairs.reduce((sum, p) => sum + p.combinedCollection, 0);
  const reconciledCount = pairs.filter((p) => p.reconciliationStatus === 'reconciled').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            <span>ট্রিপ হিসাব সমন্বয় (আপ + ডাউন কালেকশন)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            প্রতিটি গাড়ির আপ ও ডাউন ট্রিপ ক্যাশ সংগ্রহ ম্যাচিং ও ট্রানজ্যাকশনাল রিকনসিলিয়েশন
          </p>
        </div>

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
            onClick={fetchReconciliationData}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-red-50 text-red-700 rounded-2xl text-xs font-semibold border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Summary Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">মোট কম্বাইন্ড আদায় (Up + Down)</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {formatTaka(totalCombinedCollection)}
          </div>
          <span className="text-[11px] text-slate-400">ফর্মুলা: আপ কালেকশন + ডাউন কালেকশন</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">সমন্বিত গাড়ি সংখ্যা</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {toBengaliDigits(reconciledCount)} / {toBengaliDigits(pairs.length)}
          </div>
          <span className="text-[11px] text-slate-400">অনুমোদিত সমন্বয় সম্পন্ন হয়েছে</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">অসমন্বিত বা অপেক্ষমান ট্রিপ</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {toBengaliDigits(pairs.length - reconciledCount)}
          </div>
          <span className="text-[11px] text-slate-400">ডাউন বা আপ ট্রিপ অপেক্ষমান</span>
        </div>
      </div>

      {/* Pairs Reconciliation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800">
            গাড়িভিত্তিক আপ ও ডাউন ট্রিপ পেয়ারিং তালিকা
          </h3>
          <span className="text-xs text-slate-500">
            নাইট-হোল্ড ট্রিপ স্বয়ংক্রিয়ভাবে রিটার্ন ট্রিপের সাথে সংযুক্ত হয়
          </span>
        </div>

        {pairs.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            এই তারিখে কোনো গাড়ির ট্রিপ রেকর্ড নেই।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b">
                  <th className="py-3 px-4 font-bold">গাড়ির নম্বর ও রুট</th>
                  <th className="py-3 px-4 font-bold">আপ ট্রিপ (Up Collection)</th>
                  <th className="py-3 px-4 font-bold">ডাউন ট্রিপ (Down Collection)</th>
                  <th className="py-3 px-4 font-bold">মোট সমন্বয় আদায় (Up + Down)</th>
                  <th className="py-3 px-4 font-bold text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 font-bold text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pairs.map((p) => {
                  const isReconciled = p.reconciliationStatus === 'reconciled';
                  const isReady = p.reconciliationStatus === 'ready';

                  return (
                    <tr key={p.vehicleId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Bus className="w-4 h-4 text-slate-500" />
                          <span>{p.vehicleRegNo}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{p.routeName}</div>
                        <div className="text-[10px] text-slate-400">সুপারভাইজার: {p.supervisor}</div>
                      </td>

                      {/* Up Trip */}
                      <td className="py-3 px-4">
                        {p.upTrip ? (
                          <div>
                            <div className="font-semibold text-slate-800">
                              {p.upTrip.tripNo} ({p.upTrip.departureTime})
                            </div>
                            <div className="font-bold text-blue-700 text-xs">
                              {formatTaka(p.upCollection)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              সিট বুকড: {toBengaliDigits(p.upTrip.totalBookedSeats || 0)}
                            </div>
                            {p.isNightHoldMatch && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[9px] rounded font-bold">
                                নাইট হোল্ড আপ
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">কোনো আপ ট্রিপ নেই</span>
                        )}
                      </td>

                      {/* Down Trip */}
                      <td className="py-3 px-4">
                        {p.downTrip ? (
                          <div>
                            <div className="font-semibold text-slate-800">
                              {p.downTrip.tripNo} ({p.downTrip.departureTime})
                            </div>
                            <div className="font-bold text-emerald-700 text-xs">
                              {formatTaka(p.downCollection)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              সিট বুকড: {toBengaliDigits(p.downTrip.totalBookedSeats || 0)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">কোনো ডাউন ট্রিপ নেই</span>
                        )}
                      </td>

                      {/* Combined Collection */}
                      <td className="py-3 px-4">
                        <div className="text-sm font-black text-slate-900">
                          {formatTaka(p.combinedCollection)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ({formatTaka(p.upCollection)} + {formatTaka(p.downCollection)})
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isReconciled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            <span>সমন্বিত (Reconciled)</span>
                          </span>
                        ) : isReady ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-full">
                            <Clock className="w-3 h-3" />
                            <span>সমন্বয়ের জন্য প্রস্তুত</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            <span>অসম্পূর্ণ ট্রিপ</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        {isReconciled ? (
                          <div className="text-[10px] text-slate-400">
                            অনুমোদন করেছেন: {p.existingReconciliation?.reconciledBy}
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={reconcilingVehicleId === p.vehicleId}
                            onClick={() => handleReconcile(p)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>
                              {reconcilingVehicleId === p.vehicleId ? 'সমন্বয় হচ্ছে...' : 'হিসাব অনুমোদন করুন'}
                            </span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
