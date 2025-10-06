export type Language = 'en' | 'fa' | 'ar';

export interface LocalizedName {
    ar: string;
    fa: string;
    en: string;
}

export enum TripType {
    OneWay = 'OneWay',
    RoundTrip = 'RoundTrip',
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

export enum FlightStatus {
    ON_TIME = 'ON_TIME',
    CLOSE = 'CLOSE',
    WAITING_FOR_COMMAND = 'WAITING_FOR_COMMAND',
    NO_AVAILABILITY = 'NO_AVAILABILITY',
    CALL_US = 'CALL_US',
    CANCELLED = 'CANCELLED',
}

export enum FlightSourcingType {
    Charter = 'Charter',
    WebService = 'WebService',
    Allotment = 'Allotment',
    Floating = 'FLOATING',
    Manual = 'MANUAL',
}

export interface SeatAllotment {
    id: string;
    agentId: string; // User ID
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
    departureAirport?: FlightEndpoint; // Alternative structure from API
    arrivalAirport?: FlightEndpoint; // Alternative structure from API
    duration: string | number; // Support both string and number formats
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
    allotments: SeatAllotment[];
    tenantId: string;
}

export enum Gender {
    Male = 'Male',
    Female = 'Female',
    Other = 'Other', // In case we need it
}

export enum Nationality {
    Iranian = 'Iranian',
    Foreign = 'Foreign',
}

export interface PassengerDetails {
    nationality: Nationality;
    firstName: string;
    lastName: string;
    gender: Gender | '';
    nationalId?: string;
    passportNumber?: string;
    passportIssuingCountry?: string;
    dateOfBirth?: string;
    passportExpiryDate?: string;
    saveForLater?: boolean;
}

export interface SavedPassenger {
    id: string;
    firstName: string;
    lastName: string;
    nationality: Nationality;
    gender: Gender;
    nationalId?: string;
    passportNumber?: string;
    passportIssuingCountry?: string;
    dateOfBirth?: string;
    passportExpiryDate?: string;
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN', // General Admin role (might not be used explicitly)
    SUPER_ADMIN = 'SUPER_ADMIN',
    EDITOR = 'EDITOR',
    SUPPORT = 'SUPPORT',
    ACCOUNTANT = 'ACCOUNTANT',
    AFFILIATE = 'AFFILIATE',
}

export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    password?: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
    wallet: Wallet;
    canBypassRateLimit: boolean;
    savedPassengers: SavedPassenger[];
    displayCurrencies: Currency[];
    tenantId?: string;
}

export interface Tenant {
    id: string;
    name: string;
    slug: string; // Unique identifier for URL, e.g., 'agency-a'
    contactEmail: string;
    contactPhone: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    logoUrl?: string; // Optional: Tenant-specific logo
    primaryColor?: string; // Optional: Tenant-specific primary color
    theme: string;
    homepageContentId: string;
    supportedLanguages: string;
    supportedCurrencies: string;
    domain?: string;
    subdomain?: string;
    customDomain?: string;
    parentTenantId?: string;
    commissionRate: number;
    commissionAmount?: number;
    commissionType: 'PERCENTAGE' | 'FIXED';
    parentCommissionRate: number;
    parentCommissionAmount?: number;
    parentCommissionType: 'PERCENTAGE' | 'FIXED';
    isWhiteLabel: boolean;
    pricingType: 'GROSS' | 'NET';
    customBranding?: any;
    footerText?: string;
    supportEmail?: string;
    supportPhone?: string;
    parentTenant?: Tenant;
    subTenants?: Tenant[];
    users?: User[];
    bookings?: Booking[];
    _count?: {
        users: number;
        bookings: number;
        subTenants: number;
    };
}

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED',
    COMPLETED = 'COMPLETED', // After flight has departed
}

export interface Booking {
    id: string;
    user: User;
    flight: Flight;
    passengers: {
        adults: PassengerDetails[];
        children: PassengerDetails[];
        infants: PassengerDetails[];
    };
    passengersInfo?: PassengerDetails[]; // Alternative structure from API
    passengersData?: string; // JSON string structure from API
    contactEmail: string;
    contactPhone: string;
    query: SearchQuery;
    bookingDate: string;
    status: BookingStatus;
    cancellationDate?: string;
    purchasePrice?: number; // Cost of acquiring the ticket for manual bookings
    buyerReference?: string;
    notes?: string;
    tenantId: string;
    source?: string; // API source: manual, charter118, sepehr, etc.
}

export enum TicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    CLOSED = 'CLOSED',
    PENDING_CUSTOMER = 'PENDING_CUSTOMER',
    WAITING_FOR_SUPPORT = 'WAITING_FOR_SUPPORT',
    RESPONDED = 'RESPONDED',
    COMPLETED = 'COMPLETED',
}

export enum TicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

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
    id: string;
    iata: string;
    name: LocalizedName;
    city: LocalizedName;
    country: LocalizedName;
    icao?: string;
}

export interface RefundPolicyRule {
    id: string;
    hoursBeforeDeparture: number;
    penaltyPercentage: number;
}

export enum PolicyType {
    Domestic = 'Domestic',
    International = 'International',
    Charter = 'Charter',
}

export interface RefundPolicy {
    id: string;
    name: LocalizedName;
    rules: RefundPolicyRule[];
    airlineId?: string; // Optional: Link policy to a specific airline
    policyType?: PolicyType;
}

export interface CountryInfo {
    id: string; // ISO 3166-1 alpha-2 code, e.g., "IR"
    name: LocalizedName;
    flag?: string; // e.g., "🇮🇷"
    phoneCode: string; // e.g., "+98"
    currency: Currency;
}

export type BasicDataType = 'airline' | 'aircraft' | 'flightClass' | 'airport' | 'commissionModel' | 'currency' | 'refundPolicy' | 'country';

export enum Permission {
    VIEW_STATS = 'VIEW_STATS',
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

    CREATE_FLIGHTS = 'CREATE_FLIGHTS',
    EDIT_FLIGHTS = 'EDIT_FLIGHTS',
    DELETE_FLIGHTS = 'DELETE_FLIGHTS',

    CREATE_OWN_FLIGHTS = 'CREATE_OWN_FLIGHTS',
    EDIT_OWN_FLIGHTS = 'EDIT_OWN_FLIGHTS',
    DELETE_OWN_FLIGHTS = 'DELETE_OWN_FLIGHTS',
    VIEW_OWN_BOOKINGS = 'VIEW_OWN_BOOKINGS',
    VIEW_OWN_ACCOUNTING = 'VIEW_OWN_OWN_ACCOUNTING',
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

export enum AccountType {
    ASSET = 'ASSET',
    LIABILITY = 'LIABILITY',
    EQUITY = 'EQUITY',
    REVENUE = 'REVENUE',
    EXPENSE = 'EXPENSE',
}

export interface Account {
    id: string; // e.g., '1010'
    name: LocalizedName; // e.g., 'Cash'
    code?: string; // e.g., '1010'
    type: AccountType;
    parent: string | null; // ID of parent account for hierarchy
    isParent: boolean;
    balance?: number; // Current balance of the account
    currency?: Currency; // Currency of the account
}

export interface Transaction {
    accountId: string;
    debit: number; // For debit entries
    credit: number; // For credit entries
}

export interface JournalEntry {
    id: string;
    date: string;
    description: string;
    transactions: Transaction[];
    userId?: string; // Link to user for customer-specific reports
    bookingId?: string; // Optional, link to booking if applicable
}

export interface Expense {
    id: string;
    date: string;
    description: string;
    amount: number;
    currency: Currency;
    accountId: string; // The account from which the expense is paid
    recordedByUserId: string;
}

export type Currency = string; // e.g., 'IRR', 'USD'

export interface CurrencyInfo {
    id: string;
    name: LocalizedName;
    code: Currency;
    symbol: string;
    exchangeRateToUSD: number;
    isBaseCurrency: boolean;
    isActive: boolean;
}

export interface WalletTransaction {
    id: string;
    date: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'BOOKING_PAYMENT' | 'REFUND' | 'COMMISSION_PAYOUT';
    amount: number;
    currency: Currency;
    description: string;
    relatedBookingId?: string;
    relatedUserId?: string;
}

export interface WalletBalance {
    balance: number;
    currency: Currency;
    transactions: WalletTransaction[];
}

export interface Wallet {
    [key: Currency]: WalletBalance;
}

export enum CommissionCalculationType {
    Percentage = 'Percentage',
    FixedAmount = 'FixedAmount',
}

export interface CommissionModel {
    id: string;
    name: LocalizedName;
    calculationType: CommissionCalculationType;
    charterCommission: number; // For charter flights
    creatorCommission: number; // For flights created by affiliates/editors
    webServiceCommission: number; // For flights fetched from web services
}

export interface RateLimit {
    id: string;
    fromCity: string;
    toCity: string;
    maxPrice: number; // The maximum total price (base + taxes) allowed
}

export enum RefundStatus {
    PENDING_EXPERT_REVIEW = 'PENDING_EXPERT_REVIEW',
    PENDING_FINANCIAL_REVIEW = 'PENDING_FINANCIAL_REVIEW',
    PENDING_PAYMENT = 'PENDING_PAYMENT',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
}

export interface Refund {
    id: string;
    bookingId: string;
    userId: string;
    requestDate: string;
    status: RefundStatus;
    originalAmount: number;
    penaltyAmount: number;
    refundAmount: number;

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

export enum AdPlacement {
    SEARCH_RESULTS_TOP = 'SEARCH_RESULTS_TOP',
    SEARCH_RESULTS_BOTTOM = 'SEARCH_RESULTS_BOTTOM',
    SIDEBAR_TOP = 'SIDEBAR_TOP',
    SIDEBAR_BOTTOM = 'SIDEBAR_BOTTOM',
    HOMEPAGE_BANNER = 'HOMEPAGE_BANNER',
}

export interface Advertisement {
    id: string;
    title: string; // For internal reference in the admin panel
    description?: string;
    imageUrl: string;
    linkUrl?: string;
    backgroundColor?: string;
    textColor?: string;
    placement: AdPlacement;
    position?: 'flight-results' | 'homepage' | 'sidebar';
    priority?: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface SiteContent {
    home: {
        heroImageUrl: string;
        popularDestinations: {
            title: LocalizedName;
            subtitle: LocalizedName;
            destinations: {
                id: string;
                name: LocalizedName;
                imageUrl: string;
            }[];
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
        columns: {
            id: string;
            title: LocalizedName;
            links: {
                id: string;
                text: LocalizedName;
                url: string;
            }[];
        }[];
    };
}

export type PassengerData = {
    adults: PassengerDetails[];
    children: PassengerDetails[];
    infants: PassengerDetails[];
    contactEmail: string;
    contactPhone: string;
};

export type View = 'SEARCH' | 'SEARCH_RESULTS' | 'PASSENGER_DETAILS' | 'REVIEW' | 'CONFIRMATION' | 'LOGIN' | 'SIGNUP' | 'PROFILE' | 'ADMIN_LOGIN' | 'ABOUT' | 'CONTACT' | 'CURRENCY_CONVERTER' | 'SIMPLE_TEST' | 'SEPEHR_SEARCH_RESULTS' | 'SEPEHR_BOOKING' | 'SEPEHR_BOOKING_CONFIRMATION';

export interface TelegramBotConfig {
    isEnabled: boolean;
    apiKey: string;
    chatId: string;
    notifyOn: {
        bookingSuccess: boolean;
        flightChange: boolean;
        newUser: boolean;
        newBooking: boolean;
        refundUpdate: boolean;
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

export interface LoginPayload {
    email: string;
    password: string;
}

export interface SignupPayload {
    name: string;
    username: string;
    email: string;
    password: string;
    phone: string;
}

export interface UpdateProfilePayload {
    name?: string;
    currentPassword?: string;
    newPassword?: string;
}

export interface AddSavedPassengerPayload extends Omit<SavedPassenger, 'id'> {}

export interface UpdateSavedPassengerPayload extends SavedPassenger {}

export interface UpdateUserPayload {
    name?: string;
    role?: UserRole;
    status?: UserStatus;
    canBypassRateLimit?: boolean;
    displayCurrencies?: Currency[];
    tenantId?: string;
}

export interface CreateExpensePayload {
    date: string;
    description: string;
    amount: number;
    currency: Currency;
    accountId: string;
}

export interface UpdateTenantPayload {
    name?: string;
    slug?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive?: boolean;
    settings?: {
        theme?: string;
        logoUrl?: string;
        homepageContentId?: string;
        supportedLanguages?: Language[];
        supportedCurrencies?: Currency[];
    };
}

export interface CreateTenantPayload extends Omit<Tenant, 'id' | 'createdAt'> {}

export interface ChargeWalletPayload {
    amount: number;
    currency: Currency;
    description: string;
}

export interface ApiResponse<T = any> {
    data: T | null;
    success: boolean;
    message?: string;
    error?: string;
}

export interface AdminStats {
    totalUsers: number;
    totalFlights: number;
    totalBookings: number;
    pendingRefunds: number;
    openTickets: number;
    totalRevenue: number;
    totalExpenses: number;
    profit: number;
}

