

import React, { useState, useCallback, useMemo } from 'react';
import { FlightSearchForm } from './components/FlightSearchForm';
import { SearchResults } from './components/SearchResults';
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { PassengerDetailsForm } from './components/PassengerDetailsForm';
import { BookingReview } from './components/BookingReview';
import { BookingStepper } from './components/BookingStepper';
import type { Flight, SearchQuery, PassengerDetails, User, Booking, Ticket, TicketMessage, UserRole, UserStatus, AirlineInfo, AircraftInfo, FlightClassInfo, ActivityLog, AirportInfo, Account, JournalEntry, Expense, Transaction, Wallet, WalletTransaction, Currency, CommissionModel, RateLimit, BookingStatus, CurrencyInfo, RefundPolicy, SavedPassenger, SiteContent, Refund, Advertisement, RolePermissions, Tenant } from './types';
import { TripType, Nationality, Gender, FlightSourcingType, CommissionCalculationType, AdPlacement } from './types';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { ProfilePage } from './components/ProfilePage';
import { Footer } from './components/Footer';
import { DashboardPage } from './components/DashboardPage';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { initialAirports } from './data/airports';
import { initialChartOfAccounts } from './data/accounting';
import { initialCommissionModels } from './data/commissionModels';
import { useLocalization } from './hooks/useLocalization';
import { generateFlights } from './services/geminiService';
import { FilterSidebar, type Filters } from './components/FilterSidebar';
import { initialCurrencies } from './data/currencies';
import { initialRefundPolicies } from './data/refundPolicies';
import { WhyChooseUs } from './components/WhyChooseUs';
import { PopularDestinations } from './components/PopularDestinations';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { initialRolePermissions } from './data/permissions';
import { initialTenants } from './data/tenants';


type View = 'SEARCH' | 'PASSENGER_DETAILS' | 'REVIEW' | 'LOGIN' | 'SIGNUP' | 'PROFILE' | 'ADMIN_LOGIN' | 'ABOUT' | 'CONTACT';

export type PassengerData = {
    adults: PassengerDetails[];
    children: PassengerDetails[];
    infants: PassengerDetails[];
    contactEmail: string;
    contactPhone: string;
};

const createInitialWallet = (activeCurrencies: CurrencyInfo[]) => {
    const wallet: Wallet = {};
    activeCurrencies.forEach(currency => {
        wallet[currency.code] = { balance: 0, currency: currency.code, transactions: [] };
    });
    // Add some initial balance for mock users
    if (wallet['IRR']) wallet['IRR'].balance = 10000000;
    if (wallet['USD']) wallet['USD'].balance = 500;
    if (wallet['IQD']) wallet['IQD'].balance = 250000;
    return wallet;
};

const activeCurrenciesForMock = initialCurrencies.filter(c => c.isActive);

// --- MOCK DATA ---
const initialUsersData: Omit<User, 'wallet'>[] = [
    { 
      id: 'admin1', 
      name: 'Super Admin', 
      username: 'superadmin',
      email: 'admin@example.com',
      password: 'password',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      canBypassRateLimit: true,
      // No tenantId for Super Admin
    },
    { 
      id: 'editor1', 
      name: 'Ali Editor', 
      username: 'editorali',
      email: 'editor@example.com',
      password: 'password',
      role: 'EDITOR',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      canBypassRateLimit: false,
      tenantId: 'tenant-1',
    },
    { 
      id: 'support1', 
      name: 'Zahra Support', 
      username: 'supportzahra',
      email: 'support@example.com',
      password: 'password',
      role: 'SUPPORT',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      canBypassRateLimit: false,
      tenantId: 'tenant-1',
    },
     { 
      id: 'affiliate1', 
      name: 'Tehran Agency', 
      username: 'aff_tehran',
      email: 'affiliate@example.com',
      password: 'password',
      role: 'AFFILIATE',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      canBypassRateLimit: false,
      tenantId: 'tenant-1',
    },
    { 
      id: 'accountant1', 
      name: 'Reza Accountant', 
      username: 'accountantreza',
      email: 'accountant@example.com',
      password: 'password',
      role: 'ACCOUNTANT',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
      canBypassRateLimit: false,
      tenantId: 'tenant-2',
    },
    { 
      id: 'user123', 
      name: 'Test User', 
      username: 'testuser',
      email: 'user@example.com',
      password: 'password',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      canBypassRateLimit: false,
      displayCurrencies: ['USD'],
      savedPassengers: [
          { id: 'sp-1', firstName: 'John', lastName: 'Doe', nationality: Nationality.Foreign, gender: Gender.Male, passportNumber: 'A123' },
          { id: 'sp-2', firstName: 'Jane', lastName: 'Doe', nationality: Nationality.Foreign, gender: Gender.Female, passportNumber: 'B456' },
      ],
      tenantId: 'tenant-1', // Users are associated with the tenant they signed up on
    },
    { 
      id: 'user456', 
      name: 'Maryam Rezaei', 
      username: 'maryam_r',
      email: 'maryam@example.com',
      password: 'password',
      role: 'USER',
      status: 'SUSPENDED',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      canBypassRateLimit: false,
      savedPassengers: [],
      tenantId: 'tenant-2',
    },
];

const initialUsersWithWallets: User[] = initialUsersData.map(user => ({
    ...user,
    wallet: createInitialWallet(activeCurrenciesForMock),
    savedPassengers: user.savedPassengers || [],
    displayCurrencies: user.displayCurrencies || [],
}));

const mockFlight: Flight = {
    id: 'FL-MOCK-01',
    airline: 'Iran Air',
    airlineLogoUrl: 'https://i.pravatar.cc/40?u=iranair',
    flightNumber: 'IR-452',
    departure: { airportCode: 'IKA', airportName: 'Imam Khomeini International Airport', city: 'Tehran', dateTime: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString() },
    arrival: { airportCode: 'IST', airportName: 'Istanbul Airport', city: 'Istanbul', dateTime: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString() },
    duration: '3h 30m',
    stops: 0,
    price: 35000000,
    taxes: 4500000,
    flightClass: 'Economy',
    aircraft: 'Airbus A320',
    availableSeats: 12,
    totalCapacity: 180,
    baggageAllowance: '20 kg',
    status: 'SCHEDULED',
    bookingClosesBeforeDepartureHours: 3,
    sourcingType: FlightSourcingType.Charter,
    commissionModelId: 'CM-1',
    refundPolicyId: 'RP-1',
    creatorId: 'affiliate1', // Created by affiliate
    tenantId: 'tenant-1',
    allotments: []
};

const anotherMockFlight: Flight = {
    id: 'FL-MOCK-02',
    airline: 'Mahan Air',
    airlineLogoUrl: 'https://i.pravatar.cc/40?u=mahan',
    flightNumber: 'W5-110',
    departure: { airportCode: 'IKA', airportName: 'Imam Khomeini International Airport', city: 'Tehran', dateTime: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString() },
    arrival: { airportCode: 'DXB', airportName: 'Dubai International Airport', city: 'Dubai', dateTime: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString() },
    duration: '2h 0m',
    stops: 0,
    price: 42000000,
    taxes: 5500000,
    flightClass: 'Business',
    aircraft: 'Boeing 737',
    availableSeats: 8,
    totalCapacity: 189,
    baggageAllowance: '30 kg',
    status: 'SCHEDULED',
    bookingClosesBeforeDepartureHours: 3,
    sourcingType: FlightSourcingType.WebService,
    commissionModelId: 'CM-2',
    refundPolicyId: 'RP-2',
    creatorId: 'editor1',
    tenantId: 'tenant-1',
    allotments: []
};

const initialBookings: Booking[] = [
    {
        id: 'BK16252435123',
        user: initialUsersWithWallets.find(u => u.username === 'testuser')!,
        flight: mockFlight,
        passengers: { adults: [{ firstName: 'Test', lastName: 'User', nationality: Nationality.Iranian, gender: Gender.Male, nationalId: '1234567890' }], children: [], infants: [] },
        contactEmail: 'user@example.com',
        contactPhone: '09123456789',
        query: { tripType: TripType.OneWay, from: 'Tehran', to: 'Istanbul', departureDate: '2024-07-20', passengers: { adults: 1, children: 0, infants: 0 } },
        bookingDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'CONFIRMED',
        tenantId: 'tenant-1',
    },
    {
        id: 'BK16252435456',
        user: initialUsersWithWallets.find(u => u.username === 'maryam_r')!,
        flight: { ...anotherMockFlight, id: 'FL-MOCK-03', departure: { ...anotherMockFlight.departure, city: 'Mashhad' }, arrival: { ...anotherMockFlight.arrival, city: 'Tehran' } },
        passengers: { adults: [{ firstName: 'Maryam', lastName: 'Rezaei', nationality: Nationality.Iranian, gender: Gender.Female, nationalId: '0987654321' }], children: [], infants: [] },
        contactEmail: 'maryam@example.com',
        contactPhone: '09351234567',
        query: { tripType: TripType.OneWay, from: 'Mashhad', to: 'Tehran', departureDate: '2024-07-22', passengers: { adults: 1, children: 0, infants: 0 } },
        bookingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'CANCELLED',
        tenantId: 'tenant-2',
    },
    {
        id: 'BKPAST001',
        user: initialUsersWithWallets.find(u => u.username === 'testuser')!,
        flight: {...mockFlight, id: 'FL-PAST-01', departure: {...mockFlight.departure, dateTime: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()}, arrival: {...mockFlight.arrival, dateTime: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()}},
        passengers: { adults: [{ firstName: 'Test', lastName: 'User', nationality: Nationality.Iranian, gender: Gender.Male, nationalId: '1234567890' }], children: [], infants: [] },
        contactEmail: 'user@example.com',
        contactPhone: '09123456789',
        query: { tripType: TripType.OneWay, from: 'Tehran', to: 'Istanbul', departureDate: '2024-06-20', passengers: { adults: 1, children: 0, infants: 0 } },
        bookingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'CONFIRMED',
        tenantId: 'tenant-1',
    }
];

const initialRefunds: Refund[] = [
    {
        id: 'REF-001',
        bookingId: 'BK16252435456',
        userId: 'user456',
        requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDING_EXPERT_REVIEW',
        originalAmount: 47500000,
        penaltyAmount: 4750000,
        refundAmount: 42750000,
    }
];

const initialAirlines: AirlineInfo[] = [
    { id: 'airline-1', name: { ar: 'إيران للطيران', fa: 'ایران ایر', en: 'Iran Air' }, logoUrl: 'https://i.pravatar.cc/40?u=iranair' },
    { id: 'airline-2', name: { ar: 'ماهان للطيران', fa: 'ماهان ایر', en: 'Mahan Air' }, logoUrl: 'https://i.pravatar.cc/40?u=mahan' },
    { id: 'airline-3', name: { ar: 'الخطوط التركية', fa: 'ترکیش ایرلاینز', en: 'Turkish Airlines' }, logoUrl: 'https://i.pravatar.cc/40?u=turkish' },
];

const initialAircrafts: AircraftInfo[] = [
    { id: 'ac-1', name: { ar: 'إيرباص A320', fa: 'ایرباس A320', en: 'Airbus A320' }, capacity: 180 },
    { id: 'ac-2', name: { ar: 'بوينغ 737', fa: 'بوئینگ 737', en: 'Boeing 737' }, capacity: 189 },
    { id: 'ac-3', name: { ar: 'بوينغ 777', fa: 'بوئینگ 777', en: 'Boeing 777' }, capacity: 396 },
];

const initialFlightClasses: FlightClassInfo[] = [
    { id: 'fc-1', name: { ar: 'اقتصادي', fa: 'اکونومی', en: 'Economy' } },
    { id: 'fc-2', name: { ar: 'رجال أعمال', fa: 'بیزنس', en: 'Business' } },
    { id: 'fc-3', name: { ar: 'درجة أولى', fa: 'فرست کلاس', en: 'First Class' } },
];

const initialRateLimits: RateLimit[] = [
    { id: 'RL-1', fromCity: 'تهران', toCity: 'استانبول', maxPrice: 40000000 },
    { id: 'RL-2', fromCity: 'تهران', toCity: 'دبی', maxPrice: 45000000 },
];

const initialSiteContent: SiteContent = {
    home: {
        heroImageUrl: 'https://images.unsplash.com/photo-1542296332-9e69c2627964?q=80&w=2670&auto=format&fit=crop&ixlib-rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        popularDestinations: {
            title: {
                fa: 'مقصدهای محبوب',
                ar: 'وجهات شهيرة',
                en: 'Popular Destinations',
            },
            subtitle: {
                fa: 'مکان‌هایی را که مشتریان ما دوست دارند به آنجا سفر کنند، کشف کنید.',
                ar: 'اكتشف الأماكن التي يحب عملاؤنا السفر إليها.',
                en: 'Discover places our customers love to travel to.',
            },
            destinations: [
                { id: 'dest-1', name: { fa: 'استانبول', ar: 'إسطنبول', en: 'Istanbul' }, imageUrl: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?q=80&w=2596&auto=format&fit=crop&ixlib-rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
                { id: 'dest-2', name: { fa: 'دبی', ar: 'دبي', en: 'Dubai' }, imageUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=2574&auto=format&fit=crop&ixlib-rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
                { id: 'dest-3', name: { fa: 'پاریس', ar: 'باريس', en: 'Paris' }, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760c0341?q=80&w=2670&auto=format&fit=crop&ixlib-rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
                { id: 'dest-4', name: { fa: 'تهران', ar: 'طهران', en: 'Tehran' }, imageUrl: 'https://images.unsplash.com/photo-1549915239-a687f6a27a69?q=80&w=2535&auto=format&fit=crop&ixlib-rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
            ]
        }
    },
    about: {
        title: {
            fa: 'درباره ما',
            ar: 'معلومات عنا',
            en: 'About Us',
        },
        body: {
            fa: 'پرواز هوشمند یک پلتفرم پیشرو برای رزرو بلیط هواپیما است که با استفاده از هوش مصنوعی، بهترین گزینه‌ها را به شما پیشنهاد می‌دهد. ما به ارائه تجربه‌ای بی‌نظیر، سریع و امن برای مسافران خود متعهد هستیم.',
            ar: 'الطيران الذكي هي منصة رائدة لحجز تذاكر الطيران تستخدم الذكاء الاصطناعي لتقديم أفضل الخيارات لك. نحن ملتزمون بتقديم تجربة فريدة وسريعة وآمنة لمسافرينا.',
            en: 'Smart Flight is a leading platform for booking airline tickets, using artificial intelligence to suggest the best options for you. We are committed to providing a unique, fast, and secure experience for our travelers.',
        },
        imageUrl: 'https://images.unsplash.com/photo-1544038221-99c7defddf03?q=80&w=2574&auto=format&fit=crop',
    },
    contact: {
        title: {
            fa: 'تماس با ما',
            ar: 'اتصل بنا',
            en: 'Contact Us',
        },
        body: {
            fa: 'ما همیشه آماده پاسخگویی به سوالات شما هستیم. می‌توانید از طریق راه‌های زیر با ما در ارتباط باشید یا فرم تماس را پر کنید.',
            ar: 'نحن دائما على استعداد للإجابة على أسئلتك. يمكنك التواصل معنا عبر الطرق التالية أو ملء نموذج الاتصال.',
            en: 'We are always ready to answer your questions. You can contact us through the following ways or fill out the contact form.',
        },
        address: {
            fa: 'تهران، خیابان آزادی، پلاک ۱۲۳',
            ar: 'طهران، شارع آزادي، رقم 123',
            en: 'Tehran, Azadi St, No. 123',
        },
        phone: '+98 21 1234 5678',
        email: 'support@smartflight.com',
        mapImageUrl: 'https://i.stack.imgur.com/3Y2V6.png',
    },
    footer: {
        description: {
            fa: 'یک پلتفرم مدرن برای رزرو بلیط هواپیما، طراحی شده برای ارائه بهترین تجربه کاربری با استفاده از هوش مصنوعی برای یافتن پروازهای ایده‌آل شما.',
            ar: 'منصة حديثة لحجز تذاكر الطيران، مصممة لتقديم أفضل تجربة مستخدم باستخدام الذكاء الاصطناعي للعثور على رحلاتك المثالية.',
            en: 'A modern platform for booking airline tickets, designed to provide the best user experience using artificial intelligence to find your ideal flights.',
        },
        columns: [
            {
                id: 'col-1',
                title: {
                    fa: 'لینک‌های سریع',
                    ar: 'روابط سريعة',
                    en: 'Quick Links',
                },
                links: [
                    { id: 'link-1', text: { fa: 'درباره ما', ar: 'معلومات عنا', en: 'About Us' }, url: '/about' },
                    { id: 'link-2', text: { fa: 'تماس با ما', ar: 'اتصل بنا', en: 'Contact Us' }, url: '/contact' },
                    { id: 'link-3', text: { fa: 'سوالات متداول', ar: 'الأسئلة الشائعة', en: 'FAQ' }, url: '/faq' },
                ]
            }
        ]
    }
};

const initialAdvertisements: Advertisement[] = [
    {
        id: 'ad-1',
        title: 'Top Banner - Summer Sale',
        imageUrl: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=2670&auto=format&fit=crop',
        linkUrl: '#',
        placement: AdPlacement.SEARCH_RESULTS_TOP,
        isActive: true,
    },
    {
        id: 'ad-2',
        title: 'Sidebar - Hotel Deal',
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2670&auto=format&fit=crop',
        linkUrl: '#',
        placement: AdPlacement.SIDEBAR_BOTTOM,
        isActive: true,
    }
];

const initialTickets: Ticket[] = [
    {
        id: 'TKT-001',
        user: initialUsersWithWallets.find(u => u.username === 'testuser')!,
        bookingId: 'BK16252435123',
        subject: 'Request for seat change',
        status: 'OPEN',
        priority: 'MEDIUM',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        messages: [
            {
                id: 'msg-1',
                author: 'USER',
                authorName: 'Test User',
                text: 'Hello, I would like to request a window seat if possible.',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: 'msg-2',
                author: 'ADMIN',
                authorName: 'Zahra Support',
                text: 'We have received your request and will look into it.',
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            }
        ]
    },
    {
        id: 'TKT-002',
        user: initialUsersWithWallets.find(u => u.username === 'maryam_r')!,
        subject: 'Question about baggage allowance',
        status: 'CLOSED',
        priority: 'LOW',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        messages: [
            {
                id: 'msg-3',
                author: 'USER',
                authorName: 'Maryam Rezaei',
                text: 'What is the baggage allowance for flight W5-110?',
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
             {
                id: 'msg-4',
                author: 'ADMIN',
                authorName: 'Zahra Support',
                text: 'The baggage allowance for business class on this route is 30 kg. Your ticket has been updated to reflect this.',
                timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            }
        ]
    }
];

type BasicDataType = 'airline' | 'aircraft' | 'flightClass' | 'airport' | 'commissionModel' | 'currency' | 'refundPolicy';


const App: React.FC = () => {
    const { t, language, formatNumber } = useLocalization();
    const [view, setView] = useState<View>('SEARCH');
    const [isLoading, setIsLoading] = useState(false);
    const [flights, setFlights] = useState<Flight[]>([]); // Search results
    const [allFlights, setAllFlights] = useState<Flight[]>([mockFlight, anotherMockFlight]); // All manageable flights
    const [searchQuery, setSearchQuery] = useState<SearchQuery | null>(null);
    const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
    const [passengersData, setPassengersData] = useState<PassengerData | null>(null);
    const [loginError, setLoginError] = useState<string | null>(null);
    
    // User Management
    const [users, setUsers] = useState<User[]>(initialUsersWithWallets);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Admin Data
    const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [refunds, setRefunds] = useState<Refund[]>(initialRefunds);
    const [advertisements, setAdvertisements] = useState<Advertisement[]>(initialAdvertisements);
    const [rolePermissions, setRolePermissions] = useState<RolePermissions>(initialRolePermissions);
    
    // Basic Data Management State
    const [airlines, setAirlines] = useState<AirlineInfo[]>(initialAirlines);
    const [aircrafts, setAircrafts] = useState<AircraftInfo[]>(initialAircrafts);
    const [flightClasses, setFlightClasses] = useState<FlightClassInfo[]>(initialFlightClasses);
    const [airports, setAirports] = useState<AirportInfo[]>(initialAirports);
    const [commissionModels, setCommissionModels] = useState<CommissionModel[]>(initialCommissionModels);
    const [rateLimits, setRateLimits] = useState<RateLimit[]>(initialRateLimits);
    const [currencies, setCurrencies] = useState<CurrencyInfo[]>(initialCurrencies);
    const [refundPolicies, setRefundPolicies] = useState<RefundPolicy[]>(initialRefundPolicies);
    const [siteContent, setSiteContent] = useState<SiteContent>(initialSiteContent);


    // Accounting State
    const [chartOfAccounts, setChartOfAccounts] = useState<Account[]>(initialChartOfAccounts);
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    // Filtering State
    const [filters, setFilters] = useState<Filters | null>(null);


    const logActivity = useCallback((user: User | null, action: string) => {
        if (!user) return;
        const newLog: ActivityLog = {
            id: `log-${Date.now()}`,
            user: { id: user.id, name: user.name },
            action,
            timestamp: new Date().toISOString(),
        };
        setActivityLogs(prev => [newLog, ...prev]);
    }, []);

    const createBookingJournalEntry = useCallback((booking: Booking, type: 'create' | 'cancel') => {
        const { flight, user } = booking;
        const totalPassengers = booking.passengers.adults.length + booking.passengers.children.length + booking.passengers.infants.length;
        const basePriceTotal = flight.price * totalPassengers;
        const taxesTotal = flight.taxes * totalPassengers;
        const totalPrice = basePriceTotal + taxesTotal;

        let commissionCharterAmount = 0;
        let commissionCreatorAmount = 0;
        let commissionWebServiceAmount = 0;

        const model = commissionModels.find(m => m.id === flight.commissionModelId);

        if (model) {
            if (model.calculationType === CommissionCalculationType.Percentage) {
                commissionCharterAmount = basePriceTotal * (model.charterCommission / 100);
                commissionCreatorAmount = basePriceTotal * (model.creatorCommission / 100);
                commissionWebServiceAmount = basePriceTotal * (model.webServiceCommission / 100);
            } else if (model.calculationType === CommissionCalculationType.FixedAmount) {
                commissionCharterAmount = model.charterCommission * totalPassengers;
                commissionCreatorAmount = model.creatorCommission * totalPassengers;
                commissionWebServiceAmount = model.webServiceCommission * totalPassengers;
            }
        }
        
        const netRevenue = basePriceTotal - commissionCharterAmount - commissionCreatorAmount - commissionWebServiceAmount;

        const description = type === 'create'
            ? `${t('accounting.journal.bookingCreation', booking.id, flight.flightNumber, user.name)}`
            : `${t('accounting.journal.bookingCancellation', booking.id, flight.flightNumber, user.name)}`;

        const transactions: Transaction[] = type === 'create' ? [
            { accountId: '1020', debit: totalPrice, credit: 0 },
            { accountId: '2040', debit: 0, credit: commissionCharterAmount },
            { accountId: '2050', debit: 0, credit: commissionCreatorAmount },
            { accountId: '4012', debit: 0, credit: commissionWebServiceAmount },
            { accountId: '4011', debit: 0, credit: netRevenue },
            { accountId: '2020', debit: 0, credit: taxesTotal },
        ] : [
            { accountId: '2040', debit: commissionCharterAmount, credit: 0 },
            { accountId: '2050', debit: commissionCreatorAmount, credit: 0 },
            { accountId: '4012', debit: commissionWebServiceAmount, credit: 0 },
            { accountId: '4011', debit: netRevenue, credit: 0 },
            { accountId: '2020', debit: taxesTotal, credit: 0 },
            { accountId: '1020', debit: 0, credit: totalPrice },
        ];

        const newEntry: JournalEntry = {
            id: `JE-${Date.now()}`,
            date: new Date().toISOString(),
            description,
            transactions,
            userId: booking.user.id,
        };
        setJournalEntries(prev => [newEntry, ...prev]);
    }, [commissionModels, t]);

    const handleUpdateRefund = useCallback((refundId: string, action: 'expert_approve' | 'financial_approve' | 'process_payment' | 'reject', reason?: string) => {
        if (!currentUser) return;
        
        const refundIndex = refunds.findIndex(r => r.id === refundId);
        if (refundIndex === -1) return;

        const updatedRefunds = [...refunds];
        const refund = { ...updatedRefunds[refundIndex] };
        const now = new Date().toISOString();
        const adminName = currentUser.name;

        switch (action) {
            case 'expert_approve':
                if (refund.status === 'PENDING_EXPERT_REVIEW') {
                    refund.status = 'PENDING_FINANCIAL_REVIEW';
                    refund.expertReviewerName = adminName;
                    refund.expertReviewDate = now;
                    logActivity(currentUser, t('activityLog.refundAdvanced', refund.bookingId, t('dashboard.refunds.statusValues.PENDING_FINANCIAL_REVIEW')));
                }
                break;
            case 'financial_approve':
                if (refund.status === 'PENDING_FINANCIAL_REVIEW') {
                    refund.status = 'PENDING_PAYMENT';
                    refund.financialReviewerName = adminName;
                    refund.financialReviewDate = now;
                    logActivity(currentUser, t('activityLog.refundAdvanced', refund.bookingId, t('dashboard.refunds.statusValues.PENDING_PAYMENT')));
                }
                break;
            case 'process_payment':
                if (refund.status === 'PENDING_PAYMENT') {
                    const booking = bookings.find(b => b.id === refund.bookingId);
                    if (!booking) return;

                    // 1. Update user's wallet
                    const updatedUsers = users.map(u => {
                        if (u.id === booking.user.id) {
                            const newTransaction: WalletTransaction = {
                                id: `WT-REFUND-${Date.now()}`,
                                date: now,
                                type: 'REFUND',
                                amount: refund.refundAmount,
                                currency: 'IRR',
                                description: t('profile.wallet.refundDescription', booking.id),
                            };
                            const updatedWallet = { ...u.wallet };
                            if (updatedWallet['IRR']) {
                                updatedWallet['IRR'] = {
                                    ...updatedWallet['IRR'],
                                    balance: updatedWallet['IRR'].balance + refund.refundAmount,
                                    transactions: [...updatedWallet['IRR'].transactions, newTransaction],
                                };
                            }
                            return { ...u, wallet: updatedWallet };
                        }
                        return u;
                    });
                    setUsers(updatedUsers);
                    if (currentUser && currentUser.id === booking.user.id) {
                        setCurrentUser(updatedUsers.find(u => u.id === currentUser.id) || null);
                    }
                    
                    // 2. Create reversing journal entry
                    createBookingJournalEntry(booking, 'cancel');
                    
                    // 3. Update booking status
                    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'REFUNDED' } : b));

                    // 4. Update refund status
                    refund.status = 'COMPLETED';
                    refund.paymentProcessorName = adminName;
                    refund.paymentDate = now;
                    logActivity(currentUser, t('activityLog.refundApproved', refund.bookingId, adminName));
                }
                break;
            case 'reject':
                refund.status = 'REJECTED';
                refund.rejectionReason = reason;
                refund.rejecterName = adminName;
                refund.rejectionDate = now;
                logActivity(currentUser, t('activityLog.refundRejected', refund.bookingId, adminName, reason || ''));
                break;
        }

        updatedRefunds[refundIndex] = refund;
        setRefunds(updatedRefunds);

    }, [currentUser, refunds, bookings, users, logActivity, t, createBookingJournalEntry]);

    const handleSearch = useCallback(async (query: SearchQuery) => {
        setIsLoading(true);
        setSearchQuery(query);
        setFlights([]);
        setFilters(null);
        
        const fromCityFa = airports.find(a => a.city[language] === query.from)?.city.fa.toLowerCase();
        const toCityFa = airports.find(a => a.city[language] === query.to)?.city.fa.toLowerCase();
        
        const isMockedRoute = allFlights.some(f => 
            f.departure.city.toLowerCase().includes(fromCityFa || '') && 
            f.arrival.city.toLowerCase().includes(toCityFa || '')
        );

        let results: Flight[] = [];

        if (isMockedRoute) {
            await new Promise(resolve => setTimeout(resolve, 500));
             results = allFlights.filter(flight => {
                const departureDateTime = new Date(flight.departure.dateTime);
                const departureDate = departureDateTime.toISOString().split('T')[0];
                
                const fromCityMatch = flight.departure.city.toLowerCase().includes(fromCityFa || '');
                const toCityMatch = flight.arrival.city.toLowerCase().includes(toCityFa || '');
                const dateMatch = departureDate === query.departureDate;
                const isScheduled = flight.status === 'SCHEDULED';
                
                const now = new Date().getTime();
                const departureTime = departureDateTime.getTime();
                const closeHours = flight.bookingClosesBeforeDepartureHours || 0;
                const bookingCloseTime = departureTime - (closeHours * 60 * 60 * 1000);
                const isBookingOpen = now < bookingCloseTime;

                return fromCityMatch && toCityMatch && dateMatch && isScheduled && isBookingOpen;
            });

        } else {
            try {
                const geminiFlights = await generateFlights(query, language);
                results = geminiFlights.map(f => ({
                    ...f,
                    sourcingType: FlightSourcingType.WebService,
                    status: 'SCHEDULED',
                    bookingClosesBeforeDepartureHours: 3,
                    commissionModelId: 'CM-2', // Default for web service
                    refundPolicyId: 'RP-1', // Default for web service
                }));
            } catch (e) {
                console.error(e);
                alert(t('flightSearch.geminiError'));
                results = [];
            }
        }
        
        const rateLimit = rateLimits.find(
            rl => rl.fromCity.toLowerCase() === fromCityFa && rl.toCity.toLowerCase() === toCityFa
        );

        const filteredByRateLimit = results.filter(flight => {
            if (rateLimit && !currentUser?.canBypassRateLimit) {
                const totalPrice = flight.price + flight.taxes;
                return totalPrice <= rateLimit.maxPrice;
            }
            return true;
        });

        setFlights(filteredByRateLimit);
        setIsLoading(false);
    }, [allFlights, rateLimits, currentUser, language, airports, t]);

    const handleSelectFlight = (flight: Flight) => {
        setSelectedFlight(flight);
        if (currentUser) {
            setView('PASSENGER_DETAILS');
        } else {
            setView('LOGIN');
        }
    };

    const handleBackToSearch = () => {
        setSelectedFlight(null);
        setView('SEARCH');
    };

    const handlePassengerDetailsSubmit = (data: PassengerData) => {
        if (!currentUser) return;
        
        const allNewPassengers = [...data.adults, ...data.children, ...data.infants];
        const passengersToSave = allNewPassengers.filter(p => p.saveForLater && p.firstName && p.lastName && p.gender);

        if (passengersToSave.length > 0) {
            const updatedUsers = users.map(u => {
                if (u.id === currentUser.id) {
                    const existingPassengers = u.savedPassengers || [];
                    const newSavedPassengers = passengersToSave.map(p => {
                        // Create a clean SavedPassenger object
                        const newPassenger: SavedPassenger = {
                            id: `sp-${Date.now()}-${Math.random()}`,
                            firstName: p.firstName,
                            lastName: p.lastName,
                            gender: p.gender as Gender, // We already filtered for valid gender
                            nationality: p.nationality,
                            nationalId: p.nationalId,
                            passportNumber: p.passportNumber,
                            passportIssuingCountry: p.passportIssuingCountry,
                            dateOfBirth: p.dateOfBirth,
                            passportExpiryDate: p.passportExpiryDate,
                        };
                        return newPassenger;
                    });
                    
                    return { ...u, savedPassengers: [...existingPassengers, ...newSavedPassengers] };
                }
                return u;
            });
            setUsers(updatedUsers);
            const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id)!;
            setCurrentUser(updatedCurrentUser);
            logActivity(currentUser, t('activityLog.savedPassengersAdded', passengersToSave.length));
        }

        setPassengersData(data);
        setView('REVIEW');
    };

    const handleBackToPassengerDetails = () => {
        setView('PASSENGER_DETAILS');
    };
    
    const handleConfirmBooking = () => {
        if (!selectedFlight || !passengersData || !searchQuery || !currentUser) {
            alert(t('bookingReview.error'));
            return;
        }

        const totalPassengers = passengersData.adults.length + passengersData.children.length + passengersData.infants.length;
        const totalPrice = (selectedFlight.price + selectedFlight.taxes) * totalPassengers;

        const irrBalance = currentUser.wallet?.IRR?.balance ?? 0;
        if (irrBalance < totalPrice) {
            alert(t('bookingReview.insufficientFundsAlert'));
            return;
        }

        const newBooking: Booking = {
            id: `BK${Date.now()}`,
            user: currentUser,
            flight: selectedFlight,
            passengers: {
                adults: passengersData.adults,
                children: passengersData.children,
                infants: passengersData.infants,
            },
            contactEmail: passengersData.contactEmail,
            contactPhone: passengersData.contactPhone,
            query: searchQuery,
            bookingDate: new Date().toISOString(),
            status: 'CONFIRMED',
            tenantId: selectedFlight.tenantId, // Carry over tenantId
        };
        setBookings(prev => [newBooking, ...prev]);

        let updatedUsers = users.map(u => {
            if (u.id === currentUser.id) {
                 const newTransaction: WalletTransaction = {
                    id: `WT-${Date.now()}`,
                    date: new Date().toISOString(),
                    type: 'BOOKING_PAYMENT',
                    amount: -totalPrice,
                    currency: 'IRR',
                    description: t('profile.wallet.bookingPaymentDescription', selectedFlight.flightNumber),
                };
                const updatedWallet = { ...u.wallet };
                if (updatedWallet['IRR']) {
                    updatedWallet['IRR'] = {
                        ...updatedWallet['IRR'],
                        balance: updatedWallet['IRR'].balance - totalPrice,
                        transactions: [...updatedWallet['IRR'].transactions, newTransaction]
                    };
                }
                return { ...u, wallet: updatedWallet };
            }
            return u;
        });

        // Commission Payout Logic
        if (selectedFlight.creatorId) {
            const flightCreator = users.find(u => u.id === selectedFlight.creatorId);
            const commissionModel = commissionModels.find(m => m.id === selectedFlight.commissionModelId);
            if (flightCreator && commissionModel) {
                const basePriceTotal = selectedFlight.price * totalPassengers;
                let commissionAmount = 0;
                if (commissionModel.calculationType === CommissionCalculationType.Percentage) {
                    commissionAmount = basePriceTotal * (commissionModel.creatorCommission / 100);
                } else {
                    commissionAmount = commissionModel.creatorCommission * totalPassengers;
                }
                
                if (commissionAmount > 0) {
                     updatedUsers = updatedUsers.map(u => {
                        if (u.id === flightCreator.id) {
                            const commissionTransaction: WalletTransaction = {
                                id: `WT-COMM-${Date.now()}`,
                                date: new Date().toISOString(),
                                type: 'COMMISSION_PAYOUT',
                                amount: commissionAmount,
                                currency: 'IRR',
                                description: t('affiliate.commissionPayoutDescription', newBooking.id, newBooking.flight.flightNumber),
                            };
                            const updatedWallet = { ...u.wallet };
                            if (updatedWallet['IRR']) {
                                updatedWallet['IRR'] = {
                                    ...updatedWallet['IRR'],
                                    balance: updatedWallet['IRR'].balance + commissionAmount,
                                    transactions: [...updatedWallet['IRR'].transactions, commissionTransaction],
                                };
                            }
                            return { ...u, wallet: updatedWallet };
                        }
                        return u;
                    });
                    logActivity(currentUser, t('activityLog.commissionPaid', formatNumber(commissionAmount), 'IRR', flightCreator.name, newBooking.id));
                }
            }
        }
        
        setUsers(updatedUsers);

        const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
        setCurrentUser(updatedCurrentUser || null);

        logActivity(currentUser, t('activityLog.bookingSuccess', newBooking.id));
        createBookingJournalEntry(newBooking, 'create');
        
        setSelectedFlight(null);
        setPassengersData(null);
        
        alert(t('bookingReview.bookingSuccess', newBooking.id));
        setView('SEARCH');
    };

    const handleLogin = (username: string, pass: string): boolean => {
        const user = users.find(u => u.username === username && u.password === pass);
        if (user) {
            if (user.status === 'SUSPENDED') {
                setLoginError(t('login.errors.suspended'));
                return false;
            }
            setCurrentUser(user);
            logActivity(user, t('activityLog.loggedIn'));
            if (selectedFlight) {
                setView('PASSENGER_DETAILS');
            } else {
                setView('PROFILE');
            }
            setLoginError(null);
            return true;
        }
        setLoginError(t('login.errors.invalid'));
        return false;
    };
    
    const handleAdminLogin = (username: string, pass: string): boolean => {
        const user = users.find(u => u.username === username && u.password === pass);
        if (user && user.role !== 'USER') {
             if (user.status === 'SUSPENDED') {
                setLoginError(t('login.errors.suspended'));
                return false;
            }
            setCurrentUser(user);
            logActivity(user, t('activityLog.adminLoggedIn'));
            setView('PROFILE'); // Will show dashboard
            setLoginError(null);
            return true;
        }
        return false;
    };

    const handleSignup = (name: string, username: string, email: string, pass: string) => {
        if (users.some(u => u.username === username)) {
            alert(t('signup.errors.usernameExists'));
            return;
        }
        if (users.some(u => u.email === email)) {
            alert(t('signup.errors.emailExists'));
            return;
        }
        const newUser: User = {
            id: `user-${Date.now()}`, name, username, email, password: pass,
            role: 'USER', status: 'ACTIVE', createdAt: new Date().toISOString(),
            wallet: createInitialWallet(activeCurrenciesForMock),
            canBypassRateLimit: false, savedPassengers: [], displayCurrencies: []
        };
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        setCurrentUser(newUser);
        logActivity(newUser, t('activityLog.userCreated', newUser.name));
        
        if (selectedFlight) {
            setView('PASSENGER_DETAILS');
        } else {
            setView('PROFILE');
        }
    };
    
    const handleLogout = () => {
        logActivity(currentUser, t('activityLog.loggedOut'));
        setCurrentUser(null);
        setView('SEARCH');
    };

    const handleUpdateUser = useCallback((userId: string, name: string, role: UserRole, status: UserStatus, canBypassRateLimit: boolean, displayCurrencies: Currency[], tenantId?: string) => {
        if (!currentUser) return;
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, name, role, status, canBypassRateLimit, displayCurrencies, tenantId } : u));
        if (currentUser.id === userId) {
            setCurrentUser(prev => prev ? { ...prev, name, role, status, canBypassRateLimit, displayCurrencies, tenantId } : null);
        }
        logActivity(currentUser, `Updated user profile for ${name}`);
    }, [currentUser, logActivity, t]);

    const handleCreateBasicData = useCallback((type: BasicDataType, data: any) => {
        if (!currentUser) return;
        const newId = `${type.slice(0, 2)}-${Date.now()}`;
        const newItem = { ...data, id: newId };
        let itemName = newItem.name?.[language] || newId;

        switch (type) {
            case 'airline': setAirlines(prev => [...prev, newItem]); break;
            case 'aircraft': setAircrafts(prev => [...prev, newItem]); break;
            case 'flightClass': setFlightClasses(prev => [...prev, newItem]); break;
            case 'airport': setAirports(prev => [...prev, newItem]); break;
            case 'commissionModel': setCommissionModels(prev => [...prev, newItem]); break;
            case 'currency': setCurrencies(prev => [...prev, newItem]); break;
            case 'refundPolicy': setRefundPolicies(prev => [...prev, newItem]); break;
        }
        logActivity(currentUser, t('activityLog.basicDataCreated', t(`activityLog.log.${type}`), itemName));
    }, [currentUser, language, logActivity, t]);

    const handleUpdateBasicData = useCallback((type: BasicDataType, data: any) => {
        if (!currentUser) return;
        let itemName = data.name?.[language] || data.id;

        switch (type) {
            case 'airline': setAirlines(prev => prev.map(item => item.id === data.id ? data : item)); break;
            case 'aircraft': setAircrafts(prev => prev.map(item => item.id === data.id ? data : item)); break;
            case 'flightClass': setFlightClasses(prev => prev.map(item => item.id === data.id ? data : item)); break;
            case 'airport': setAirports(prev => prev.map(item => item.id === data.id ? data : item)); break;
            case 'commissionModel': setCommissionModels(prev => prev.map(item => item.id === data.id ? data : item)); break;
            case 'currency': setCurrencies(prev => prev.map(item => item.id === data.id ? data : item)); break;
            case 'refundPolicy': setRefundPolicies(prev => prev.map(item => item.id === data.id ? data : item)); break;
        }
        logActivity(currentUser, t('activityLog.basicDataUpdated', t(`activityLog.log.${type}`), itemName));
    }, [currentUser, language, logActivity, t]);

    const handleDeleteBasicData = useCallback((type: BasicDataType, id: string) => {
        if (!currentUser) return;

        let inUse = false;
        let itemName = '';
        const itemLogName = t(`activityLog.log.${type}` as any);

        switch (type) {
            case 'refundPolicy':
                if (allFlights.some(f => f.refundPolicyId === id)) {
                    alert(t('dashboard.flights.deletePolicyInUseError'));
                    return;
                }
                itemName = refundPolicies.find(p => p.id === id)?.name[language] || id;
                setRefundPolicies(prev => prev.filter(p => p.id !== id));
                break;
            // Similar checks for other types can be added here
            // For now, only implementing the requested check for refund policies
            case 'airline':
                 itemName = airlines.find(p => p.id === id)?.name[language] || id;
                 setAirlines(prev => prev.filter(p => p.id !== id));
                 break;
            case 'aircraft':
                 itemName = aircrafts.find(p => p.id === id)?.name[language] || id;
                 setAircrafts(prev => prev.filter(p => p.id !== id));
                 break;
            case 'flightClass':
                 itemName = flightClasses.find(p => p.id === id)?.name[language] || id;
                 setFlightClasses(prev => prev.filter(p => p.id !== id));
                 break;
            case 'airport':
                 itemName = airports.find(p => p.id === id)?.name[language] || id;
                 setAirports(prev => prev.filter(p => p.id !== id));
                 break;
            case 'commissionModel':
                 itemName = commissionModels.find(p => p.id === id)?.name[language] || id;
                 setCommissionModels(prev => prev.filter(p => p.id !== id));
                 break;
            case 'currency':
                 itemName = currencies.find(p => p.id === id)?.name[language] || id;
                 setCurrencies(prev => prev.filter(p => p.id !== id));
                 break;
        }
        
        logActivity(currentUser, t('activityLog.basicDataDeleted', itemLogName, itemName));

    }, [currentUser, allFlights, refundPolicies, airlines, aircrafts, flightClasses, airports, commissionModels, currencies, language, t, logActivity]);

    const handleCreateAdvertisement = useCallback((ad: Omit<Advertisement, 'id'>) => {
        if (!currentUser) return;
        const newAd = { ...ad, id: `ad-${Date.now()}` };
        setAdvertisements(prev => [...prev, newAd]);
        logActivity(currentUser, t('activityLog.adCreated', newAd.title));
    }, [currentUser, logActivity, t]);
    
    const handleUpdateAdvertisement = useCallback((ad: Advertisement) => {
        if (!currentUser) return;
        setAdvertisements(prev => prev.map(item => (item.id === ad.id ? ad : item)));
        logActivity(currentUser, t('activityLog.adUpdated', ad.title));
    }, [currentUser, logActivity, t]);

    const handleDeleteAdvertisement = useCallback((adId: string) => {
        if (!currentUser) return;
        const adToDelete = advertisements.find(ad => ad.id === adId);
        if(adToDelete) {
            setAdvertisements(prev => prev.filter(item => item.id !== adId));
            logActivity(currentUser, t('activityLog.adDeleted', adToDelete.title));
        }
    }, [currentUser, advertisements, logActivity, t]);

    const handleManualBookingCreate = useCallback(async (data: {
        flightData: Omit<Flight, 'id' | 'creatorId'>;
        passengers: { adults: PassengerDetails[]; children: PassengerDetails[]; infants: PassengerDetails[]; };
        customerId: string;
        purchasePrice: number;
        contactEmail: string;
        contactPhone: string;
        buyerReference?: string;
        notes?: string;
    }): Promise<Booking | null> => {
        if (!currentUser) return null;

        const customer = users.find(u => u.id === data.customerId);
        if (!customer) {
            console.error("Customer not found for manual booking");
            alert("Customer not found!");
            return null;
        }
        
        const newFlight: Flight = {
            ...data.flightData,
            id: `FL-MANUAL-${Date.now()}`,
            creatorId: currentUser.id,
            tenantId: currentUser.tenantId, // Associate with creator's tenant
        };

        const newBooking: Booking = {
            id: `BK-MANUAL-${Date.now()}`,
            user: customer,
            flight: newFlight,
            passengers: data.passengers,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            query: { // Create a dummy query for consistency
                tripType: TripType.OneWay,
                from: newFlight.departure.city,
                to: newFlight.arrival.city,
                departureDate: newFlight.departure.dateTime.split('T')[0],
                passengers: {
                    adults: data.passengers.adults.length,
                    children: data.passengers.children.length,
                    infants: data.passengers.infants.length,
                }
            },
            bookingDate: new Date().toISOString(),
            status: 'CONFIRMED',
            purchasePrice: data.purchasePrice,
            buyerReference: data.buyerReference,
            notes: data.notes,
            tenantId: currentUser.tenantId, // Associate with creator's tenant
        };

        setBookings(prev => [newBooking, ...prev]);

        // Note: For manual bookings, we don't automatically deduct from a customer's wallet.
        // This is assumed to be handled offline. We will create journal entries though.

        logActivity(currentUser, t('activityLog.manualBookingCreated', newBooking.id, customer.name));
        
        // Journal Entry for manual booking
        const totalPassengers = newBooking.passengers.adults.length + newBooking.passengers.children.length + newBooking.passengers.infants.length;
        const sellingPrice = (newFlight.price + newFlight.taxes) * totalPassengers;
        const costOfTicket = data.purchasePrice;
        
        const description = t('accounting.journal.manualBooking', newBooking.id, customer.name);
        
        const transactions: Transaction[] = [
            { accountId: '1020', debit: sellingPrice, credit: 0 }, // Accounts Receivable from customer
            { accountId: '4011', debit: 0, credit: sellingPrice }, // Sales Revenue
            { accountId: '5040', debit: costOfTicket, credit: 0 }, // Cost of Ticket (Expense)
            { accountId: '2010', debit: 0, credit: costOfTicket }, // Accounts Payable to airline/supplier
        ];

        const newEntry: JournalEntry = {
            id: `JE-${Date.now()}`,
            date: new Date().toISOString(),
            description,
            transactions,
            userId: customer.id,
        };
        setJournalEntries(prev => [newEntry, ...prev]);

        alert(`Manual booking ${newBooking.id} created successfully.`);

        return newBooking;
    }, [currentUser, users, logActivity, t]);

    const handleCreateFlight = useCallback((flightData: Omit<Flight, 'id' | 'creatorId'>) => {
        if (!currentUser) return;
        const newFlight: Flight = {
            ...flightData,
            id: `FL-${Date.now()}`,
            creatorId: currentUser.id,
            tenantId: currentUser.tenantId,
        };
        setAllFlights(prev => [newFlight, ...prev]);
        logActivity(currentUser, t('activityLog.flightCreated', newFlight.flightNumber, newFlight.departure.city, newFlight.arrival.city));
    }, [currentUser, logActivity, t]);

    const handleUpdateFlight = useCallback((updatedFlight: Flight) => {
        if (!currentUser) return;
        setAllFlights(prev => prev.map(f => f.id === updatedFlight.id ? updatedFlight : f));
        logActivity(currentUser, t('activityLog.flightUpdated', updatedFlight.flightNumber));
    }, [currentUser, logActivity, t]);

    const handleDeleteFlight = useCallback((flightId: string) => {
        if (!currentUser) return;
        if(bookings.some(b => b.flight.id === flightId)) {
            alert(t('dashboard.flights.deleteError'));
            return;
        }
        const flightToDelete = allFlights.find(f => f.id === flightId);
        if(flightToDelete) {
            setAllFlights(prev => prev.filter(f => f.id !== flightId));
            logActivity(currentUser, t('activityLog.flightDeleted', flightToDelete.flightNumber));
        }
    }, [currentUser, bookings, allFlights, logActivity, t]);

    const handleUpdateRolePermissions = useCallback((newPermissions: RolePermissions) => {
        setRolePermissions(newPermissions);
        if (currentUser) {
            logActivity(currentUser, 'Updated role permissions.');
        }
    }, [currentUser, logActivity]);

    // Dummy handlers for now to satisfy component props
    const handleDummy = () => { console.log("Action not fully implemented yet.") };
    
    // Multi-tenant data filtering
    const visibleBookings = useMemo(() => (currentUser?.role === 'SUPER_ADMIN' ? bookings : bookings.filter(b => b.tenantId === currentUser?.tenantId)), [bookings, currentUser]);
    const visibleFlights = useMemo(() => (currentUser?.role === 'SUPER_ADMIN' ? allFlights : allFlights.filter(f => f.tenantId === currentUser?.tenantId)), [allFlights, currentUser]);
    const visibleUsers = useMemo(() => (currentUser?.role === 'SUPER_ADMIN' ? users : users.filter(u => u.tenantId === currentUser?.tenantId || u.id === currentUser?.id)), [users, currentUser]);
    
    const currentTenant = useMemo(() => {
        if (!currentUser || !currentUser.tenantId) return undefined;
        return tenants.find(t => t.id === currentUser.tenantId);
    }, [currentUser, tenants]);

    const handleFilterChange = useCallback((newFilters: Filters) => {
        setFilters(newFilters);
    }, []);

    const filteredFlights = useMemo(() => {
        if (flights.length === 0 || !filters) return flights;

        return flights.filter(flight => {
            const { stops, maxPrice, airlines: filteredAirlines } = filters;
            
            // Price filter
            const flightPrice = flight.price + flight.taxes;
            if (flightPrice > maxPrice) {
                return false;
            }

            // Airline filter
            if (filteredAirlines.length > 0 && !filteredAirlines.includes(flight.airline)) {
                return false;
            }

            // Stops filter
            if (stops.length > 0) {
                let stopCategory: number;
                if (flight.stops === 0) stopCategory = 0;
                else if (flight.stops === 1) stopCategory = 1;
                else stopCategory = 2; // For 2+ stops
                
                if (!stops.includes(stopCategory)) {
                    return false;
                }
            }
            
            return true;
        });
    }, [flights, filters]);


    const steps = [
        t('stepper.selectFlight'),
        t('stepper.passengerDetails'),
        t('stepper.confirmAndPay'),
    ];

    let activeStep = 0;
    if (view === 'PASSENGER_DETAILS') activeStep = 1;
    if (view === 'REVIEW') activeStep = 2;

    const renderContent = () => {
        if (view === 'PROFILE' && currentUser) {
            return currentUser.role === 'USER' ? 
                <ProfilePage 
                    user={currentUser}
                    bookings={bookings.filter(b => b.user.id === currentUser.id)}
                    tickets={tickets.filter(t => t.user.id === currentUser.id)}
                    currencies={currencies}
                    refundPolicies={refundPolicies}
                    onLogout={handleLogout}
                    onCancelBooking={handleDummy}
                    onUpdateProfile={() => ({success: true, message:''})}
                    onCreateTicket={handleDummy}
                    onUserAddMessageToTicket={handleDummy}
                    onAddSavedPassenger={handleDummy}
                    onUpdateSavedPassenger={handleDummy}
                    onDeleteSavedPassenger={handleDummy}
                /> : 
                <DashboardPage 
                    user={currentUser}
                    bookings={visibleBookings}
                    users={visibleUsers}
                    tenants={tenants}
                    tickets={tickets}
                    airlines={airlines}
                    aircrafts={aircrafts}
                    flightClasses={flightClasses}
                    airports={airports}
                    commissionModels={commissionModels}
                    rateLimits={rateLimits}
                    allFlights={visibleFlights}
                    activityLogs={activityLogs}
                    chartOfAccounts={chartOfAccounts}
                    journalEntries={journalEntries}
                    expenses={expenses}
                    currencies={currencies}
                    refundPolicies={refundPolicies}
                    refunds={refunds}
                    siteContent={siteContent}
                    advertisements={advertisements}
                    rolePermissions={rolePermissions}
                    onUpdateRolePermissions={handleUpdateRolePermissions}
                    onCreateAdvertisement={handleCreateAdvertisement}
                    onUpdateAdvertisement={handleUpdateAdvertisement}
                    onDeleteAdvertisement={handleDeleteAdvertisement}
                    onUpdateSiteContent={setSiteContent}
                    onLogout={handleLogout}
                    onUpdateBooking={handleDummy}
                    onUpdateRefund={handleUpdateRefund}
                    onUpdateUser={handleUpdateUser}
                    onResetUserPassword={handleDummy}
                    onChargeUserWallet={handleDummy}
                    onCreateUser={handleDummy}
                    onUpdateTicket={handleDummy}
                    onAddMessageToTicket={handleDummy}
                    onCreateBasicData={handleCreateBasicData}
                    onUpdateBasicData={handleUpdateBasicData}
                    onDeleteBasicData={handleDeleteBasicData}
                    onCreateRateLimit={handleDummy}
                    onUpdateRateLimit={handleDummy}
                    onDeleteRateLimit={handleDummy}
                    onCreateFlight={handleCreateFlight}
                    onUpdateFlight={handleUpdateFlight}
                    onDeleteFlight={handleDeleteFlight}
                    onManualBookingCreate={handleManualBookingCreate}
                    onExitAdmin={() => setView('SEARCH')}
                    onCreateExpense={handleDummy}
                />
        }

        switch (view) {
            case 'LOGIN': return <LoginPage onLogin={handleLogin} onGoToSignup={() => setView('SIGNUP')} error={loginError} />;
            case 'SIGNUP': return <SignupPage onSignup={handleSignup} onGoToLogin={() => setView('LOGIN')} />;
            case 'ADMIN_LOGIN': return <AdminLoginPage onLogin={handleAdminLogin} onGoToSearch={() => setView('SEARCH')} />;
            case 'ABOUT': return <AboutPage siteContent={siteContent.about} />;
            case 'CONTACT': return <ContactPage siteContent={siteContent.contact} />;
            case 'PASSENGER_DETAILS':
                if (!selectedFlight || !searchQuery || !currentUser) return null;
                return (
                    <PassengerDetailsForm
                        flight={selectedFlight}
                        query={searchQuery}
                        user={currentUser}
                        onBack={handleBackToSearch}
                        onSubmit={handlePassengerDetailsSubmit}
                        currencies={currencies}
                    />
                );
            case 'REVIEW':
                if (!selectedFlight || !searchQuery || !passengersData || !currentUser) return null;
                return (
                    <BookingReview
                        flight={selectedFlight}
                        query={searchQuery}
                        passengers={passengersData}
                        user={currentUser}
                        onBack={handleBackToPassengerDetails}
                        onConfirmBooking={handleConfirmBooking}
                        currencies={currencies}
                    />
                );
            case 'SEARCH':
            default:
                return (
                    <div className="relative">
                        <div className="absolute inset-0 -z-10">
                             <img src={siteContent.home.heroImageUrl} alt="background" className="w-full h-[500px] object-cover" />
                             <div className="absolute inset-0 bg-black/50"></div>
                        </div>
                        <div className="container mx-auto px-4 pt-20 pb-28">
                             <div className="max-w-screen-xl mx-auto">
                                <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-2 drop-shadow-lg" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>{t('header.title')}</h1>
                                <p className="text-xl text-slate-200 text-center mb-8 drop-shadow-md" style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>{t('flightSearch.subtitle')}</p>
                                <FlightSearchForm onSearch={handleSearch} isLoading={isLoading} airports={airports} />
                            </div>
                        </div>
                        <div className="container mx-auto px-4 py-8">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                                <aside className="lg:col-span-1 lg:sticky top-8">
                                    <FilterSidebar 
                                        flights={flights} 
                                        onFilterChange={handleFilterChange} 
                                        advertisements={advertisements} 
                                    />
                                </aside>
                                <main className="lg:col-span-3">
                                    {isLoading ? <LoadingSpinner /> : <SearchResults flights={filteredFlights} onSelectFlight={handleSelectFlight} refundPolicies={refundPolicies} advertisements={advertisements} currentUser={currentUser} currencies={currencies} />}
                                </main>
                            </div>
                        </div>
                        <WhyChooseUs />
                        <PopularDestinations content={siteContent.home.popularDestinations} />
                    </div>
                );
        }
    };

    return (
        <div className={`flex flex-col min-h-screen bg-secondary font-sans ${language === 'en' ? '' : 'font-vazir'}`}>
            <Header
                user={currentUser}
                tenant={currentTenant}
                onLoginClick={() => setView('LOGIN')}
                onLogout={handleLogout}
                onProfileClick={() => setView('PROFILE')}
                onLogoClick={() => setView('SEARCH')}
            />
            <main className="flex-grow">
                {(view === 'PASSENGER_DETAILS' || view === 'REVIEW') && (
                    <div className="bg-white py-6 shadow-sm">
                        <BookingStepper steps={steps} activeStep={activeStep} />
                    </div>
                )}
                {renderContent()}
            </main>
             <Footer
                user={currentUser}
                siteContent={siteContent}
                onAdminLoginClick={() => setView('ADMIN_LOGIN')}
                onGoToAbout={() => setView('ABOUT')}
                onGoToContact={() => setView('CONTACT')}
            />
        </div>
    );
};

export default App;