import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  User,
  Counter,
  Vehicle,
  RouteItem,
  Schedule,
  Booking,
  Reconciliation,
  AuditLog,
  SystemSettings,
  Company,
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  companies: (Company & { adminPinHash: string; adminPinSalt: string })[];
  users: (User & { pinHash: string; pinSalt: string })[];
  counters: Counter[];
  vehicles: Vehicle[];
  routes: RouteItem[];
  schedules: Schedule[];
  bookings: Booking[];
  reconciliations: Reconciliation[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
}

export function hashPin(pin: string, salt: string): string {
  return crypto.pbkdf2Sync(pin, salt, 1000, 32, 'sha256').toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function verifyPin(pin: string, hash: string, salt: string): boolean {
  const calculated = hashPin(pin, salt);
  return calculated === hash;
}

// Seat Generation Utility for 42 & 46 seats
export function generateValidSeatList(capacity: 42 | 46): string[] {
  const seats: string[] = [];
  if (capacity === 42) {
    // A to I (9 rows of 4 seats = 36)
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    for (const r of rows) {
      seats.push(`${r}1`, `${r}2`, `${r}3`, `${r}4`);
    }
    // J row has 5 seats (36 + 5 = 41)
    seats.push('J1', 'J2', 'J3', 'J4', 'J5');
    // plus EX-1 (41 + 1 = 42)
    seats.push('EX-1');
  } else {
    // 46 seats: A to J (10 rows of 4 seats = 40)
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    for (const r of rows) {
      seats.push(`${r}1`, `${r}2`, `${r}3`, `${r}4`);
    }
    // K row has 5 seats (40 + 5 = 45)
    seats.push('K1', 'K2', 'K3', 'K4', 'K5');
    // plus EX-1 (45 + 1 = 46)
    seats.push('EX-1');
  }
  return seats;
}

function getTodayDhakaDate(): string {
  // Asia/Dhaka is UTC+6
  const now = new Date();
  const dhakaTime = new Date(now.getTime() + 6 * 3600 * 1000);
  return dhakaTime.toISOString().split('T')[0];
}

function getInitialDatabase(): DatabaseSchema {
  const today = getTodayDhakaDate();

  // Generate Salts and Hashes for default users
  const adminSalt = generateSalt();
  const modSalt = generateSalt();
  const mdpSalt = generateSalt();
  const sydSalt = generateSalt();
  const gbtSalt = generateSalt();
  const pdmSalt = generateSalt();
  const cmpSalt = generateSalt();

  const companies: (Company & { adminPinHash: string; adminPinSalt: string })[] = [
    {
      id: 'cmp-01',
      name: 'মাদারীপুর ডিলাক্স পরিবহন লিমিটেড',
      logoUrl: '',
      address: 'মাদারীপুর নতুন বাস টার্মিনাল, মাদারীপুর সদর',
      phone: '01711-223344',
      subscriptionExpiry: '2027-12-31',
      adminLoginId: 'deluxe01',
      adminPinHash: hashPin('1234', cmpSalt),
      adminPinSalt: cmpSalt,
      status: 'active',
      createdAt: '2026-01-01T08:00:00Z',
    },
  ];

  const counters: Counter[] = [
    {
      id: 'cnt-01',
      companyId: 'cmp-01',
      name: 'মাদারীপুর প্রধান টার্মিনাল কাউন্টার (মাষ্টার বুকিং)',
      code: 'MDP-01',
      counterType: 'master_booking', // Master Booking Counter can add, edit, and delete schedules
      address: 'মাদারীপুর নতুন বাস টার্মিনাল, মাদারীপুর সদর',
      phone: '01711-223344',
      seatColor: '#2563EB', // Royal Blue
      status: 'active',
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'cnt-02',
      companyId: 'cmp-01',
      name: 'সায়েদাবাদ কাউন্টার (রোড বুকিং)',
      code: 'SYD-01',
      counterType: 'road_booking', // Road Booking Counter (booking only)
      address: 'সায়েদাবাদ আন্তঃজেলা বাস টার্মিনাল, ঢাকা',
      phone: '01722-334455',
      seatColor: '#059669', // Emerald Green
      status: 'active',
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'cnt-03',
      companyId: 'cmp-01',
      name: 'গাবতলী কাউন্টার (রোড বুকিং)',
      code: 'GBT-01',
      counterType: 'road_booking',
      address: 'গাবতলী বাস টার্মিনাল, ঢাকা',
      phone: '01733-445566',
      seatColor: '#D97706', // Amber
      status: 'active',
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'cnt-04',
      companyId: 'cmp-01',
      name: 'পদ্মা সেতু টোলপ্লাজা কাউন্টার (রোড বুকিং)',
      code: 'PDM-01',
      counterType: 'road_booking',
      address: 'মাওয়া ইন্টারচেঞ্জ, মুন্সীগঞ্জ',
      phone: '01744-556677',
      seatColor: '#7C3AED', // Purple
      status: 'active',
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'cnt-05',
      companyId: 'cmp-01',
      name: 'মাদারীপুর পুরান বাজার কাউন্টার (রোড বুকিং)',
      code: 'MDP-02',
      counterType: 'road_booking',
      address: 'পুরান বাজার ঘাট, মাদারীপুর',
      phone: '01755-667788',
      seatColor: '#DB2777', // Pink
      status: 'active',
      createdAt: '2026-01-01T08:00:00Z',
    },
  ];

  const users: (User & { pinHash: string; pinSalt: string })[] = [
    {
      id: 'usr-01',
      loginId: 'admin',
      name: 'Zayem Bhuiya / জায়িম ভুইয়া',
      role: 'master_admin',
      phone: '01700-111111',
      status: 'active',
      pinHash: hashPin('1234', adminSalt),
      pinSalt: adminSalt,
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'usr-02',
      loginId: 'mod01',
      name: 'রফিকুল ইসলাম (অপারেশন ম্যানেজার)',
      role: 'moderator',
      companyId: 'cmp-01',
      phone: '01700-222222',
      status: 'active',
      pinHash: hashPin('5678', modSalt),
      pinSalt: modSalt,
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'usr-03',
      loginId: 'mdp01',
      name: 'তারিকুল ইসলাম (মাদারীপুর প্রধান)',
      role: 'booking_point',
      companyId: 'cmp-01',
      counterId: 'cnt-01',
      counterName: 'মাদারীপুর প্রধান টার্মিনাল কাউন্টার (মাষ্টার বুকিং)',
      counterCode: 'MDP-01',
      counterColor: '#2563EB',
      counterType: 'master_booking',
      phone: '01711-223344',
      status: 'active',
      pinHash: hashPin('1122', mdpSalt),
      pinSalt: mdpSalt,
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'usr-04',
      loginId: 'syd01',
      name: 'শাহ আলম (সায়েদাবাদ কাউন্টার)',
      role: 'booking_point',
      counterId: 'cnt-02',
      counterName: 'সায়েদাবাদ কাউন্টার',
      counterCode: 'SYD-01',
      counterColor: '#059669',
      phone: '01722-334455',
      status: 'active',
      pinHash: hashPin('3344', sydSalt),
      pinSalt: sydSalt,
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'usr-05',
      loginId: 'gbt01',
      name: 'মোস্তাফিজুর রহমান (গাবতলী কাউন্টার)',
      role: 'booking_point',
      counterId: 'cnt-03',
      counterName: 'গাবতলী কাউন্টার',
      counterCode: 'GBT-01',
      counterColor: '#D97706',
      phone: '01733-445566',
      status: 'active',
      pinHash: hashPin('5566', gbtSalt),
      pinSalt: gbtSalt,
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'usr-06',
      loginId: 'pdm01',
      name: 'কামাল হোসেন (পদ্মা সেতু কাউন্টার)',
      role: 'booking_point',
      counterId: 'cnt-04',
      counterName: 'পদ্মা সেতু টোলপ্লাজা কাউন্টার',
      counterCode: 'PDM-01',
      counterColor: '#7C3AED',
      phone: '01744-556677',
      status: 'active',
      pinHash: hashPin('7788', pdmSalt),
      pinSalt: pdmSalt,
      createdAt: '2026-01-01T08:00:00Z',
    },
  ];

  const vehicles: Vehicle[] = [
    {
      id: 'veh-01',
      regNo: 'ঢাকা মেট্রো-ব ১৫-৪২০১',
      seatCapacity: 42,
      model: 'Hino 1J Plus AC (Air Suspension)',
      status: 'active',
      notes: 'নিয়মিত সার্ভিসিং সম্পন্ন, সাউন্ড সিস্টেম সচল',
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'veh-02',
      regNo: 'ঢাকা মেট্রো-ব ১৪-৯৮২২',
      seatCapacity: 46,
      model: 'Hyundai Universe Luxury AC',
      status: 'active',
      notes: 'নতুন টায়ার সংযোজন করা হয়েছে',
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'veh-03',
      regNo: 'ঢাকা মেট্রো-ব ১৫-১১৭৭',
      seatCapacity: 42,
      model: 'Hino AK Deluxe Non-AC',
      status: 'active',
      notes: 'জরুরি ব্যাকআপ ট্রিপ হিসেবেও ব্যবহৃত হয়',
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'veh-04',
      regNo: 'মাদারীপুর-ব ১১-২৩৪৫',
      seatCapacity: 46,
      model: 'Scania Comfort Line AC',
      status: 'active',
      notes: 'রাত্রীকালীন এক্সপ্রেস স্পেশাল',
      createdAt: '2026-01-01T08:00:00Z',
    },
  ];

  const routes: RouteItem[] = [
    {
      id: 'rt-01',
      name: 'মাদারীপুর - সায়েদাবাদ - গাবতলী (এক্সপ্রেস)',
      origin: 'মাদারীপুর',
      destination: 'ঢাকা (গাবতলী)',
      intermediateStops: ['ভাঙ্গা', 'শিবচর', 'পদ্মা সেতু টোলপ্লাজা', 'পোস্তগোলা', 'সায়েদাবাদ', 'ফার্মগেট'],
      baseFare: 550,
      distanceKm: 85,
      status: 'active',
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'rt-02',
      name: 'মাদারীপুর - পদ্মা সেতু - সায়েদাবাদ',
      origin: 'মাদারীপুর',
      destination: 'ঢাকা (সায়েদাবাদ)',
      intermediateStops: ['ভাঙ্গা মোড়', 'পদ্মা সেতু এক্সপ্রেসওয়ে', 'জুরাইন'],
      baseFare: 500,
      distanceKm: 78,
      status: 'active',
      createdAt: '2026-01-01T08:00:00Z',
    },
  ];

  const schedules: Schedule[] = [
    {
      id: 'sch-01',
      tripNo: 'TR-UP-001',
      date: today,
      departureTime: '06:30 AM',
      vehicleId: 'veh-01',
      vehicleRegNo: 'ঢাকা মেট্রো-ব ১৫-৪২০১',
      seatCapacity: 42,
      routeId: 'rt-01',
      routeName: 'মাদারীপুর - সায়েদাবাদ - গাবতলী (এক্সপ্রেস)',
      supervisor: 'মাসুদ রানা',
      supervisorPhone: '01811-123456',
      direction: 'UP',
      fare: 550,
      isNightHold: false,
      status: 'scheduled',
      reconciled: false,
      totalBookedSeats: 6,
      totalCollection: 3300,
      createdAt: '2026-01-01T08:00:00Z',
      updatedAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'sch-02',
      tripNo: 'TR-DOWN-001',
      date: today,
      departureTime: '11:30 AM',
      vehicleId: 'veh-01',
      vehicleRegNo: 'ঢাকা মেট্রো-ব ১৫-৪২০১',
      seatCapacity: 42,
      routeId: 'rt-01',
      routeName: 'মাদারীপুর - সায়েদাবাদ - গাবতলী (এক্সপ্রেস)',
      supervisor: 'মাসুদ রানা',
      supervisorPhone: '01811-123456',
      direction: 'DOWN',
      fare: 550,
      isNightHold: false,
      status: 'scheduled',
      reconciled: false,
      totalBookedSeats: 5,
      totalCollection: 2750,
      createdAt: '2026-01-01T08:00:00Z',
      updatedAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'sch-03',
      tripNo: 'TR-UP-002',
      date: today,
      departureTime: '08:00 AM',
      vehicleId: 'veh-02',
      vehicleRegNo: 'ঢাকা মেট্রো-ব ১৪-৯৮২২',
      seatCapacity: 46,
      routeId: 'rt-01',
      routeName: 'মাদারীপুর - সায়েদাবাদ - গাবতলী (এক্সপ্রেস)',
      supervisor: 'আমিনুল হক',
      supervisorPhone: '01822-234567',
      direction: 'UP',
      fare: 550,
      isNightHold: false,
      status: 'scheduled',
      reconciled: false,
      totalBookedSeats: 8,
      totalCollection: 4400,
      createdAt: '2026-01-01T08:00:00Z',
      updatedAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'sch-04',
      tripNo: 'TR-DOWN-002',
      date: today,
      departureTime: '02:00 PM',
      vehicleId: 'veh-02',
      vehicleRegNo: 'ঢাকা মেট্রো-ব ১৪-৯৮২২',
      seatCapacity: 46,
      routeId: 'rt-01',
      routeName: 'মাদারীপুর - সায়েদাবাদ - গাবতলী (এক্সপ্রেস)',
      supervisor: 'আমিনুল হক',
      supervisorPhone: '01822-234567',
      direction: 'DOWN',
      fare: 550,
      isNightHold: false,
      status: 'scheduled',
      reconciled: false,
      totalBookedSeats: 4,
      totalCollection: 2200,
      createdAt: '2026-01-01T08:00:00Z',
      updatedAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'sch-05',
      tripNo: 'TR-UP-003',
      date: today,
      departureTime: '09:30 PM',
      vehicleId: 'veh-04',
      vehicleRegNo: 'মাদারীপুর-ব ১১-২৩৪৫',
      seatCapacity: 46,
      routeId: 'rt-02',
      routeName: 'মাদারীপুর - পদ্মা সেতু - সায়েদাবাদ',
      supervisor: 'জহিরুল ইসলাম',
      supervisorPhone: '01833-345678',
      direction: 'UP',
      fare: 500,
      isNightHold: true, // Night hold trip!
      status: 'scheduled',
      reconciled: false,
      totalBookedSeats: 12,
      totalCollection: 6000,
      createdAt: '2026-01-01T08:00:00Z',
      updatedAt: '2026-01-01T08:00:00Z',
    },
  ];

  const bookings: Booking[] = [
    {
      id: 'bkg-01',
      ticketNo: 'ZB-TKT-2610-001',
      scheduleId: 'sch-01',
      tripNo: 'TR-UP-001',
      tripDate: today,
      tripTime: '06:30 AM',
      vehicleRegNo: 'ঢাকা মেট্রো-ব ১৫-৪২০১',
      routeName: 'মাদারীপুর - সায়েদাবাদ - গাবতলী (এক্সপ্রেস)',
      direction: 'UP',
      counterId: 'cnt-01',
      counterName: 'মাদারীপুর প্রধান টার্মিনাল কাউন্টার',
      counterCode: 'MDP-01',
      counterColor: '#2563EB',
      bookedByUserId: 'usr-03',
      bookedByUserName: 'তারিকুল ইসলাম (মাদারীপুর প্রধান)',
      passengerName: 'জাহিদুল হাসান',
      passengerPhone: '01712-345678',
      boardingPoint: 'মাদারীপুর টার্মিনাল',
      destination: 'ঢাকা (সায়েদাবাদ)',
      seatNumbers: ['A1', 'A2'],
      totalSeats: 2,
      farePerSeat: 550,
      totalFare: 1100,
      status: 'booked',
      bookedAt: `${today}T06:00:00Z`,
      printedCount: 1,
      lastPrintedAt: `${today}T06:05:00Z`,
    },
    {
      id: 'bkg-02',
      ticketNo: 'ZB-TKT-2610-002',
      scheduleId: 'sch-01',
      tripNo: 'TR-UP-001',
      tripDate: today,
      tripTime: '06:30 AM',
      vehicleRegNo: 'ঢাকা মেট্রো-ব ১৫-৪২০১',
      routeName: 'মাদারীপুর - সায়েদাবাদ - গাবতলী (এক্সপ্রেস)',
      direction: 'UP',
      counterId: 'cnt-01',
      counterName: 'মাদারীপুর প্রধান টার্মিনাল কাউন্টার',
      counterCode: 'MDP-01',
      counterColor: '#2563EB',
      bookedByUserId: 'usr-03',
      bookedByUserName: 'তারিকুল ইসলাম (মাদারীপুর প্রধান)',
      passengerName: 'তানিয়া আক্তার',
      passengerPhone: '01819-876543',
      boardingPoint: 'মাদারীপুর টার্মিনাল',
      destination: 'ঢাকা (গাবতলী)',
      seatNumbers: ['B3', 'B4'],
      totalSeats: 2,
      farePerSeat: 550,
      totalFare: 1100,
      status: 'booked',
      bookedAt: `${today}T06:10:00Z`,
      printedCount: 2,
      lastPrintedAt: `${today}T06:12:00Z`,
    },
    {
      id: 'bkg-03',
      ticketNo: 'ZB-TKT-2610-003',
      scheduleId: 'sch-01',
      tripNo: 'TR-UP-001',
      tripDate: today,
      tripTime: '06:30 AM',
      vehicleRegNo: 'ঢাকা মেট্রো-ব ১৫-৪২০১',
      routeName: 'মাদারীপুর - সায়েদাবাদ - গাবতলী (এক্সপ্রেস)',
      direction: 'UP',
      counterId: 'cnt-04',
      counterName: 'পদ্মা সেতু টোলপ্লাজা কাউন্টার',
      counterCode: 'PDM-01',
      counterColor: '#7C3AED',
      bookedByUserId: 'usr-06',
      bookedByUserName: 'কামাল হোসেন (পদ্মা সেতু কাউন্টার)',
      passengerName: 'ড. আবদুর রহিম',
      passengerPhone: '01911-223344',
      boardingPoint: 'পদ্মা সেতু মাওয়া প্রান্ত',
      destination: 'ঢাকা (গাবতলী)',
      seatNumbers: ['C1', 'C2'],
      totalSeats: 2,
      farePerSeat: 550,
      totalFare: 1100,
      status: 'booked',
      bookedAt: `${today}T06:15:00Z`,
      printedCount: 1,
      lastPrintedAt: `${today}T06:16:00Z`,
    },
    {
      id: 'bkg-04',
      ticketNo: 'ZB-TKT-2610-004',
      scheduleId: 'sch-02',
      tripNo: 'TR-DOWN-001',
      tripDate: today,
      tripTime: '11:30 AM',
      vehicleRegNo: 'ঢাকা মেট্রো-ব ১৫-৪২০১',
      routeName: 'মাদারীপুর - সায়েদাবাদ - গাবতলী (এক্সপ্রেস)',
      direction: 'DOWN',
      counterId: 'cnt-02',
      counterName: 'সায়েদাবাদ কাউন্টার',
      counterCode: 'SYD-01',
      counterColor: '#059669',
      bookedByUserId: 'usr-04',
      bookedByUserName: 'শাহ আলম (সায়েদাবাদ কাউন্টার)',
      passengerName: 'ফারুক হোসেন',
      passengerPhone: '01677-889900',
      boardingPoint: 'সায়েদাবাদ টার্মিনাল',
      destination: 'মাদারীপুর টার্মিনাল',
      seatNumbers: ['A1', 'A2', 'A3'],
      totalSeats: 3,
      farePerSeat: 550,
      totalFare: 1650,
      status: 'booked',
      bookedAt: `${today}T09:00:00Z`,
      printedCount: 1,
      lastPrintedAt: `${today}T09:05:00Z`,
    },
    {
      id: 'bkg-05',
      ticketNo: 'ZB-TKT-2610-005',
      scheduleId: 'sch-02',
      tripNo: 'TR-DOWN-001',
      tripDate: today,
      tripTime: '11:30 AM',
      vehicleRegNo: 'ঢাকা মেট্রো-ব ১৫-৪২০১',
      routeName: 'মাদারীপুর - সায়েদাবাদ - গাবতলী (এক্সপ্রেস)',
      direction: 'DOWN',
      counterId: 'cnt-03',
      counterName: 'গাবতলী কাউন্টার',
      counterCode: 'GBT-01',
      counterColor: '#D97706',
      bookedByUserId: 'usr-05',
      bookedByUserName: 'মোস্তাফিজুর রহমান (গাবতলী কাউন্টার)',
      passengerName: 'মাহমুদুল হক',
      passengerPhone: '01718-990011',
      boardingPoint: 'গাবতলী',
      destination: 'মাদারীপুর টার্মিনাল',
      seatNumbers: ['D1', 'D2'],
      totalSeats: 2,
      farePerSeat: 550,
      totalFare: 1100,
      status: 'booked',
      bookedAt: `${today}T09:30:00Z`,
      printedCount: 1,
      lastPrintedAt: `${today}T09:35:00Z`,
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'aud-01',
      timestamp: `${today}T05:30:00Z`,
      userId: 'usr-01',
      userName: 'মোহাম্মদ ইমরান খান (সুপার অ্যাডমিন)',
      role: 'master_admin',
      actionType: 'CREATE_SCHEDULE',
      entityType: 'SCHEDULE',
      entityId: 'sch-01',
      details: 'আজকের প্রথম আপ ট্রিপ (TR-UP-001) সফলভাবে শিডিউল তৈরি করা হয়েছে।',
    },
    {
      id: 'aud-02',
      timestamp: `${today}T06:00:00Z`,
      userId: 'usr-03',
      userName: 'তারিকুল ইসলাম (মাদারীপুর প্রধান)',
      role: 'booking_point',
      actionType: 'CREATE_BOOKING',
      entityType: 'BOOKING',
      entityId: 'bkg-01',
      details: 'টিকিট নং ZB-TKT-2610-001 এর অধীনে সিট A1, A2 বুকিং সম্পন্ন হয়েছে।',
    },
  ];

  const settings: SystemSettings = {
    companyName: 'Counter Management System',
    subTitle: 'কাউন্টার বুকিং ও ট্রিপ ইনফরমেশন',
    hotline: '01711-000000',
    defaultFare: 550,
    noticeText: 'পদ্মা সেতু রুটে নতুন আরামদায়ক এসি বাস নিয়মিত চলাচল করছে। সকল কাউন্টারকে দ্রুত বুকিং ও প্রিন্ট সেবা নিশ্চিত করতে অনুরোধ করা হচ্ছে।',
    currency: '৳',
    timezone: 'Asia/Dhaka',
  };

  return {
    companies,
    users,
    counters,
    vehicles,
    routes,
    schedules,
    bookings,
    reconciliations: [],
    auditLogs,
    settings,
  };
}

class Database {
  private data: DatabaseSchema;
  private saveTimer: NodeJS.Timeout | null = null;
  private lock: boolean = false;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.users && parsed.counters && parsed.schedules) {
          if (!parsed.companies) {
            parsed.companies = [
              {
                id: 'cmp-01',
                name: 'মাদারীপুর ডিলাক্স পরিবহন লিমিটেড',
                logoUrl: '',
                address: 'মাদারীপুর নতুন বাস টার্মিনাল, মাদারীপুর সদর',
                phone: '01711-223344',
                subscriptionExpiry: '2027-12-31',
                adminLoginId: 'deluxe01',
                adminPinHash: hashPin('1234', 'default-salt'),
                adminPinSalt: 'default-salt',
                status: 'active',
                createdAt: '2026-01-01T08:00:00Z',
              },
            ];
          }
          // Ensure Super Admin name is updated
          const admin = parsed.users.find((u: any) => u.loginId === 'admin');
          if (admin) {
            admin.name = 'Zayem Bhuiya / জায়িম ভুইয়া';
          }
          // Ensure counterType is set on counters
          parsed.counters.forEach((c: any) => {
            if (!c.counterType) {
              c.counterType = c.id === 'cnt-01' ? 'master_booking' : 'road_booking';
            }
          });
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to load existing db.json, generating defaults:', err);
    }
    const initial = getInitialDatabase();
    this.persistSync(initial);
    return initial;
  }

  private persistSync(dataToSave: DatabaseSchema) {
    try {
      this.ensureDataDir();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error saving database to file:', err);
    }
  }

  public save() {
    // Immediate synchronous save to guarantee ACID persistence across restarts
    this.persistSync(this.data);
  }

  // Companies
  public getCompanies() {
    if (!this.data.companies) this.data.companies = [];
    return this.data.companies;
  }

  public createCompany(data: {
    name: string;
    logoUrl?: string;
    address: string;
    phone: string;
    subscriptionExpiry: string;
    adminLoginId: string;
    pin: string;
  }) {
    const salt = generateSalt();
    const pinHash = hashPin(data.pin, salt);
    const newCompany = {
      id: `cmp-${Date.now()}`,
      name: data.name.trim(),
      logoUrl: data.logoUrl || '',
      address: data.address.trim(),
      phone: data.phone.trim(),
      subscriptionExpiry: data.subscriptionExpiry,
      adminLoginId: data.adminLoginId.trim(),
      adminPinHash: pinHash,
      adminPinSalt: salt,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
    };
    this.getCompanies().push(newCompany);

    // Also register company admin user
    const userSalt = generateSalt();
    this.data.users.push({
      id: `usr-${Date.now()}`,
      loginId: data.adminLoginId.trim(),
      name: `${data.name} এডমিন`,
      role: 'master_admin',
      companyId: newCompany.id,
      phone: data.phone.trim(),
      status: 'active',
      pinHash: hashPin(data.pin, userSalt),
      pinSalt: userSalt,
      createdAt: new Date().toISOString(),
    });

    this.save();
    return newCompany;
  }

  public updateCompany(id: string, data: Partial<Company> & { pin?: string }) {
    const comp = this.getCompanies().find((c) => c.id === id);
    if (!comp) throw new Error('কোম্পানি খুঁজে পাওয়া যায়নি!');
    if (data.name) comp.name = data.name.trim();
    if (data.logoUrl !== undefined) comp.logoUrl = data.logoUrl;
    if (data.address !== undefined) comp.address = data.address.trim();
    if (data.phone !== undefined) comp.phone = data.phone.trim();
    if (data.subscriptionExpiry !== undefined) comp.subscriptionExpiry = data.subscriptionExpiry;
    if (data.status !== undefined) comp.status = data.status;
    if (data.pin && data.pin.trim()) {
      const salt = generateSalt();
      comp.adminPinSalt = salt;
      comp.adminPinHash = hashPin(data.pin.trim(), salt);
    }
    this.save();
    return comp;
  }

  public deleteCompany(id: string) {
    const index = this.getCompanies().findIndex((c) => c.id === id);
    if (index === -1) throw new Error('কোম্পানি খুঁজে পাওয়া যায়নি!');
    this.getCompanies().splice(index, 1);
    this.save();
  }

  // Routes Edit & Delete
  public updateRoute(id: string, data: Partial<RouteItem>) {
    const route = this.data.routes.find((r) => r.id === id);
    if (!route) throw new Error('রুট খুঁজে পাওয়া যায়নি!');
    if (data.name) route.name = data.name.trim();
    if (data.origin) route.origin = data.origin.trim();
    if (data.destination) route.destination = data.destination.trim();
    if (data.intermediateStops) route.intermediateStops = data.intermediateStops;
    if (data.baseFare !== undefined) route.baseFare = data.baseFare;
    if (data.distanceKm !== undefined) route.distanceKm = data.distanceKm;
    if (data.status) route.status = data.status;
    this.save();
    return route;
  }

  public deleteRoute(id: string) {
    const index = this.data.routes.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('রুট খুঁজে পাওয়া যায়নি!');
    this.data.routes.splice(index, 1);
    this.save();
  }

  // Schedule Delete
  public deleteSchedule(id: string) {
    const index = this.data.schedules.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('ট্রিপ শিডিউল খুঁজে পাওয়া যায়নি!');
    // If has active bookings, throw error or warn
    const bookings = this.data.bookings.filter((b) => b.scheduleId === id && b.status === 'booked');
    if (bookings.length > 0) {
      throw new Error(`এই ট্রিপে ইতিমধ্যে ${bookings.length}টি সিট বুকিং রয়েছে! আগে বুকিং বাতিল করতে হবে।`);
    }
    this.data.schedules.splice(index, 1);
    this.save();
  }

  // Getters
  public getUsers() {
    return this.data.users;
  }

  public getCounters() {
    return this.data.counters;
  }

  public getVehicles() {
    return this.data.vehicles;
  }

  public getRoutes() {
    return this.data.routes;
  }

  public getSchedules() {
    return this.data.schedules;
  }

  public getBookings() {
    return this.data.bookings;
  }

  public getReconciliations() {
    return this.data.reconciliations;
  }

  public getAuditLogs() {
    return this.data.auditLogs;
  }

  public getSettings() {
    return this.data.settings;
  }

  public updateSettings(newSettings: Partial<SystemSettings>) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    return this.data.settings;
  }

  // Audit Log Helper
  public logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const entry: AuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(entry);
    // Keep last 1000 logs
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 1000);
    }
    this.save();
    return entry;
  }

  // ATOMIC SEAT BOOKING with Race-Condition Protection
  public atomicBookSeats(params: {
    scheduleId: string;
    counterId: string;
    bookedByUserId: string;
    bookedByUserName: string;
    passengerName: string;
    passengerPhone: string;
    boardingPoint: string;
    destination: string;
    seatNumbers: string[];
  }): { booking: Booking; schedule: Schedule } {
    // Ensure thread-safety in Node.js event loop
    const schedule = this.data.schedules.find((s) => s.id === params.scheduleId);
    if (!schedule) {
      throw new Error('ট্রিপ শিডিউল খুঁজে পাওয়া যায়নি!');
    }

    if (schedule.status === 'cancelled') {
      throw new Error('এই ট্রিপটি বাতিল করা হয়েছে!');
    }

    // 1. Validate seats against vehicle layout
    const validSeats = generateValidSeatList(schedule.seatCapacity);
    for (const seat of params.seatNumbers) {
      if (!validSeats.includes(seat)) {
        throw new Error(`অবৈধ সিট নম্বর: ${seat}। এই গাড়িতে এই সিটটি নেই।`);
      }
    }

    // 2. Check collision with existing active bookings for this schedule
    const activeBookings = this.data.bookings.filter(
      (b) => b.scheduleId === params.scheduleId && b.status === 'booked'
    );

    const alreadyBookedSeats = new Set<string>();
    for (const b of activeBookings) {
      for (const s of b.seatNumbers) {
        alreadyBookedSeats.add(s);
      }
    }

    const collidingSeats = params.seatNumbers.filter((s) => alreadyBookedSeats.has(s));
    if (collidingSeats.length > 0) {
      throw new Error(
        `দুঃখিত! সিট ${collidingSeats.join(', ')} ইতিমধ্যেই অন্য কাউন্টার বা গ্রাহক দ্বারা বুক করা হয়েছে!`
      );
    }

    // 3. Find Counter
    const counter = this.data.counters.find((c) => c.id === params.counterId);
    if (!counter) {
      throw new Error('কাউন্টার সনাক্ত করা যায়নি!');
    }

    // 4. Calculate Fare
    const farePerSeat = schedule.fare;
    const totalFare = farePerSeat * params.seatNumbers.length;

    // 5. Generate Ticket Number
    const dateNum = schedule.date.replace(/-/g, '');
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const ticketNo = `ZB-${schedule.direction}-${dateNum}-${randomHex}`;

    const newBooking: Booking = {
      id: `bkg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ticketNo,
      scheduleId: schedule.id,
      tripNo: schedule.tripNo,
      tripDate: schedule.date,
      tripTime: schedule.departureTime,
      vehicleRegNo: schedule.vehicleRegNo,
      routeName: schedule.routeName,
      direction: schedule.direction,
      counterId: counter.id,
      counterName: counter.name,
      counterCode: counter.code,
      counterColor: counter.seatColor,
      bookedByUserId: params.bookedByUserId,
      bookedByUserName: params.bookedByUserName,
      passengerName: params.passengerName || 'যাত্রী',
      passengerPhone: params.passengerPhone || '',
      boardingPoint: params.boardingPoint || counter.name,
      destination: params.destination || (schedule.direction === 'UP' ? 'ঢাকা' : 'মাদারীপুর'),
      seatNumbers: params.seatNumbers,
      totalSeats: params.seatNumbers.length,
      farePerSeat,
      totalFare,
      status: 'booked',
      bookedAt: new Date().toISOString(),
      printedCount: 0,
    };

    // 6. Commit booking and update schedule aggregate
    this.data.bookings.push(newBooking);
    schedule.totalBookedSeats = (schedule.totalBookedSeats || 0) + params.seatNumbers.length;
    schedule.totalCollection = (schedule.totalCollection || 0) + totalFare;

    this.logAudit({
      userId: params.bookedByUserId,
      userName: params.bookedByUserName,
      role: 'booking_point',
      actionType: 'CREATE_BOOKING',
      entityType: 'BOOKING',
      entityId: newBooking.id,
      tripIdAffected: schedule.id,
      details: `${counter.name} থেকে টিকিট নং ${ticketNo} এর অধীনে সিট ${params.seatNumbers.join(
        ', '
      )} সফলভাবে বুক করা হয়েছে। মোট ভাড়া: ৳${totalFare}`,
      newValues: { ticketNo, seats: params.seatNumbers, totalFare },
    });

    this.save();
    return { booking: newBooking, schedule };
  }

  // CANCEL BOOKING
  public cancelBooking(bookingId: string, user: { id: string; name: string; role: string }): Booking {
    const booking = this.data.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new Error('বুকিং খুঁজে পাওয়া যায়নি!');
    }
    if (booking.status === 'cancelled') {
      throw new Error('এই বুকিংটি ইতিমধ্যেই বাতিল করা হয়েছে!');
    }

    booking.status = 'cancelled';
    const schedule = this.data.schedules.find((s) => s.id === booking.scheduleId);
    if (schedule) {
      schedule.totalBookedSeats = Math.max(0, (schedule.totalBookedSeats || 0) - booking.totalSeats);
      schedule.totalCollection = Math.max(0, (schedule.totalCollection || 0) - booking.totalFare);
    }

    this.logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      actionType: 'CANCEL_BOOKING',
      entityType: 'BOOKING',
      entityId: booking.id,
      tripIdAffected: booking.scheduleId,
      details: `টিকিট নং ${booking.ticketNo} (সিট: ${booking.seatNumbers.join(
        ', '
      )}) বাতিল করা হয়েছে। রিফান্ড পরিমাণ: ৳${booking.totalFare}`,
      previousValues: { status: 'booked', seats: booking.seatNumbers },
      newValues: { status: 'cancelled' },
    });

    this.save();
    return booking;
  }

  // INCREMENT TICKET PRINT COUNT
  public incrementPrintCount(bookingId: string): Booking {
    const booking = this.data.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new Error('বুকিং খুঁজে পাওয়া যায়নি!');
    }
    booking.printedCount = (booking.printedCount || 0) + 1;
    booking.lastPrintedAt = new Date().toISOString();
    this.save();
    return booking;
  }
}

export const db = new Database();
