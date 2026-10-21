import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Bus, KeyRound, User as UserIcon, ShieldAlert, ArrowRight, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [loginId, setLoginId] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginId.trim() || !pin.trim()) {
      setError('অনুগ্রহ করে লগইন আইডি এবং পিন কোড প্রদান করুন।');
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      setError('পিন কোড অবশ্যই ৪ থেকে ৬ ডিজিটের হতে হবে।');
      return;
    }

    setLoading(true);
    try {
      await login(loginId.trim(), pin.trim());
    } catch (err: any) {
      setError(err.message || 'ভুল লগইন তথ্য! অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (id: string, p: string) => {
    setLoginId(id);
    setPin(p);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col justify-center items-center p-4">
      {/* Container */}
      <div className="w-full max-w-md">
        {/* App Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-2xl shadow-xl shadow-emerald-900/60 mb-3">
            CMS
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            Counter Management System
          </h1>
          <p className="text-emerald-400 font-bold text-sm mt-1">
            কাউন্টার ম্যানেজমেন্ট সিস্টেম
          </p>
          <div className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-full text-slate-300 text-xs backdrop-blur-xs">
            মাল্টি-কোম্পানি বাস কাউন্টার ও ট্রিপ ইনফরমেশন
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          <div className="mb-6 border-b pb-4">
            <h2 className="text-lg font-bold text-slate-900">কাউন্টার ও সিস্টেম লগইন</h2>
            <p className="text-xs text-slate-500 mt-1">
              আপনার নির্ধারিত লগইন আইডি ও ৪-৬ ডিজিট সিকিউর পিন দিয়ে প্রবেশ করুন
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-red-200">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                লগইন আইডি (Login ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="যেমন: admin, mdp01, syd01"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                সিকিউর পিন কোড (৪-৬ ডিজিট)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-950/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                'যাচাই করা হচ্ছে...'
              ) : (
                <>
                  <span>লগইন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials helper for testers */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
              এক ক্লিকে টেস্ট অ্যাকাউন্ট পূরণ করুন
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', '1234')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-[11px] text-purple-700">জায়িম ভুইয়া (সুপার এডমিন)</div>
                <div className="text-[10px] text-slate-500">admin / 1234</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('mod01', '5678')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-[11px] text-blue-700">রফিকুল (ম্যানেজার)</div>
                <div className="text-[10px] text-slate-500">mod01 / 5678</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('mdp01', '1122')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-[11px] text-emerald-700">মাদারীপুর (মাষ্টার বুকিং)</div>
                <div className="text-[10px] text-slate-500">mdp01 / 1122</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('syd01', '3344')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-[11px] text-emerald-700">সায়েদাবাদ (রোড বুকিং)</div>
                <div className="text-[10px] text-slate-500">syd01 / 3344</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>সার্ভার-সাইড হ্যাশ ও পিন ভেরিফিকেশন সুরক্ষিত</span>
        </div>
      </div>
    </div>
  );
};
