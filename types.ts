

export type Language = 'ar' | 'fa' | 'en';

export interface LocalizedName {
    ar: string;
    fa: string;
    en: string;
}

export enum TripType {
  OneWay = 'ONE_WAY',
  RoundTrip = 'ROUND_TRIP',
}

export interface Passengers {
  adults: number;
  children: number;
  infants: number;
}

export interface SearchQuery {
  tripType: TripType;
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  passengers: Passengers;
}

export interface FlightEndpoint {
  airportCode: string;
  airportName: string;
  city: string;
  dateTime: string;
}

export type FlightStatus = 'SCHEDULED' | 'CANCELLED' | 'DELAYED';
export enum FlightSourcingType {
    Charter = 'CHARTER',
    WebService = 'WEB_SERVICE',
    Floating = 'FLOATING',
    Manual = 'MANUAL',
}

export interface SeatAllotment {
  id: string;
  agencyId: string; // User ID
  seats: number;
  expiresAt: string; // ISO string
}

export interface Flight {
  id: string;
  airline: string;
  airlineLogoUrl: string;
  flightNumber: string;
  departure: FlightEndpoint;
  arrival: FlightEndpoint;
  duration: string;
  stops: number;
  price: number;
  taxes: number;
  flightClass: string;
  aircraft: string;
  availableSeats: number;
  totalCapacity?: number;
  baggageAllowance: string;
  status: FlightStatus;
  bookingClosesBeforeDepartureHours: number;
  sourcingType: FlightSourcingType;
  commissionModelId?: string;
  refundPolicyId?: string;
  creatorId?: string; // ID of the user (affiliate/admin) who created the flight
  allotments?: SeatAllotment[];
  tenantId?: string;
}

export enum Gender {
  Male = 'MALE',
  Female = 'FEMALE',
}

export enum Nationality {
  Iranian = 'IRANIAN',
  Foreign = 'FOREIGN',
}

export interface PassengerDetails {
  nationality: Nationality;
  firstName: string;
  lastName: string;
  gender: Gender | '';
  // Iranian passenger fields
  nationalId?: string;
  // Foreign passenger fields
  passportNumber?: string;
  passportIssuingCountry?: string;
  dateOfBirth?: string;
  passportExpiryDate?: string;
  // For saving passenger in booking form
  saveForLater?: boolean;
}

export interface SavedPassenger extends Omit<PassengerDetails, 'gender' | 'saveForLater'> {
    id: string;
    gender: Gender;
}


export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type UserRole = 'USER' | 'SUPPORT' | 'EDITOR' | 'SUPER_ADMIN' | 'AFFILIATE' | 'ACCOUNTANT';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  wallet: Wallet;
  canBypassRateLimit: boolean;
  savedPassengers?: SavedPassenger[];
  displayCurrencies?: Currency[];
  tenantId?: string;
}

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';

export interface Booking {
    id: string;
    user: User;
    flight: Flight;
    passengers: {
        adults: PassengerDetails[];
        children: PassengerDetails[];
        infants: PassengerDetails[];
    };
    contactEmail: string;
    contactPhone: string;
    query: SearchQuery;
    bookingDate: string;
    status: BookingStatus;
    cancellationDate?: string;
    purchasePrice?: number; // Cost of acquiring the ticket for manual bookings
    buyerReference?: string;
    notes?: string;
    tenantId?: string;
}

// Ticket System Types
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type MessageAuthor = 'USER' | 'ADMIN';

export interface TicketMessage {
    id: string;
    author: MessageAuthor;
    authorName: string;
    text: string;
    timestamp: string;
}

export interface Ticket {
    id: string;
    user: User;
    bookingId?: string;
    subject: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdAt: string;
    updatedAt: string;
    messages: TicketMessage[];
}

// Basic Data Management
export interface AirlineInfo {
    id: string;
    name: LocalizedName;
    logoUrl: string;
}

export interface AircraftInfo {
    id: string;
    name: LocalizedName;
    capacity: number;
}

export interface FlightClassInfo {
    id: string;
    name: LocalizedName;
}

export interface AirportInfo {
    id: string; // IATA code
    iata: string;
    name: LocalizedName;
    city: LocalizedName;
    country: LocalizedName;
}

// Refund Policies
export interface RefundPolicyRule {
    id: string;
    hoursBeforeDeparture: number;
    penaltyPercentage: number;
}

export enum PolicyType {
    Domestic = 'DOMESTIC',
    International = 'INTERNATIONAL',
}

export interface RefundPolicy {
    id: string;
    name: LocalizedName;
    rules: RefundPolicyRule[];
    airlineId?: string; // Optional: Link policy to a specific airline
    policyType?: PolicyType;
}

// Country Information
export interface CountryInfo {
    id: string; // 2-letter ISO code
    name: LocalizedName;
    dialingCode: string; // e.g., '+98'
}


// Permissions and Activity Log
export enum Permission {
  VIEW_STATS = 'VIEW_STATS',
  CREATE_FLIGHTS = 'CREATE_FLIGHTS',
  EDIT_FLIGHTS = 'EDIT_FLIGHTS',
  DELETE_FLIGHTS = 'DELETE_FLIGHTS',
  MANAGE_BOOKINGS = 'MANAGE_BOOKINGS',
  MANAGE_REFUNDS = 'MANAGE_REFUNDS',
  MANAGE_TICKETS = 'MANAGE_TICKETS',
  MANAGE_USERS = 'MANAGE_USERS',
  EDIT_USER_ROLE = 'EDIT_USER_ROLE',
  MANAGE_BASIC_DATA = 'MANAGE_BASIC_DATA',
  MANAGE_COMMISSION_MODELS = 'MANAGE_COMMISSION_MODELS',
  VIEW_ACTIVITY_LOG = 'VIEW_ACTIVITY_LOG',
  MANAGE_ACCOUNTING = 'MANAGE_ACCOUNTING',
  MANAGE_RATE_LIMITS = 'MANAGE_RATE_LIMITS',
  MANAGE_CONTENT = 'MANAGE_CONTENT',
  MANAGE_ADS = 'MANAGE_ADS',
  MANAGE_TENANTS = 'MANAGE_TENANTS',
  MANAGE_TELEGRAM_BOT = 'MANAGE_TELEGRAM_BOT',
  MANAGE_WHATSAPP_BOT = 'MANAGE_WHATSAPP_BOT',
  // Affiliate Permissions
  CREATE_OWN_FLIGHTS = 'CREATE_OWN_FLIGHTS',
  EDIT_OWN_FLIGHTS = 'EDIT_OWN_FLIGHTS',
  DELETE_OWN_FLIGHTS = 'DELETE_OWN_FLIGHTS',
  VIEW_OWN_BOOKINGS = 'VIEW_OWN_BOOKINGS',
  VIEW_OWN_ACCOUNTING = 'VIEW_OWN_ACCOUNTING',
}

export type RolePermissions = Record<UserRole, Permission[]>;

export interface ActivityLog {
  id: string;
  user: {
    id: string;
    name: string;
  };
  action: string;
  timestamp: string;
}

// Accounting System Types
export enum AccountType {
    Asset = 'Asset', // دارایی
    Liability = 'Liability', // بدهی
    Equity = 'Equity', // حقوق صاحبان سهام
    Revenue = 'Revenue', // درآمد
    Expense = 'Expense', // هزینه
}

export interface Account {
    id: string; // e.g., '1010'
    name: LocalizedName; // e.g., 'Cash'
    type: AccountType;
    parent: string | null; // ID of parent account for hierarchy
    isParent: boolean;
}

export interface Transaction {
    accountId: string;
    debit: number; // بدهکار
    credit: number; // بستانکار
}

export interface JournalEntry {
    id: string;
    date: string;
    description: string;
    transactions: Transaction[];
    userId?: string; // Link to user for customer-specific reports
}

export interface Expense {
    id: string;
    date: string;
    description: string;
    amount: number;
    expenseAccountId: string; // Links to an expense account in CoA
}

// Wallet System Types
export type Currency = string; // e.g., 'IRR', 'USD'

export interface CurrencyInfo {
    id: string;
    name: LocalizedName;
    code: Currency;
    symbol: LocalizedName;
    isActive: boolean;
    rateToUsd: number;
}

export interface WalletTransaction {
    id: string;
    date: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'BOOKING_PAYMENT' | 'REFUND' | 'COMMISSION_PAYOUT';
    amount: number;
    currency: Currency;
    description: string;
}

export interface WalletBalance {
    balance: number;
    currency: Currency;
    transactions: WalletTransaction[];
}

export interface Wallet {
    [key: Currency]: WalletBalance;
}

// Commission Models
export enum CommissionCalculationType {
    Percentage = 'PERCENTAGE',
    FixedAmount = 'FIXED_AMOUNT',
}

export interface CommissionModel {
    id: string;
    name: LocalizedName;
    calculationType: CommissionCalculationType;
    charterCommission: number;
    creatorCommission: number;
    webServiceCommission: number;
}

// Rate Limiting
export interface RateLimit {
    id: string;
    fromCity: string;
    toCity: string;
    maxPrice: number; // The maximum total price (base + taxes) allowed
}

// Refund System
export type RefundStatus =
  | 'PENDING_EXPERT_REVIEW'
  | 'PENDING_FINANCIAL_REVIEW'
  | 'PENDING_PAYMENT'
  | 'COMPLETED'
  | 'REJECTED';


export interface Refund {
    id: string;
    bookingId: string;
    userId: string;
    requestDate: string;
    status: RefundStatus;
    originalAmount: number;
    penaltyAmount: number;
    refundAmount: number;
    
    // History Tracking
    expertReviewerName?: string;
    expertReviewDate?: string;
    financialReviewerName?: string;
    financialReviewDate?: string;
    paymentProcessorName?: string;
    paymentDate?: string;
    
    rejecterName?: string;
    rejectionDate?: string;
    rejectionReason?: string;
}


// Site Content Management
export interface FooterLink {
    id: string;
    text: LocalizedName;
    url: string; // can be internal like '/about' or external like 'https://example.com'
}

export interface FooterColumn {
    id: string;
    title: LocalizedName;
    links: FooterLink[];
}

export interface PopularDestination {
    id: string;
    name: LocalizedName;
    imageUrl: string;
}

export interface SiteContent {
    home: {
        heroImageUrl: string;
        popularDestinations: {
            title: LocalizedName;
            subtitle: LocalizedName;
            destinations: PopularDestination[];
        };
    };
    about: {
        title: LocalizedName;
        body: LocalizedName;
        imageUrl: string;
    };
    contact: {
        title: LocalizedName;
        body: LocalizedName;
        address: LocalizedName;
        phone: string;
        email: string;
        mapImageUrl: string;
    };
    footer: {
        description: LocalizedName;
        columns: FooterColumn[];
    }
}

// Advertisement System
export enum AdPlacement {
    SEARCH_RESULTS_TOP = 'SEARCH_RESULTS_TOP',
    SIDEBAR_BOTTOM = 'SIDEBAR_BOTTOM',
}

export interface Advertisement {
    id: string;
    title: string; // For internal reference in the admin panel
    imageUrl: string;
    linkUrl: string;
    placement: AdPlacement;
    isActive: boolean;
}

// --- Multi-tenancy ---
export type TenantStatus = 'ACTIVE' | 'INACTIVE';

export interface Tenant {
    id: string;
    name: string;
    logoUrl: string;
    primaryColor: string; // hex code
    status: TenantStatus;
}

// --- Integrations ---
export interface TelegramBotConfig {
  isEnabled: boolean;
  botToken: string;
  chatId: string;
  notifyOn: {
    newBooking: boolean;
    bookingCancellation: boolean;
    refundUpdate: boolean;
    newUser: boolean;
    newTicket: boolean;
  };
}

export interface WhatsAppBotConfig {
  isEnabled: boolean;
  apiKey: string;
  phoneNumberId: string;
  notifyOn: {
    bookingSuccess: boolean;
    flightChange: boolean;
  };
}
