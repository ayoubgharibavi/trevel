





import React, { useState, useCallback, useMemo } from 'react';
import { FlightSearchForm } from '@/components/FlightSearchForm';
import { SearchResults } from '@/components/SearchResults';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PassengerDetailsForm } from '@/components/PassengerDetailsForm';
import { BookingReview } from '@/components/BookingReview';
import { BookingStepper } from '@/components/BookingStepper';
import type { Flight, SearchQuery, PassengerDetails, User, Booking, Ticket, TicketMessage, AirlineInfo, AircraftInfo, FlightClassInfo, ActivityLog, AirportInfo, Account, JournalEntry, Expense, Transaction, Wallet, WalletTransaction, CurrencyInfo, RefundPolicy, SavedPassenger, SiteContent, Refund, Advertisement, RolePermissions, Tenant, TelegramBotConfig, WhatsAppBotConfig, CountryInfo } from '@/types';
import { UserRole, UserStatus, BookingStatus, TripType, Nationality, Gender, FlightSourcingType, CommissionCalculationType, AdPlacement, View, PassengerData, Currency } from '@/types';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { Footer } from '@/components/Footer';
import { DashboardPage } from '@/pages/DashboardPage';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { initialAirports } from '@/data/airports';
import { initialChartOfAccounts } from '@/data/accounting';
import { initialCommissionModels } from '@/data/commissionModels';
import { useLocalization } from '@/hooks/useLocalization';
import { generateFlights } from '@/services/geminiService';
import { sendTelegramMessage } from '@/services/telegramService';
import { sendWhatsAppMessage } from '@/services/whatsappService';
import { initialCurrencies } from '@/data/currencies';
import { initialRefundPolicies } from '@/data/refundPolicies';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { PopularDestinations } from '@/components/PopularDestinations';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { initialRolePermissions } from '@/data/permissions';
import { initialTenants } from '@/data/tenants';
import { initialCountries } from '@/data/countries';


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
      phone: '+989121111111',
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
      phone: '+989122222222',
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
      phone: '+989123333333',
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
      phone: '+989124444444',
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
      phone: '+989125555555',
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
      phone: '+989123456789',
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
      phone: '+989351234567',
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
    airlineLogoUrl: '/src/assets/placeholder_logo.png',
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
    airlineLogoUrl: '/src/assets/placeholder_logo.png',
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
        contactPhone: '989123456789',
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
        contactPhone: '989351234567',
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
        contactPhone: '989123456789',
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
    { id: 'airline-1', name: { ar: 'إيران للطيران', fa: 'ایران ایر', en: 'Iran Air' }, logoUrl: '/src/assets/placeholder_logo.png' },
    { id: 'airline-2', name: { ar: 'ماهان للطيران', fa: 'ماهان ایر', en: 'Mahan Air' }, logoUrl: '/src/assets/placeholder_logo.png' },
    { id: 'airline-3', name: { ar: 'الخطوط التركية', fa: 'ترکیش ایرلاینز', en: 'Turkish Airlines' }, logoUrl: '/src/assets/placeholder_logo.png' },
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
        heroImageUrl: '/src/assets/placeholder_hero.png',
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
                { id: 'dest-1', name: { fa: 'استانبول', ar: 'إسطنبول', en: 'Istanbul' }, imageUrl: '/src/assets/placeholder_destination.png' },
                { id: 'dest-2', name: { fa: 'دبی', ar: 'دبي', en: 'Dubai' }, imageUrl: '/src/assets/placeholder_destination.png' },
                { id: 'dest-3', name: { fa: 'پاریس', ar: 'باريس', en: 'Paris' }, imageUrl: '/src/assets/placeholder_destination.png' },
                { id: 'dest-4', name: { fa: 'تهران', ar: 'طهران', en: 'Tehran' }, imageUrl: '/src/assets/placeholder_destination.png' },
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
        imageUrl: '/src/assets/placeholder_about.png',
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
        mapImageUrl: '/src/assets/placeholder_map.png',
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
        imageUrl: '/src/assets/placeholder_ad.png',
        linkUrl: '#',
        placement: AdPlacement.SEARCH_RESULTS_TOP,
        isActive: true,
    },
    {
        id: 'ad-2',
        title: 'Sidebar - Hotel Deal',
        imageUrl: '/src/assets/placeholder_ad.png',
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

type BasicDataType = 'airline' | 'aircraft' | 'flightClass' | 'airport' | 'commissionModel' | 'currency' | 'refundPolicy' | 'country';


const App: React.FC = () => {
    const { t, language, formatNumber, formatDate, formatTime } = useLocalization();
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
    const [countries, setCountries] = useState<CountryInfo[]>(initialCountries);


    // Accounting State
    const [chartOfAccounts, setChartOfAccounts] = useState<Account[]>(initialChartOfAccounts);
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    // Integrations State
    const [telegramConfig, setTelegramConfig] = useState<TelegramBotConfig>({
        isEnabled: false,
        botToken: '',
        chatId: '',
        notifyOn: {
            newBooking: true,
            bookingCancellation: true,
            refundUpdate: true,
            newUser: true,
            newTicket: true,
        },
    });
    const [whatsAppBotConfig, setWhatsAppBotConfig] = useState<WhatsAppBotConfig>({
        isEnabled: false,
        apiKey: '',
        phoneNumberId: '',
        notifyOn: {
            bookingSuccess: true,
            flightChange: true,
        },
    });


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
        
        let oldStatus = refund.status;

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

        if (telegramConfig.isEnabled && telegramConfig.notifyOn.refundUpdate && oldStatus !== refund.status) {
            const booking = bookings.find(b => b.id === refund.bookingId);
            const message = `🔄 *Refund Status Update*\n\nRef ID: \`${refund.bookingId}\`\nUser: ${booking?.user.name}\nFrom: _${t(`dashboard.refunds.statusValues.${oldStatus}` as any)}_\nTo: *${t(`dashboard.refunds.statusValues.${refund.status}` as any)}*`;
            sendTelegramMessage(telegramConfig, message);
        }

    }, [currentUser, refunds, bookings, users, logActivity, t, createBookingJournalEntry, telegramConfig]);

    const handleSearch = useCallback(async (query: SearchQuery) => {
        setIsLoading(true);
        setSearchQuery(query);
        setFlights([]);
        
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

        if (telegramConfig.isEnabled && telegramConfig.notifyOn.newBooking) {
            const message = `✅ *New Booking!*\n\nRef ID: \`${newBooking.id}\`\n✈️ Flight: ${newBooking.flight.flightNumber} (${newBooking.flight.departure.city} to ${newBooking.flight.arrival.city})\n👤 Customer: ${newBooking.user.name}\n💰 Total: ${formatNumber(totalPrice)} IRR`;
            sendTelegramMessage(telegramConfig, message);
        }
        
        if (whatsAppBotConfig.isEnabled && whatsAppBotConfig.notifyOn.bookingSuccess) {
            const flightInfo = `${newBooking.flight.flightNumber} (${newBooking.flight.departure.city} -> ${newBooking.flight.arrival.city})`;
            const passengerNames = newBooking.passengers.adults.map(p => `${p.firstName} ${p.lastName}`).join(', ');
            const message = t('whatsapp.bookingSuccessMessage', newBooking.id, flightInfo, passengerNames);
            sendWhatsAppMessage(whatsAppBotConfig, newBooking.contactPhone, message);
        }

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

    const handleSignup = (name: string, username: string, email: string, pass: string, phone: string) => {
        if (users.some(u => u.username === username)) {
            alert(t('signup.errors.usernameExists'));
            return;
        }
        if (users.some(u => u.email === email)) {
            alert(t('signup.errors.emailExists'));
            return;
        }
        const newUser: User = {
            id: `user-${Date.now()}`, name, username, email, password: pass, phone,
            role: 'USER', status: 'ACTIVE', createdAt: new Date().toISOString(),
            wallet: createInitialWallet(activeCurrenciesForMock),
            canBypassRateLimit: false, savedPassengers: [], displayCurrencies: []
        };
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        setCurrentUser(newUser);
        logActivity(newUser, t('activityLog.userCreated', newUser.name));
        
        if (telegramConfig.isEnabled && telegramConfig.notifyOn.newUser) {
            const message = `🎉 *New User Signup!*\n\nName: ${newUser.name}\nUsername: \`${newUser.username}\`\nEmail: ${newUser.email}`;
            sendTelegramMessage(telegramConfig, message);
        }

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
            // FIX: The file was truncated here. This completes the `setCurrentUser` call.
            setCurrentUser(prevUser => {
                if (!prevUser) return null;
                return { ...prevUser, name, role, status, canBypassRateLimit, displayCurrencies: (displayCurrencies as any), tenantId };
            });
        }
    }, [currentUser]);
    
    const handleUpdateTelegramConfig = useCallback((config: TelegramBotConfig) => setTelegramConfig(config), []);
    const handleUpdateWhatsAppBotConfig = useCallback((config: WhatsAppBotConfig) => setWhatsAppBotConfig(config), []);
    const handleUpdateRolePermissions = useCallback((newPermissions: RolePermissions) => setRolePermissions(newPermissions), []);
    const handleCreateAdvertisement = useCallback((ad: Omit<Advertisement, 'id'>) => setAdvertisements(prev => [...prev, { ...ad, id: `ad-${Date.now()}` }]), []);
    const handleUpdateAdvertisement = useCallback((ad: Advertisement) => setAdvertisements(prev => prev.map(a => a.id === ad.id ? ad : a)), []);
    const handleDeleteAdvertisement = useCallback((adId: string) => setAdvertisements(prev => prev.filter(a => a.id !== adId)), []);
    const handleUpdateSiteContent = useCallback((newContent: SiteContent) => setSiteContent(newContent), []);
    const handleUpdateBooking = useCallback((booking: Booking) => setBookings(prev => prev.map(b => b.id === booking.id ? booking : b)), []);
    const handleResetUserPassword = useCallback((userId: string, newPass: string) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPass } : u)), []);
    const handleChargeUserWallet = useCallback((userId: string, amount: number, currency: Currency, description: string) => { console.log(userId, amount, currency, description) }, []);
    const handleCreateUser = useCallback((newUser: Omit<User, 'id' | 'wallet' | 'createdAt' | 'canBypassRateLimit'>) => { console.log(newUser) }, []);
    const handleUpdateTicket = useCallback((ticket: Ticket) => setTickets(prev => prev.map(t => t.id === ticket.id ? ticket : t)), []);
    const handleAddMessageToTicket = useCallback((ticketId: string, message: TicketMessage) => { setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, messages: [...t.messages, message], updatedAt: new Date().toISOString() } : t)) }, []);
    const handleUserAddMessageToTicket = useCallback((ticketId: string, messageText: string) => {
        if (!currentUser) return;
        const newMessage: TicketMessage = {
            id: `msg-${Date.now()}`,
            author: 'USER',
            authorName: currentUser.name,
            text: messageText,
            timestamp: new Date().toISOString(),
        };
        // Re-opens the ticket if user replies
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, messages: [...t.messages, newMessage], status: 'OPEN', updatedAt: new Date().toISOString() } : t));
    
        if (telegramConfig.isEnabled && telegramConfig.notifyOn.newTicket) {
            const ticket = tickets.find(t => t.id === ticketId);
            const message = `💬 *User Reply to Ticket*\n\nTicket ID: \`${ticketId}\`\nSubject: ${ticket?.subject}\nUser: ${currentUser.name}\n\n_${messageText}_`;
            sendTelegramMessage(telegramConfig, message);
        }
    }, [currentUser, telegramConfig, tickets]);
    const handleCreateBasicData = useCallback((type: BasicDataType, data: any) => {
        if (type === 'country') {
            const newCountry = { ...data, id: data.id.toUpperCase() } as CountryInfo;
             if (countries.some(c => c.id.toLowerCase() === newCountry.id.toLowerCase())) {
                alert('Country with this ISO code already exists.');
                return;
            }
            setCountries(prev => [...prev, newCountry].sort((a, b) => a.name.en.localeCompare(b.name.en)));
        } else {
          console.log('Create not implemented for:', type);
        }
    }, [countries]);

    const handleUpdateBasicData = useCallback((type: BasicDataType, data: any) => {
        if (type === 'country') {
            setCountries(prev => prev.map(c => c.id === data.id ? data : c));
        } else {
             console.log('Update not implemented for:', type);
        }
    }, []);

    const handleDeleteBasicData = useCallback((type: BasicDataType, id: string) => {
         if (type === 'country') {
            setCountries(prev => prev.filter(c => c.id !== id));
        } else {
            console.log('Delete not implemented for:', type);
        }
    }, []);
    const onCreateRateLimit = useCallback(() => {}, []);
    const onUpdateRateLimit = useCallback(() => {}, []);
    const onDeleteRateLimit = useCallback(() => {}, []);
    const onCreateFlight = useCallback(() => {}, []);
    const onUpdateFlight = useCallback((updatedFlight: Flight) => {
        const originalFlight = allFlights.find(f => f.id === updatedFlight.id);
        setAllFlights(prev => prev.map(f => f.id === updatedFlight.id ? updatedFlight : f));
        logActivity(currentUser, t('activityLog.flightUpdated', updatedFlight.flightNumber));

        if (whatsAppBotConfig.isEnabled && whatsAppBotConfig.notifyOn.flightChange && originalFlight) {
            let changeMessage = '';
            if (originalFlight.status !== updatedFlight.status) {
                changeMessage = t('whatsapp.flightChange.status', t(`dashboard.flights.statusValues.${updatedFlight.status}`));
            } else if (originalFlight.departure.dateTime !== updatedFlight.departure.dateTime) {
                const newTime = formatTime(updatedFlight.departure.dateTime);
                const newDate = formatDate(updatedFlight.departure.dateTime);
                changeMessage = t('whatsapp.flightChange.time', newDate, newTime);
            }

            if (changeMessage) {
                const flightBookings = bookings.filter(b => b.flight.id === updatedFlight.id && b.status === 'CONFIRMED');
                flightBookings.forEach(booking => {
                    const message = t('whatsapp.flightChange.baseMessage', booking.user.name, updatedFlight.flightNumber, updatedFlight.departure.city, updatedFlight.arrival.city) + ' ' + changeMessage;
                    sendWhatsAppMessage(whatsAppBotConfig, booking.contactPhone, message);
                });
            }
        }
    }, [allFlights, bookings, whatsAppBotConfig, currentUser, logActivity, t, formatDate, formatTime]);
    const onDeleteFlight = useCallback(() => {}, []);
    const onManualBookingCreate = useCallback(async () => { return null; }, []);
    const onCreateExpense = useCallback(() => {}, []);
    const onExitAdmin = useCallback(() => setView('SEARCH'), []);
    const onCreateAccount = useCallback(() => true, []);
    const onUpdateAccount = useCallback(() => {}, []);
    const onCancelBooking = useCallback(() => {}, []);
    const onUpdateProfile = useCallback(() => ({ success: true, message: 'Success' }), []);
    const onCreateTicket = useCallback(() => {}, []);
    const onAddSavedPassenger = useCallback(() => {}, []);
    const onUpdateSavedPassenger = useCallback(() => {}, []);
    const onDeleteSavedPassenger = useCallback(() => {}, []);

    const handleGoToProfile = () => setView('PROFILE');
    const handleGoToSearch = () => setView('SEARCH');

    const currentTenant = useMemo(() => tenants.find(t => t.id === currentUser?.tenantId) || tenants[0], [currentUser, tenants]);

    const popularRoutes = useMemo(() => [
        { from: airports.find(a => a.iata === 'IKA')?.city[language] || 'Tehran', to: airports.find(a => a.iata === 'IST')?.city[language] || 'Istanbul' },
        { from: airports.find(a => a.iata === 'IKA')?.city[language] || 'Tehran', to: airports.find(a => a.iata === 'DXB')?.city[language] || 'Dubai' },
    ], [airports, language]);

    const renderContent = () => {
        const step = view === 'SEARCH' ? 0 : view === 'PASSENGER_DETAILS' ? 1 : view === 'REVIEW' ? 2 : -1;
        
        if (step !== -1 && searchQuery) {
             return (
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <BookingStepper steps={[t('stepper.selectFlight'), t('stepper.passengerDetails'), t('stepper.confirmAndPay')]} activeStep={step} />
                    </div>
                    {view === 'PASSENGER_DETAILS' && selectedFlight && searchQuery && currentUser && <PassengerDetailsForm flight={selectedFlight} query={searchQuery} user={currentUser} currencies={currencies} onBack={handleBackToSearch} onSubmit={handlePassengerDetailsSubmit} />}
                    {view === 'REVIEW' && selectedFlight && searchQuery && passengersData && currentUser && <BookingReview flight={selectedFlight} query={searchQuery} passengers={passengersData} user={currentUser} onBack={handleBackToPassengerDetails} onConfirmBooking={handleConfirmBooking} currencies={currencies} />}
                </div>
            );
        }

        switch (view) {
            case 'SEARCH':
                return (
                    <>
                        <div className="relative bg-cover bg-center" style={{ backgroundImage: `url(${siteContent.home.heroImageUrl})` }}>
                            <div className="absolute inset-0 bg-black/50"></div>
                            <div className="relative container mx-auto px-4 py-16 md:py-24">
                                <FlightSearchForm onSearch={handleSearch} isLoading={isLoading} airports={airports} />
                            </div>
                        </div>
                        <SearchResults flights={flights} onSelectFlight={handleSelectFlight} refundPolicies={refundPolicies} advertisements={advertisements} currentUser={currentUser} currencies={currencies} popularRoutes={popularRoutes} onSearch={handleSearch} />
                        {!searchQuery && (
                            <>
                                <WhyChooseUs />
                                <PopularDestinations content={siteContent.home.popularDestinations} />
                            </>
                        )}
                    </>
                );
            case 'LOGIN':
                return <LoginPage onLogin={handleLogin} onGoToSignup={() => setView('SIGNUP')} error={loginError} />;
            case 'SIGNUP':
                return <SignupPage onSignup={handleSignup} onGoToLogin={() => setView('LOGIN')} countries={countries} />;
            case 'PROFILE':
                if (!currentUser) return <LoginPage onLogin={handleLogin} onGoToSignup={() => setView('SIGNUP')} error={loginError} />;
                if (currentUser.role === 'USER') {
                    return <ProfilePage user={currentUser} bookings={bookings.filter(b => b.user.id === currentUser.id)} tickets={tickets.filter(t => t.user.id === currentUser.id)} currencies={currencies} refundPolicies={refundPolicies} onLogout={handleLogout} onCancelBooking={onCancelBooking} onUpdateProfile={onUpdateProfile} onCreateTicket={onCreateTicket} onUserAddMessageToTicket={handleUserAddMessageToTicket} onAddSavedPassenger={onAddSavedPassenger} onUpdateSavedPassenger={onUpdateSavedPassenger} onDeleteSavedPassenger={onDeleteSavedPassenger} />;
                }
                return <DashboardPage 
                    user={currentUser}
                    bookings={bookings}
                    users={users}
                    tenants={tenants}
                    tickets={tickets}
                    airlines={airlines}
                    aircrafts={aircrafts}
                    flightClasses={flightClasses}
                    airports={airports}
                    commissionModels={commissionModels}
                    rateLimits={rateLimits}
                    allFlights={allFlights}
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
                    telegramConfig={telegramConfig}
                    whatsappConfig={whatsAppBotConfig}
                    countries={countries}
                    onUpdateTelegramConfig={handleUpdateTelegramConfig}
                    onUpdateWhatsAppBotConfig={handleUpdateWhatsAppBotConfig}
                    onUpdateRolePermissions={handleUpdateRolePermissions}
                    onCreateAdvertisement={handleCreateAdvertisement}
                    onUpdateAdvertisement={handleUpdateAdvertisement}
                    onDeleteAdvertisement={handleDeleteAdvertisement}
                    onUpdateSiteContent={handleUpdateSiteContent}
                    onLogout={handleLogout}
                    onUpdateBooking={handleUpdateBooking}
                    onUpdateRefund={handleUpdateRefund}
                    onUpdateUser={handleUpdateUser}
                    onResetUserPassword={handleResetUserPassword}
                    onChargeUserWallet={handleChargeUserWallet}
                    onCreateUser={handleCreateUser}
                    onUpdateTicket={handleUpdateTicket}
                    onAddMessageToTicket={handleAddMessageToTicket}
                    onCreateBasicData={handleCreateBasicData}
                    onUpdateBasicData={handleUpdateBasicData}
                    onDeleteBasicData={handleDeleteBasicData}
                    onCreateRateLimit={onCreateRateLimit}
                    onUpdateRateLimit={onUpdateRateLimit}
                    onDeleteRateLimit={onDeleteRateLimit}
                    onCreateFlight={onCreateFlight}
                    onUpdateFlight={onUpdateFlight}
                    onDeleteFlight={onDeleteFlight}
                    onManualBookingCreate={onManualBookingCreate}
                    onCreateExpense={onCreateExpense}
                    onExitAdmin={onExitAdmin}
                    onCreateAccount={onCreateAccount}
                    onUpdateAccount={onUpdateAccount}
                />;
            case 'ADMIN_LOGIN':
                return <AdminLoginPage onLogin={handleAdminLogin} onGoToSearch={handleGoToSearch} />;
            case 'ABOUT':
                return <AboutPage siteContent={siteContent.about} />;
            case 'CONTACT':
                return <ContactPage siteContent={siteContent.contact} />;
            default:
                return null;
        }
    };

    return (
        <div className={`App font-sans ${language === 'en' ? 'ltr' : 'rtl'}`}>
            <Header user={currentUser} tenant={currentTenant} onLoginClick={() => setView('LOGIN')} onLogout={handleLogout} onProfileClick={handleGoToProfile} onLogoClick={handleGoToSearch} />
            <main className="bg-secondary min-h-[calc(100vh-128px)]">
                {isLoading ? <LoadingSpinner /> : renderContent()}
            </main>
            <Footer user={currentUser} siteContent={siteContent} onAdminLoginClick={() => setView('ADMIN_LOGIN')} onGoToAbout={() => setView('ABOUT')} onGoToContact={() => setView('CONTACT')} />
        </div>
    );
};

export default App;
