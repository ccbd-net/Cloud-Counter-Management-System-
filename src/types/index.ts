export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  address: string;
  phone: string;
  subscriptionExpiry: string; // YYYY-MM-DD
  adminLoginId: string;
  status: 'active' | 'expired' | 'suspended';
  createdAt: string;
}

export interface User {
  id: string;
  loginId: string;
  name: string;
  role: 'super_admin' | 'master_admin' | 'moderator' | 'booking_point';
  companyId?: string;
  counterId?: string;
  counterName?: string;
  counterCode?: string;
  counterColor?: string;
  counterType?: 'master_booking' | 'road_booking';
  phone: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type CounterType = 'master_booking' | 'road_booking';

export interface Counter {
  id: string;
  companyId?: string;
  name: string;
  code: string;
  counterType: CounterType; // 'master_booking' (can add/edit/delete schedules) or 'road_booking' (booking only)
  address: string;
  phone: string;
  seatColor: string; // HEX color code
  status: 'active' | 'inactive';
  createdAt: string;
}

export type SeatCapacity = 42 | 46;

export interface Vehicle {
  id: string;
  regNo: string;
  seatCapacity: SeatCapacity;
  model: string;
  status: 'active' | 'maintenance' | 'inactive';
  notes?: string;
  createdAt: string;
}

export interface RouteItem {
  id: string;
  companyId?: string;
  name: string;
  origin: string;
  destination: string;
  intermediateStops: string[];
  baseFare?: number;
  distanceKm?: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type TripDirection = 'UP' | 'DOWN'; // UP: Madaripur to Dest, DOWN: Dest to Madaripur

export interface Schedule {
  id: string;
  tripNo: string;
  date: string; // YYYY-MM-DD
  departureTime: string; // e.g. "06:30 AM"
  vehicleId: string;
  vehicleRegNo: string;
  seatCapacity: SeatCapacity;
  routeId: string;
  routeName: string;
  supervisor: string;
  supervisorPhone: string;
  direction: TripDirection;
  fare: number;
  isNightHold: boolean;
  status: 'scheduled' | 'running' | 'completed' | 'cancelled';
  reconciled: boolean;
  reconciliationId?: string;
  totalBookedSeats: number;
  totalCollection: number;
  lastTripUpdateAt?: string;
  lastTripUpdateReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  ticketNo: string;
  scheduleId: string;
  tripNo: string;
  tripDate: string;
  tripTime: string;
  vehicleRegNo: string;
  routeName: string;
  direction: TripDirection;
  counterId: string;
  counterName: string;
  counterCode: string;
  counterColor: string;
  bookedByUserId: string;
  bookedByUserName: string;
  passengerName: string;
  passengerPhone: string;
  boardingPoint: string;
  destination: string;
  seatNumbers: string[];
  totalSeats: number;
  farePerSeat: number;
  totalFare: number;
  status: 'booked' | 'cancelled';
  bookedAt: string;
  printedCount: number;
  lastPrintedAt?: string;
}

export interface Reconciliation {
  id: string;
  reconNo: string;
  operationalDate: string;
  vehicleId: string;
  vehicleRegNo: string;
  routeName: string;
  supervisor: string;
  upTripId?: string;
  upTripNo?: string;
  downTripId?: string;
  downTripNo?: string;
  upCollection: number;
  downCollection: number;
  combinedCollection: number; // upCollection + downCollection
  status: 'completed' | 'pending' | 'flagged';
  isNightHoldMatch: boolean;
  notes?: string;
  reconciledBy: string;
  reconciledAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  actionType: string;
  entityType: string;
  entityId: string;
  details: string;
  tripIdAffected?: string;
  previousValues?: any;
  newValues?: any;
}

export interface SystemSettings {
  companyName: string;
  subTitle: string;
  hotline: string;
  defaultFare: number;
  noticeText: string;
  currency: string;
  timezone: string;
}

export interface AnalyticsSummary {
  totalBookings: number;
  seatsSold: number;
  ticketSales: number;
  activeTrips: number;
  totalCollections: number;
  unreconciledTrips: number;
  vehicleWiseCollections: Array<{
    regNo: string;
    upCollection: number;
    downCollection: number;
    total: number;
  }>;
  counterWiseSales: Array<{
    counterName: string;
    counterCode: string;
    seatColor: string;
    seatsSold: number;
    totalRevenue: number;
  }>;
}
