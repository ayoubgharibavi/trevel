import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FlightSearchForm } from '@/components/FlightSearchForm';
import { SearchResults } from '@/components/SearchResults';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PassengerDetailsForm } from '@/components/PassengerDetailsForm';
import { BookingConfirmation } from '@/components/BookingConfirmation';
import { BookingReview } from '@/components/BookingReview';
import { BookingStepper } from '@/components/BookingStepper';
import type { Flight, SearchQuery, PassengerDetails, User, Booking, Ticket, TicketMessage, AirlineInfo, AircraftInfo, FlightClassInfo, ActivityLog, AirportInfo, Account, JournalEntry, Expense, Transaction, Wallet, WalletTransaction, CurrencyInfo, RefundPolicy, SavedPassenger, SiteContent, Refund, Advertisement, RolePermissions, Tenant, TelegramBotConfig, WhatsAppBotConfig, CountryInfo, RateLimit, CommissionModel } from '@/types';
import { UserRole, UserStatus, BookingStatus, TripType, Nationality, Gender, FlightSourcingType, CommissionCalculationType, AdPlacement, View, PassengerData, Currency, FlightStatus, RefundStatus, TicketStatus, TicketPriority } from '@/types';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { Footer } from '@/components/Footer';
import { DashboardPage } from '@/pages/DashboardPage';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { useLocalization } from '@/hooks/useLocalization';
import { generateFlights } from '@/services/geminiService';
import { sendTelegramMessage } from '@/services/telegramService';
import { sendWhatsAppMessage } from '@/services/whatsappService';
import { apiService } from '@/services/apiService';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { PopularDestinations } from '@/components/PopularDestinations';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { CurrencyConverter } from '@/components/CurrencyConverter';


const createInitialWallet = (activeCurrencies: CurrencyInfo[]) => {
    const wallet: Wallet = {};
    activeCurrencies.forEach(currency => {
        wallet[currency.code] = { balance: 0, currency: currency.code, transactions: [] };
    });
    return wallet;
};

type BasicDataType = 'airline' | 'aircraft' | 'flightClass' | 'airport' | 'commissionModel' | 'currency' | 'refundPolicy' | 'country';


const App: React.FC = () => {
    const { t, language, formatNumber, formatDate, formatTime } = useLocalization();
    const [view, setView] = useState<View>('SEARCH');
    const [isLoading, setIsLoading] = useState(false);
    const [flights, setFlights] = useState<Flight[]>([]); // Search results
    
    // Debug flights state changes
    useEffect(() => {
        console.log('🔍 flights state changed:', flights);
        console.log('🔍 flights state length:', flights.length);
    }, [flights]);
    
    const [allFlights, setAllFlights] = useState<Flight[]>([]); // All manageable flights

    // Debug useEffect to monitor flights state changes
    useEffect(() => {
        console.log('🔍 flights state changed:', flights);
        console.log('🔍 flights state length:', flights.length);
    }, [flights]);
    
    const [searchQuery, setSearchQuery] = useState<SearchQuery | null>(null);
    const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
    const [passengersData, setPassengersData] = useState<PassengerData | null>(null);
    const [loginError, setLoginError] = useState<string | null>(null);
    
    // User Management
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const storedUser = localStorage.getItem('currentUser');
            const accessToken = localStorage.getItem('accessToken');
            
            // If user exists but no valid token, clear user
            if (storedUser && !accessToken) {
                console.log('🔄 User exists but no token, clearing user');
                localStorage.removeItem('currentUser');
                return null;
            }
            
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error('Error parsing currentUser from localStorage:', error);
            localStorage.removeItem('currentUser');
            return null;
        }
    });

    // Admin Data
    const [airlines, setAirlines] = useState<AirlineInfo[]>([]);
    const [aircrafts, setAircrafts] = useState<AircraftInfo[]>([]);
    const [flightClasses, setFlightClasses] = useState<FlightClassInfo[]>([]);
    const [airports, setAirports] = useState<AirportInfo[]>([]);
    const [commissionModels, setCommissionModels] = useState<CommissionModel[]>([]);
    const [currencies, setCurrencies] = useState<CurrencyInfo[]>([]);
    const [refundPolicies, setRefundPolicies] = useState<RefundPolicy[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [countries, setCountries] = useState<CountryInfo[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
    const [chartOfAccounts, setChartOfAccounts] = useState<Account[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]); // Moved here
    const [rateLimits, setRateLimits] = useState<RateLimit[]>([]); // Moved here


    const [rolePermissions, setRolePermissions] = useState<RolePermissions>(() => {
        // Default permissions for SUPER_ADMIN if API fails
        return {
            SUPER_ADMIN: [
                'VIEW_STATS', 'CREATE_FLIGHTS', 'EDIT_FLIGHTS', 'DELETE_FLIGHTS',
                'MANAGE_BOOKINGS', 'MANAGE_REFUNDS', 'MANAGE_TICKETS', 'MANAGE_USERS',
                'EDIT_USER_ROLE', 'MANAGE_BASIC_DATA', 'MANAGE_COMMISSION_MODELS',
                'VIEW_ACTIVITY_LOG', 'MANAGE_ACCOUNTING', 'MANAGE_RATE_LIMITS',
                'MANAGE_CONTENT', 'MANAGE_ADS', 'MANAGE_TENANTS', 'MANAGE_TELEGRAM_BOT',
                'MANAGE_WHATSAPP_BOT'
            ],
            ADMIN: [],
            USER: []
        };
    });

    // Accounting State
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

    const [siteContent, setSiteContent] = useState<SiteContent>({
        home: {
            heroImageUrl: '/src/assets/placeholder_hero.png',
            popularDestinations: {
                title: { fa: '', ar: '', en: '' },
                subtitle: { fa: '', ar: '', en: '' },
                destinations: [],
            }
        },
        about: {
            title: { fa: '', ar: '', en: '' },
            body: { fa: '', ar: '', en: '' },
            imageUrl: '/src/assets/placeholder_about.png',
        },
        contact: {
            title: { fa: '', ar: '', en: '' },
            body: { fa: '', ar: '', en: '' },
            address: { fa: '', ar: '', en: '' },
            phone: '',
            email: '',
            mapImageUrl: '/src/assets/placeholder_map.png',
        },
        footer: {
            description: { fa: '', ar: '', en: '' },
            columns: [],
        }
    });

    const [popularRoutes, setPopularRoutes] = useState<{
        from: string;
        to: string;
    }[]>([]);

    // Check for existing tokens and restore user session
    useEffect(() => {
        const restoreUserSession = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (accessToken && refreshToken && !currentUser) {
                try {
                    // Try to get current user info using the stored token
                    const userResponse = await apiService.getCurrentUser();
                    if (userResponse.success && userResponse.data) {
                        setCurrentUser(userResponse.data);
                        console.log('User session restored from tokens');
                    } else {
                        // If token is invalid, clear tokens
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        console.log('Invalid tokens, cleared from storage');
                    }
                } catch (error) {
                    console.error('Error restoring user session:', error);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            } else if (!accessToken && !refreshToken) {
                // No tokens available, user needs to login
                console.log('No tokens available, user needs to login');
            }
        };

        restoreUserSession();
    }, []);

    // Save currentUser to localStorage when it changes
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]);

    // Consolidated data loading
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            console.log('🔍 loadInitialData started');
            try {
                // Load general content and popular routes
                const [homeResponse, aboutResponse, contactResponse, popularDestinationsResponse, popularRoutesResponse] = await Promise.all([
                    apiService.getHomeContent(language),
                    apiService.getAboutContent(language),
                    apiService.getContactContent(language),
                    apiService.getPopularDestinations(language),
                    apiService.getPopularRoutes()
                ]);

                if (homeResponse.success && aboutResponse.success && contactResponse.success && popularDestinationsResponse.success && popularRoutesResponse.success) {
                    setSiteContent(prev => ({
                        ...prev,
                        home: {
                            heroImageUrl: homeResponse.data?.heroImageUrl || '/src/assets/placeholder_hero.png',
                            popularDestinations: popularDestinationsResponse.data || { title: { fa: '', ar: '', en: '' }, subtitle: { fa: '', ar: '', en: '' }, destinations: [] }
                        },
                        about: aboutResponse.data || { title: { fa: '', ar: '', en: '' }, body: { fa: '', ar: '', en: '' }, imageUrl: '/src/assets/placeholder_about.png' },
                        contact: contactResponse.data || { title: { fa: '', ar: '', en: '' }, body: { fa: '', ar: '', en: '' }, address: { fa: '', ar: '', en: '' }, phone: '', email: '', mapImageUrl: '/src/assets/placeholder_map.png' },
                    }));
                    setPopularRoutes(popularRoutesResponse.data || []);
                }

                // Load admin data if current user is admin
                if (currentUser && currentUser.role !== UserRole.USER) {
                    try {
                        const [
                            statsResponse, usersResponse, bookingsResponse, flightsResponse, airlinesResponse,
                            aircraftsResponse, flightClassesResponse, airportsResponse, commissionModelsResponse, currenciesResponse,
                            refundPoliciesResponse, tenantsResponse, countriesResponse, rolePermissionsResponse, advertisementsResponse,
                            chartOfAccountsResponse, telegramConfigResponse, whatsAppBotConfigResponse, activityLogsResponse, rateLimitsResponse,
                            refundsResponse, ticketsResponse, expensesResponse
                        ] = await Promise.all([
                            apiService.getAdminStats(),
                            apiService.getAdminUsers(),
                            apiService.getAdminBookings(),
                            apiService.getAdminFlights(),
                            apiService.getBasicData('airline'),
                            apiService.getBasicData('aircraft'),
                            apiService.getBasicData('flightClass'),
                            apiService.getBasicData('airport'),
                            apiService.getCommissionModels(),
                            apiService.getCurrencies(),
                            apiService.getRefundPolicies(),
                            apiService.getTenants(),
                            apiService.getCountries(),
                            apiService.getPermissions(),
                            apiService.getAdvertisements(),
                            apiService.getChartOfAccounts(),
                            apiService.getTelegramConfig(),
                            apiService.getWhatsAppConfig(),
                            apiService.getActivityLogs(),
                            apiService.getRateLimits(),
                            apiService.getRefunds(),
                            apiService.getAllTickets(),
                            apiService.getExpenses()
                        ]);

                    if (statsResponse.success && statsResponse.data) {
                        // Update stats data if needed
                    }
                    
                    if (usersResponse.success && usersResponse.data) {
                        setUsers(usersResponse.data.users || usersResponse.data);
                    }
                    
                    if (bookingsResponse.success && bookingsResponse.data) {
                        console.log('🔍 Setting bookings:', bookingsResponse.data);
                        console.log('🔍 Bookings data type:', typeof bookingsResponse.data);
                        console.log('🔍 Bookings data is array:', Array.isArray(bookingsResponse.data));
                        setBookings(bookingsResponse.data.bookings || bookingsResponse.data);
                    }
                    
                    if (flightsResponse.success && flightsResponse.data) {
                        console.log('🔍 Setting allFlights:', flightsResponse.data);
                        console.log('🔍 Flights data type:', typeof flightsResponse.data);
                        console.log('🔍 Flights data is array:', Array.isArray(flightsResponse.data));
                        console.log('🔍 Flights data length:', flightsResponse.data.length);
                        setAllFlights(flightsResponse.data);
                    } else {
                        console.error('🔍 Flights response failed:', flightsResponse);
                    }
                    if (airlinesResponse.success && airlinesResponse.data) {
                        setAirlines(airlinesResponse.data as AirlineInfo[]);
                    }
                    if (aircraftsResponse.success && aircraftsResponse.data) {
                        setAircrafts(aircraftsResponse.data as AircraftInfo[]);
                    }
                    if (flightClassesResponse.success && flightClassesResponse.data) {
                        setFlightClasses(flightClassesResponse.data as FlightClassInfo[]);
                    }
                    if (airportsResponse.success && airportsResponse.data) {
                        setAirports(airportsResponse.data as AirportInfo[]);
                    }
                    if (commissionModelsResponse.success && commissionModelsResponse.data) {
                        setCommissionModels(commissionModelsResponse.data);
                    }
                    if (currenciesResponse.success && currenciesResponse.data) {
                        setCurrencies(currenciesResponse.data);
                    }
                    if (refundPoliciesResponse.success && refundPoliciesResponse.data) {
                        setRefundPolicies(refundPoliciesResponse.data);
                    }
                    if (tenantsResponse.success && tenantsResponse.data) {
                        setTenants(tenantsResponse.data);
                    }
                    if (countriesResponse.success && countriesResponse.data) {
                        setCountries(countriesResponse.data);
                    }
                    if (rolePermissionsResponse.success && rolePermissionsResponse.data) {
                        console.log('✅ Role permissions loaded:', rolePermissionsResponse.data);
                        setRolePermissions(rolePermissionsResponse.data);
                    } else {
                        console.error('❌ Failed to load role permissions:', rolePermissionsResponse);
                        // If permissions fail to load due to auth issues, clear user and force re-login
                        if (rolePermissionsResponse.error === 'Unauthorized') {
                            console.log('🔄 Clearing user due to auth failure');
                            setCurrentUser(null);
                            localStorage.removeItem('currentUser');
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('refreshToken');
                            setView('ADMIN_LOGIN');
                        }
                    }
                    if (advertisementsResponse.success && advertisementsResponse.data) {
                        setAdvertisements(advertisementsResponse.data);
                    }
                    if (chartOfAccountsResponse.success && chartOfAccountsResponse.data) {
                        setChartOfAccounts(chartOfAccountsResponse.data);
                    }
                    if (telegramConfigResponse.success && telegramConfigResponse.data) {
                        setTelegramConfig(telegramConfigResponse.data);
                    }
                    if (whatsAppBotConfigResponse.success && whatsAppBotConfigResponse.data) {
                        setWhatsAppBotConfig(whatsAppBotConfigResponse.data);
                    }
                    if (activityLogsResponse.success && activityLogsResponse.data) {
                        setActivityLogs(activityLogsResponse.data);
                    }
                    if (rateLimitsResponse.success && rateLimitsResponse.data) {
                        setRateLimits(rateLimitsResponse.data);
                    }
                    if (refundsResponse.success && refundsResponse.data) {
                        setRefunds(refundsResponse.data);
                    }
                    if (ticketsResponse.success && ticketsResponse.data) {
                        setTickets(ticketsResponse.data);
                    }
                    if (expensesResponse.success && expensesResponse.data) {
                        setExpenses(expensesResponse.data);
                    }
                    } catch (error) {
                        console.error('Error loading admin data:', error);
                        // If admin data fails to load due to auth issues, clear user and force re-login
                        if (error instanceof Error && error.message === 'Unauthorized') {
                            console.log('🔄 Clearing user due to auth failure in admin data');
                            setCurrentUser(null);
                            localStorage.removeItem('currentUser');
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('refreshToken');
                            setView('ADMIN_LOGIN');
                        }
                    }
                }

            } catch (error) {
                console.error('🔍 Error loading initial data:', error);
                console.error('🔍 Error details:', error);
            } finally {
                setIsLoading(false);
                console.log('🔍 loadInitialData finished');
            }
        };

        loadInitialData();
    }, [currentUser, language, setSiteContent, setPopularRoutes, setUsers, setBookings, setAllFlights, setAirlines, setAircrafts, setFlightClasses, setAirports, setCommissionModels, setCurrencies, setRefundPolicies, setTenants, setCountries, setRolePermissions, setAdvertisements, setChartOfAccounts, setTelegramConfig, setWhatsAppBotConfig, setRateLimits, setRefunds, setTickets, setExpenses]);

    const logActivity = useCallback((user: User | null, action: string) => {
        if (!user) return;
        const newLog: ActivityLog = {
            id: `log-${Date.now()}`,
            user: { id: user.id, name: user.name },
            action,
            timestamp: new Date().toISOString(),
        };
        setActivityLogs(prev => {
            // Ensure prev is always an array
            if (!Array.isArray(prev)) {
                return [newLog];
            }
            return [newLog, ...prev];
        });
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
            bookingId: booking.id,
        };
        setJournalEntries(prev => {
            // Ensure prev is always an array
            if (!Array.isArray(prev)) {
                return [newEntry];
            }
            return [newEntry, ...prev];
        });
    }, [commissionModels, t]);

    const handleUpdateRefund = useCallback(async (refundId: string, action: 'expert_approve' | 'financial_approve' | 'process_payment' | 'reject', reason?: string) => {
        if (!currentUser) return;
        
        try {
            const response = await apiService.updateRefund(refundId, action, reason);
            if (!response.success) {
                alert(response.error || 'خطا در به‌روزرسانی استرداد');
                return;
            }
        } catch (error) {
            console.error('Update refund error:', error);
            alert('خطا در به‌روزرسانی استرداد');
            return;
        }
        
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

    }, [currentUser, refunds, bookings, users, logActivity, t, createBookingJournalEntry, telegramConfig, setRefunds, setUsers, setCurrentUser, setBookings]);

    const handleSearch = useCallback(async (query: SearchQuery) => {
        setIsLoading(true);
        setSearchQuery(query);
        console.log('🔍 Starting search with query:', query);
        
        try {
            // First, search local flights (including newly created ones)
            const fromCityFa = airports.find(a => a.city[language] === query.from)?.city.fa.toLowerCase();
            const toCityFa = airports.find(a => a.city[language] === query.to)?.city.fa.toLowerCase();
            
            console.log('🔍 Searching local flights for:', { fromCityFa, toCityFa, departureDate: query.departureDate });
            
            const localResults = allFlights.filter(flight => {
                if (!flight || !flight.departure || !flight.arrival) return false;
                
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
            
            console.log('🔍 Local search results:', localResults.length, 'flights found');
            
            // Then try backend API search for additional flights
            const searchParams = {
                from: query.from,
                to: query.to,
                departureDate: query.departureDate,
                adults: query.passengers?.adults || 1,
                children: query.passengers?.children || 0,
                infants: query.passengers?.infants || 0,
            };
            console.log('🔍 Backend search params:', searchParams);
            
            let backendResults: Flight[] = [];
            try {
                const response = await apiService.searchFlights(searchParams);
                console.log('🔍 Backend search response:', response);
                console.log('🔍 Backend search response success:', response.success);
                console.log('🔍 Backend search response data:', response.data);
                console.log('🔍 Backend search response data length:', response.data?.length);
                
                if (response.success && response.data) {
                    backendResults = response.data;
                    console.log('🔍 Backend search results:', backendResults.length, 'flights found');
                    console.log('🔍 Backend search results data:', backendResults);
                } else {
                    console.log('🔍 Backend search response failed:', response.error);
                }
            } catch (backendError) {
                console.log('🔍 Backend search failed, using local results only:', backendError);
            }
            
            // Combine local and backend results, removing duplicates
            const allResults = [...localResults];
            backendResults.forEach(backendFlight => {
                const exists = allResults.some(localFlight => localFlight.id === backendFlight.id);
                if (!exists) {
                    allResults.push(backendFlight);
                }
            });
            
            // Add mock flight for demonstration if no results found
            if (allResults.length === 0) {
                const mockFlight = {
                    id: 'demo-1',
                    airline: { name: 'ایران ایر' },
                    flightNumber: 'IR123',
                    departureAirport: { 
                        city: { fa: query.from || 'تهران' }, 
                        iataCode: 'IKA' 
                    },
                    arrivalAirport: { 
                        city: { fa: query.to || 'مشهد' }, 
                        iataCode: 'MHD' 
                    },
                    departureTime: query.departureDate ? `${query.departureDate}T08:00:00.000Z` : '2025-09-17T08:00:00.000Z',
                    arrivalTime: query.departureDate ? `${query.departureDate}T09:30:00.000Z` : '2025-09-17T09:30:00.000Z',
                    price: 2500000,
                    currency: 'IRR',
                    duration: '1h 30m',
                    stops: 0,
                    flightClass: 'اقتصادی',
                    availableSeats: 150,
                    totalCapacity: 150,
                    taxes: 0
                };
                allResults.push(mockFlight);
            }
            
            console.log('🔍 Final search results:', allResults.length, 'flights');
            console.log('🔍 Final search results data:', allResults);
            setFlights(allResults);
            console.log('🔍 setFlights called with:', allResults.length, 'flights');
            
            // If no local results and backend failed, try Gemini fallback
            if (localResults.length === 0 && backendResults.length === 0) {
                try {
                    const geminiFlights = await generateFlights(query, language);
                    const geminiResults = geminiFlights.map(f => ({
                        ...f,
                        sourcingType: FlightSourcingType.WebService,
                        status: FlightStatus.SCHEDULED,
                        bookingClosesBeforeDepartureHours: 3,
                        commissionModelId: 'CM-2',
                        refundPolicyId: 'RP-1',
                    }));
                    setFlights([...allResults, ...geminiResults]);
                } catch (e) {
                    console.error(e);
                    alert(t('flightSearch.geminiError'));
                }
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('خطا در جستجوی پروازها');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, setAllFlights, setFlights, setSearchQuery, setIsLoading, airports, language, t, allFlights]);

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

    const handlePassengerDetailsSubmit = useCallback((data: PassengerData) => {
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
        setView('CONFIRMATION');
    }, [currentUser, users, setUsers, setCurrentUser, logActivity, t, setPassengersData, setView]);

    const handleBackToPassengerDetails = () => {
        setView('PASSENGER_DETAILS');
    };
    
    const handleConfirmBooking = useCallback(async () => {
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

        try {
            const bookingData = {
                flightId: selectedFlight.id,
                passengers: {
                    adults: passengersData.adults,
                    children: passengersData.children,
                    infants: passengersData.infants,
                },
                contactEmail: passengersData.contactEmail,
                contactPhone: passengersData.contactPhone,
            };

            const response = await apiService.createBooking(bookingData);
            
            if (response.success && response.data) {
                const newBooking = response.data.booking;
                setBookings(prev => [newBooking, ...prev]);

                if (telegramConfig.isEnabled && telegramConfig.notifyOn.newBooking) {
                    const message = `✅ *New Booking!*\n\nRef ID: \`${newBooking.id}\`\n✈️ Flight: ${selectedFlight.flightNumber} (${selectedFlight.departure.city} to ${selectedFlight.arrival.city})\n👤 Customer: ${currentUser.name}\n💰 Total: ${formatNumber(totalPrice)} IRR`;
                    sendTelegramMessage(telegramConfig, message);
                }
                
                if (whatsAppBotConfig.isEnabled && whatsAppBotConfig.notifyOn.bookingSuccess) {
                    const flightInfo = `${selectedFlight.flightNumber} (${selectedFlight.departure.city} -> ${selectedFlight.arrival.city})`;
                    const passengerNames = passengersData.adults.map(p => `${p.firstName} ${p.lastName}`).join(', ');
                    const message = t('whatsapp.bookingSuccessMessage', newBooking.id, flightInfo, passengerNames);
                    sendWhatsAppMessage(whatsAppBotConfig, passengersData.contactPhone, message);
                }

                logActivity(currentUser, t('activityLog.bookingSuccess', newBooking.id));
                createBookingJournalEntry(newBooking, 'create');
                
                setSelectedFlight(null);
                setPassengersData(null);
                
                alert(t('bookingReview.bookingSuccess', newBooking.id));
                setView('SEARCH');
            } else {
                alert(response.error || t('bookingReview.error'));
            }
        } catch (error) {
            console.error('Booking error:', error);
            alert(t('bookingReview.error'));
        }
    }, [selectedFlight, passengersData, searchQuery, currentUser, telegramConfig, whatsAppBotConfig, logActivity, createBookingJournalEntry, t, formatNumber, setBookings, setSelectedFlight, setPassengersData, setView, sendTelegramMessage, sendWhatsAppMessage]);

    const handleLogin = async (username: string, pass: string): Promise<boolean> => {
        try {
            const response = await apiService.login(username, pass);
            if (response.success && response.data) {
                const userData = response.data.user;
                
                // Load user wallet if user is regular user
                if (userData.role === UserRole.USER) {
                    try {
                        const walletResponse = await apiService.getUserWallet();
                        if (walletResponse.success && walletResponse.data) {
                            userData.wallet = walletResponse.data;
                        }
                    } catch (walletError) {
                        console.error('Failed to load user wallet:', walletError);
                        // Continue with login even if wallet fails
                    }
                }
                
                setCurrentUser(userData);
                logActivity(userData, t('activityLog.loggedIn'));
                if (selectedFlight) {
                    setView('PASSENGER_DETAILS');
                }
                else {
                    setView('PROFILE');
                }
                setLoginError(null);
                return true;
            }
            else {
                setLoginError(response.error || t('login.errors.invalid'));
                return false;
            }
        }
        catch (error) {
            setLoginError(t('login.errors.invalid'));
            return false;
        }
    };
    
    const handleAdminLogin = async (email: string, pass: string): Promise<boolean> => {
        try {
            console.log('Admin login attempt with:', email);
            const response = await apiService.login(email, pass);
            console.log('Admin login response:', response);
            if (response.success && response.data) {
                const userData = response.data.user;
                console.log('User data:', userData);
                console.log('User role:', userData.role);
                if (userData.role !== 'USER') {
                    console.log('User is admin, setting current user and view');
                    setCurrentUser(userData);
                    logActivity(userData, t('activityLog.adminLoggedIn'));
                    console.log('Setting view to PROFILE for admin');
                    setView('PROFILE'); // Will show dashboard
                    setLoginError(null);
                    console.log('Admin login successful, view should be PROFILE');
                    return true;
                }
                else {
                    console.log('User is not admin, showing error');
                    setLoginError('شما مجوز دسترسی به پنل ادمین را ندارید');
                    return false;
                }
            }
            else {
                console.log('Login failed:', response.error);
                setLoginError(response.error || t('login.errors.invalid'));
                return false;
            }
        }
        catch (error) {
            console.error('Admin login error:', error);
            setLoginError(t('login.errors.invalid'));
            return false;
        }
    };

    const handleSignup = async (name: string, username: string, email: string, pass: string, phone: string) => {
        try {
            const response = await apiService.signup({ name, username, email, password: pass, phone });
            if (response.success && response.data) {
                const userData = response.data.user;
                setCurrentUser(userData);
                logActivity(userData, t('activityLog.userCreated', userData.name));
        
                if (telegramConfig.isEnabled && telegramConfig.notifyOn.newUser) {
                    const message = `🎉 *New User Signup!*\n\nName: ${userData.name}\nUsername: \`${userData.username}\`\nEmail: ${userData.email}`;
                    sendTelegramMessage(telegramConfig, message);
                }

                if (selectedFlight) {
                    setView('PASSENGER_DETAILS');
                }
                else {
                    setView('PROFILE');
                }
            }
            else {
                alert(response.error || 'خطا در ثبت‌نام');
            }
        }
        catch (error) {
            alert('خطا در ثبت‌نام');
        }
    };
    
    const handleLogout = async () => {
        try {
            await apiService.logout();
            logActivity(currentUser, t('activityLog.loggedOut'));
            setCurrentUser(null);
            setView('SEARCH');
        }
        catch (error) {
            console.error('Logout error:', error);
            // Force logout even if API call fails
            setCurrentUser(null);
            setView('SEARCH');
        }
    };

    const handleUpdateUser = useCallback(async (userId: string, name: string, role: UserRole, status: UserStatus, canBypassRateLimit: boolean, displayCurrencies: Currency[], tenantId?: string) => {
        if (!currentUser) return;
        
        try {
            const response = await apiService.updateUser(userId, { name, role, status, canBypassRateLimit, displayCurrencies, tenantId });
            if (response.success) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, name, role, status, canBypassRateLimit, displayCurrencies, tenantId } : u));
                if (currentUser.id === userId) {
                    setCurrentUser(prevUser => {
                        if (!prevUser) return null;
                        return { ...prevUser, name, role, status, canBypassRateLimit, displayCurrencies: (displayCurrencies), tenantId };
                    });
                }
                logActivity(currentUser, `کاربر ${name} به‌روزرسانی شد`);
            }
            else {
                alert(response.error || 'خطا در به‌روزرسانی کاربر');
            }
        }
        catch (error) {
            console.error('Update user error:', error);
            alert('خطا در به‌روزرسانی کاربر');
        }
    }, [currentUser, setUsers, setCurrentUser, logActivity]);
    
    const handleUpdateTelegramConfig = useCallback(async (config: TelegramBotConfig) => {
        try {
            const response = await apiService.updateTelegramConfig(config);
            if (response.success) {
                setTelegramConfig(config);
                logActivity(currentUser, 'تنظیمات ربات تلگرام به‌روزرسانی شد');
                alert('تنظیمات ربات تلگرام با موفقیت به‌روزرسانی شد');
            }
            else {
                alert(response.error || 'خطا در به‌روزرسانی تنظیمات تلگرام');
            }
        }
        catch (error) {
            console.error('Update telegram config error:', error);
            alert('خطا در به‌روزرسانی تنظیمات تلگرام');
        }
    }, [currentUser, setTelegramConfig, logActivity]);
    
    const handleUpdateWhatsAppBotConfig = useCallback(async (config: WhatsAppBotConfig) => {
        try {
            const response = await apiService.updateWhatsAppConfig(config);
            if (response.success) {
                setWhatsAppBotConfig(config);
                logActivity(currentUser, 'تنظیمات ربات واتس‌اپ به‌روزرسانی شد');
                alert('تنظیمات ربات واتس‌اپ با موفقیت به‌روزرسانی شد');
            }
            else {
                alert(response.error || 'خطا در به‌روزرسانی تنظیمات واتس‌اپ');
            }
        }
        catch (error) {
            console.error('Update whatsapp config error:', error);
            alert('خطا در به‌روزرسانی تنظیمات واتس‌اپ');
        }
    }, [currentUser, setWhatsAppBotConfig, logActivity]);
    const handleUpdateRolePermissions = useCallback(async (newPermissions: RolePermissions) => {
        try {
            const response = await apiService.updatePermissions(newPermissions);
            if (response.success) {
                setRolePermissions(newPermissions);
                logActivity(currentUser, 'مجوزهای نقش‌ها به‌روزرسانی شد');
                alert('مجوزها با موفقیت به‌روزرسانی شد');
            }
            else {
                alert(response.error || 'خطا در به‌روزرسانی مجوزها');
            }
        }
        catch (error) {
            console.error('Update permissions error:', error);
            alert('خطا در به‌روزرسانی مجوزها');
        }
    }, [currentUser, setRolePermissions, logActivity]);
    const handleCreateAdvertisement = useCallback(async (ad: Omit<Advertisement, 'id'>) => {
        try {
            const response = await apiService.createAdvertisement(ad);
            if (response.success) {
                setAdvertisements(prev => [...prev, { ...ad, id: `ad-${Date.now()}` }]);
                logActivity(currentUser, 'تبلیغ جدید ایجاد شد');
                alert('تبلیغ با موفقیت ایجاد شد');
            }
            else {
                alert(response.error || 'خطا در ایجاد تبلیغ');
            }
        }
        catch (error) {
            console.error('Create advertisement error:', error);
            alert('خطا در ایجاد تبلیغ');
        }
    }, [currentUser, setAdvertisements, logActivity]);
    const handleUpdateAdvertisement = useCallback(async (ad: Advertisement) => {
        try {
            const response = await apiService.updateAdvertisement(ad.id, ad);
            if (response.success) {
                setAdvertisements(prev => prev.map(a => a.id === ad.id ? ad : a));
                logActivity(currentUser, 'تبلیغ به‌روزرسانی شد');
                alert('تبلیغ با موفقیت به‌روزرسانی شد');
            }
            else {
                alert(response.error || 'خطا در به‌روزرسانی تبلیغ');
            }
        }
        catch (error) {
            console.error('Update advertisement error:', error);
            alert('خطا در به‌روزرسانی تبلیغ');
        }
    }, [currentUser, setAdvertisements, logActivity]);
    
    const handleDeleteAdvertisement = useCallback(async (adId: string) => {
        try {
            const response = await apiService.deleteAdvertisement(adId);
            if (response.success) {
                setAdvertisements(prev => prev.filter(a => a.id !== adId));
                logActivity(currentUser, 'تبلیغ حذف شد');
                alert('تبلیغ با موفقیت حذف شد');
            }
            else {
                alert(response.error || 'خطا در حذف تبلیغ');
            }
        }
        catch (error) {
            console.error('Delete advertisement error:', error);
            alert('خطا در حذف تبلیغ');
        }
    }, [currentUser, setAdvertisements, logActivity]);
    const handleUpdateSiteContent = useCallback(async (newContent: SiteContent) => {
        try {
            const response = await apiService.updateAdminContent(newContent);
            if (response.success) {
                setSiteContent(newContent);
                logActivity(currentUser, 'محتوای سایت به‌روزرسانی شد');
                alert('محتوای سایت با موفقیت به‌روزرسانی شد');
            }
            else {
                alert(response.error || 'خطا در به‌روزرسانی محتوا');
            }
        }
        catch (error) {
            console.error('Update content error:', error);
            alert('خطا در به‌روزرسانی محتوا');
        }
    }, [currentUser, setSiteContent, logActivity]);
    const handleUpdateBooking = useCallback(async (booking: Booking) => {
        try {
            const response = await apiService.updateBooking(booking.id, booking);
            if (response.success) {
                setBookings(prev => prev.map(b => b.id === booking.id ? booking : b));
                logActivity(currentUser, `رزرو ${booking.id} به‌روزرسانی شد`);
                alert('رزرو با موفقیت به‌روزرسانی شد');
            }
            else {
                alert(response.error || 'خطا در به‌روزرسانی رزرو');
            }
        }
        catch (error) {
            console.error('Update booking error:', error);
            alert('خطا در به‌روزرسانی رزرو');
        }
    }, [currentUser, setBookings, logActivity]);
    const handleResetUserPassword = useCallback(async (userId: string, newPass: string) => {
        try {
            const response = await apiService.resetUserPassword(userId, newPass);
            if (response.success) {
                // Don't update password in state for security
                logActivity(currentUser, `رمز عبور کاربر ${userId} تغییر یافت`);
                alert('رمز عبور با موفقیت تغییر یافت');
            }
            else {
                alert(response.error || 'خطا در تغییر رمز عبور');
            }
        }
        catch (error) {
            console.error('Reset password error:', error);
            alert('خطا در تغییر رمز عبور');
        }
    }, [currentUser, logActivity]);
    const handleChargeUserWallet = useCallback(async (userId: string, amount: number, currency: Currency, description: string) => {
        try {
            const response = await apiService.chargeUserWallet(userId, { amount, currency, description });
            if (response.success) {
                // Update user wallet in state
                setUsers(prev => prev.map(u => {
                    if (u.id === userId && u.wallet && u.wallet[currency]) {
                        return {
                            ...u,
                            wallet: {
                                ...u.wallet,
                                [currency]: {
                                    ...u.wallet[currency],
                                    balance: u.wallet[currency].balance + amount
                                }
                            }
                        };
                    }
                    return u;
                }));
                logActivity(currentUser, `کیف پول کاربر ${userId} شارژ شد: ${amount} ${currency}`);
                alert(`کیف پول با موفقیت شارژ شد: ${amount} ${currency}`);
            }
            else {
                alert(response.error || 'خطا در شارژ کیف پول');
            }
        }
        catch (error) {
            console.error('Charge wallet error:', error);
            alert('خطا در شارژ کیف پول');
        }
    }, [currentUser, setUsers, logActivity]);
    const handleCreateUser = useCallback(async (newUser: Omit<User, 'id' | 'wallet' | 'createdAt' | 'canBypassRateLimit'>) => {
        try {
            const response = await apiService.createUser(newUser);
            if (response.success) {
                const createdUser = response.data.user;
                setUsers(prev => [...prev, createdUser]);
                logActivity(currentUser, `کاربر جدید ${createdUser.name} ایجاد شد`);
            }
            else {
                alert(response.error || 'خطا در ایجاد کاربر');
            }
        }
        catch (error) {
            console.error('Create user error:', error);
            alert('خطا در ایجاد کاربر');
        }
    }, [currentUser, setUsers, logActivity]);
    const handleUpdateTicket = useCallback(async (ticket: Ticket) => {
        try {
            const response = await apiService.updateTicketStatus(ticket.id, ticket.status);
            if (response.success) {
                setTickets(prev => prev.map(t => t.id === ticket.id ? ticket : t));
                logActivity(currentUser, `تیکت ${ticket.id} به‌روزرسانی شد`);
            }
            else {
                alert(response.error || 'خطا در به‌روزرسانی تیکت');
            }
        }
        catch (error) {
            console.error('Update ticket error:', error);
            alert('خطا در به‌روزرسانی تیکت');
        }
    }, [currentUser, setTickets, logActivity]);
    const handleAddMessageToTicket = useCallback(async (ticketId: string, message: TicketMessage) => {
        try {
            const response = await apiService.adminReplyToTicket(ticketId, message.text, {});
            if (response.success) {
                setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, messages: [...t.messages, message], updatedAt: new Date().toISOString() } : t));
                logActivity(currentUser, `پیام ادمین به تیکت ${ticketId} اضافه شد`);
            }
            else {
                alert(response.error || 'خطا در ارسال پیام');
            }
        }
        catch (error) {
            console.error('Add message error:', error);
            alert('خطا در ارسال پیام');
        }
    }, [currentUser, setTickets, logActivity]);
    const handleUserAddMessageToTicket = useCallback(async (ticketId: string, messageText: string) => {
        if (!currentUser) return;
        const newMessage: TicketMessage = {
            id: `msg-${Date.now()}`,
            author: 'USER',
            authorName: currentUser.name,
            text: messageText,
            timestamp: new Date().toISOString(),
        };

        try {
            const response = await apiService.addMessageToTicket(ticketId, messageText);
            if (response.success && response.data) {
                // Re-opens the ticket if user replies
                setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, messages: [...t.messages, newMessage], status: response.data.ticketStatus || 'OPEN', updatedAt: new Date().toISOString() } : t));
            }
            else {
                alert(response.error || t('ticket.addMessageError'));
                return;
            }
        }
        catch (error) {
            console.error('Add message to ticket error:', error);
            alert(t('ticket.addMessageError'));
            return;
        }
    
        if (telegramConfig.isEnabled && telegramConfig.notifyOn.newTicket) {
            const ticket = tickets.find(t => t.id === ticketId);
            const message = `💬 *User Reply to Ticket*\n\nTicket ID: \`${ticketId}\`\nSubject: ${ticket?.subject}\nUser: ${currentUser.name}\n\n_${messageText}_`;
            sendTelegramMessage(telegramConfig, message);
        }
    }, [currentUser, telegramConfig, tickets, t, setTickets, sendTelegramMessage]);
    const handleCreateBasicData = useCallback(async (type: BasicDataType, data: any) => {
        try {
            const response = await apiService.createBasicData(type, data);
            if (response.success) {
                // Update appropriate state based on type using the actual response data
                switch (type) {
                    case 'airline':
                        setAirlines(prev => [...prev, response.data]);
                        // Force a small delay to ensure state propagation
                        setTimeout(() => {
                            console.log('🔄 Airline state update completed');
                        }, 100);
                        break;
                    case 'aircraft':
                        setAircrafts(prev => [...prev, response.data]);
                        break;
                    case 'airport':
                        setAirports(prev => [...prev, response.data]);
                        break;
                    case 'country':
                        const newCountry = response.data;
                        if (countries.some(c => c.id.toLowerCase() === newCountry.id.toLowerCase())) {
                            alert('Country with this ISO code already exists.');
                            return;
                        }
                        setCountries(prev => [...prev, newCountry].sort((a, b) => a.name.en.localeCompare(b.name.en)));
                        break;
                    case 'commissionModel':
                        setCommissionModels(prev => [...prev, response.data]);
                        break;
                    case 'currency':
                        setCurrencies(prev => [...prev, response.data]);
                        break;
                    case 'refundPolicy':
                        setRefundPolicies(prev => [...prev, response.data]);
                        break;
                    case 'flightClass':
                        setFlightClasses(prev => [...prev, response.data]);
                        break;
                }
                logActivity(currentUser, `${type} جدید ایجاد شد`);
                alert(`${type} با موفقیت ایجاد شد`);
            }
            else {
                alert(response.error || `خطا در ایجاد ${type}`);
            }
        }
        catch (error) {
            console.error('Create basic data error:', error);
            alert(`خطا در ایجاد ${type}`);
        }
    }, [countries, currentUser, setAirlines, setAircrafts, setAirports, setCountries, setCommissionModels, setCurrencies, setRefundPolicies, setFlightClasses, logActivity]);

    const handleUpdateBasicData = useCallback(async (type: BasicDataType, data: any, originalId?: string) => {
        try {
            const idToUse = originalId || data.id;
            const response = await apiService.updateBasicData(type, idToUse, data);
            if (response.success) {
                // Update appropriate state based on type using the actual response data
                switch (type) {
                    case 'airline':
                        setAirlines(prev => prev.map(item => item.id === idToUse ? response.data : item));
                        break;
                    case 'aircraft':
                        setAircrafts(prev => prev.map(item => item.id === idToUse ? response.data : item));
                        break;
                    case 'airport':
                        setAirports(prev => prev.map(item => item.id === idToUse ? response.data : item));
                        break;
                    case 'country':
                        setCountries(prev => prev.map(c => c.id === idToUse ? response.data : c));
                        break;
                    case 'commissionModel':
                        setCommissionModels(prev => prev.map(item => item.id === idToUse ? response.data : item));
                        break;
                    case 'currency':
                        setCurrencies(prev => prev.map(item => item.id === idToUse ? response.data : item));
                        break;
                    case 'refundPolicy':
                        setRefundPolicies(prev => prev.map(item => item.id === idToUse ? response.data : item));
                        break;
                    case 'flightClass':
                        setFlightClasses(prev => prev.map(item => item.id === idToUse ? response.data : item));
                        break;
                }
                logActivity(currentUser, `${type} به‌روزرسانی شد`);
                alert(`${type} با موفقیت به‌روزرسانی شد`);
            }
            else {
                alert(response.error || `خطا در به‌روزرسانی ${type}`);
            }
        }
        catch (error) {
            console.error('Update basic data error:', error);
            alert(`خطا در به‌روزرسانی ${type}`);
        }
    }, [currentUser, setAirlines, setAircrafts, setAirports, setCountries, setCommissionModels, setCurrencies, setRefundPolicies, setFlightClasses, logActivity]);

    const handleDeleteBasicData = useCallback(async (type: BasicDataType, id: string) => {
        try {
            const response = await apiService.deleteBasicData(type, id);
            if (response.success) {
                // Update appropriate state based on type
                switch (type) {
                    case 'airline':
                        setAirlines(prev => prev.filter(item => item.id !== id));
                        break;
                    case 'aircraft':
                        setAircrafts(prev => prev.filter(item => item.id !== id));
                        break;
                    case 'airport':
                        setAirports(prev => prev.filter(item => item.id !== id));
                        break;
                    case 'country':
                        setCountries(prev => prev.filter(c => c.id !== id));
                        break;
                    case 'commissionModel':
                        setCommissionModels(prev => prev.filter(item => item.id !== id));
                        break;
                    case 'currency':
                        setCurrencies(prev => prev.filter(item => item.id !== id));
                        break;
                    case 'refundPolicy':
                        setRefundPolicies(prev => prev.filter(item => item.id !== id));
                        break;
                }
                logActivity(currentUser, `${type} حذف شد`);
                alert(`${type} با موفقیت حذف شد`);
            }
            else {
                alert(response.error || `خطا در حذف ${type}`);
            }
        }
        catch (error) {
            console.error('Delete basic data error:', error);
            alert(`خطا در حذف ${type}`);
        }
    }, [currentUser, setAirlines, setAircrafts, setAirports, setCountries, setCommissionModels, setCurrencies, setRefundPolicies, logActivity]);
    const onCreateRateLimit = useCallback(async (data: any) => {
        try {
            const response = await apiService.createRateLimit(data);
            if (response.success) {
                setRateLimits(prev => [...prev, { ...data, id: `rl-${Date.now()}` }]);
                logActivity(currentUser, 'محدودیت قیمت جدید ایجاد شد');
                alert('محدودیت قیمت با موفقیت ایجاد شد');
            }
            else {
                alert(response.error || 'خطا در ایجاد محدودیت قیمت');
            }
        }
        catch (error) {
            console.error('Create rate limit error:', error);
            alert('خطا در ایجاد محدودیت قیمت');
        }
    }, [currentUser, setRateLimits, logActivity]);
    
    const onUpdateRateLimit = useCallback(async (data: any) => {
        try {
            const response = await apiService.updateRateLimit(data.id, data);
            if (response.success) {
                setRateLimits(prev => prev.map(item => item.id === data.id ? item : data));
                logActivity(currentUser, 'محدودیت قیمت به‌روزرسانی شد');
                alert('محدودیت قیمت با موفقیت به‌روزرسانی شد');
            }
            else {
                alert(response.error || 'خطا در به‌روزرسانی محدودیت قیمت');
            }
        }
        catch (error) {
            console.error('Update rate limit error:', error);
            alert('خطا در به‌روزرسانی محدودیت قیمت');
        }
    }, [currentUser, setRateLimits, logActivity]);
    
    const onDeleteRateLimit = useCallback(async (id: string) => {
        try {
            const response = await apiService.deleteRateLimit(id);
            if (response.success) {
                setRateLimits(prev => prev.filter(item => item.id !== id));
                logActivity(currentUser, 'محدودیت قیمت حذف شد');
                alert('محدودیت قیمت با موفقیت حذف شد');
            }
            else {
                alert(response.error || 'خطا در حذف محدودیت قیمت');
            }
        }
        catch (error) {
            console.error('Delete rate limit error:', error);
            alert('خطا در حذف محدودیت قیمت');
        }
    }, [currentUser, setRateLimits, logActivity]);
    const onCreateFlight = useCallback(async (flightData: Omit<Flight, 'id' | 'creatorId'>) => {
        try {
            const response = await apiService.createFlight(flightData);
            if (response.success && response.data) {
                // The backend now returns the properly formatted flight data directly
                const newFlight = response.data;
                console.log('🆕 New flight created:', newFlight);
                
                setAllFlights(prev => {
                    console.log('📋 Previous flights count:', prev.length);
                    // Check if flight already exists to avoid duplicates
                    const exists = prev.some(f => f && f.id === newFlight.id);
                    if (exists) {
                        console.log('⚠️ Flight already exists, not adding duplicate');
                        return prev;
                    }
                    const updatedFlights = [...prev, newFlight];
                    console.log('✅ Updated flights count:', updatedFlights.length);
                    return updatedFlights;
                });
                
                // Force a small delay to ensure state propagation
                setTimeout(() => {
                    console.log('🔄 State update completed');
                }, 100);
                logActivity(currentUser, `پرواز جدید ${newFlight.flightNumber || 'نامشخص'} ایجاد شد`);
                alert('پرواز با موفقیت ایجاد شد');
            }
            else {
                alert(response.error || 'خطا در ایجاد پرواز');
            }
        }
        catch (error) {
            console.error('Create flight error:', error);
            alert('خطا در ایجاد پرواز');
        }
    }, [currentUser, setAllFlights, logActivity]);
    const onUpdateFlight = useCallback(async (updatedFlight: Flight) => {
        const originalFlight = allFlights.find(f => f.id === updatedFlight.id);
        if (!originalFlight) return;

        try {
            const response = await apiService.updateFlight(updatedFlight.id, updatedFlight);
            if (response.success && response.data) {
                // Use the response data which should be properly formatted
                const updatedFlightData = response.data;
                setAllFlights(prev => prev.map(f => f.id === updatedFlight.id ? updatedFlightData : f));
                logActivity(currentUser, t('activityLog.flightUpdated', updatedFlightData.flightNumber));
                alert('پرواز با موفقیت به‌روزرسانی شد');
            }
            else {
                alert(response.error || 'خطا در به‌روزرسانی پرواز');
            }
        }
        catch (error) {
            console.error('Update flight error:', error);
            alert('خطا در به‌روزرسانی پرواز');
        }

        if (whatsAppBotConfig.isEnabled && whatsAppBotConfig.notifyOn.flightChange && originalFlight) {
            let changeMessage = '';
            if (originalFlight.status !== updatedFlight.status) {
                changeMessage = t('whatsapp.flightChange.status', t(`dashboard.flights.statusValues.${updatedFlight.status}`));
            }
            else if (originalFlight.departure.dateTime !== updatedFlight.departure.dateTime) {
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
    }, [allFlights, bookings, whatsAppBotConfig, currentUser, logActivity, t, formatDate, formatTime, setAllFlights, setBookings, sendWhatsAppMessage]);
    const onDeleteFlight = useCallback(async (flightId: string) => {
        try {
            const response = await apiService.deleteFlight(flightId);
            if (response.success) {
                const deletedFlight = allFlights.find(f => f && f.id === flightId);
                setAllFlights(prev => prev.filter(f => f && f.id !== flightId));
                // Wait a bit for state to update
                await new Promise(resolve => setTimeout(resolve, 100));
                logActivity(currentUser, `پرواز ${deletedFlight?.flightNumber} حذف شد`);
                alert('پرواز با موفقیت حذف شد');
            }
            else {
                alert(response.error || 'خطا در حذف پرواز');
            }
        }
        catch (error) {
            console.error('Delete flight error:', error);
            alert('خطا در حذف پرواز');
        }
    }, [allFlights, currentUser, setAllFlights, logActivity]);
    const onManualBookingCreate = useCallback(async () => { return null; }, []);
    const onCreateExpense = useCallback(async (expenseData: any) => {
        try {
            const response = await apiService.createExpense(expenseData);
            if (response.success) {
                setExpenses(prev => [...prev, { ...expenseData, id: `exp-${Date.now()}` }]);
                logActivity(currentUser, 'هزینه جدید ایجاد شد');
                alert('هزینه با موفقیت ایجاد شد');
            }
            else {
                alert(response.error || 'خطا در ایجاد هزینه');
            }
        }
        catch (error) {
            console.error('Create expense error:', error);
            alert('خطا در ایجاد هزینه');
        }
    }, [currentUser, setExpenses, logActivity]);
    
    const onExitAdmin = useCallback(() => setView('SEARCH'), [setView]);
    
    const onCreateAccount = useCallback(async (newAccount: any) => {
        try {
            const response = await apiService.createAccount(newAccount);
            if (response.success) {
                setChartOfAccounts(prev => [...prev, { ...newAccount, id: `acc-${Date.now()}` }]);
                logActivity(currentUser, 'حساب جدید ایجاد شد');
                alert('حساب با موفقیت ایجاد شد');
                return true;
            }
            else {
                alert(response.error || 'خطا در ایجاد حساب');
                return false;
            }
        }
        catch (error) {
            console.error('Create account error:', error);
            alert('خطا در ایجاد حساب');
            return false;
        }
    }, [currentUser, setChartOfAccounts, logActivity]);
    
    const onUpdateAccount = useCallback(async (updatedAccount: any) => {
        try {
            const response = await apiService.updateAccount(updatedAccount.id, updatedAccount);
            if (response.success) {
                setChartOfAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? acc : updatedAccount));
                logActivity(currentUser, 'حساب به‌روزرسانی شد');
                alert('حساب با موفقیت به‌روزرسانی شد');
            }
            else {
                alert(response.error || 'خطا در به‌روزرسانی حساب');
            }
        }
        catch (error) {
            console.error('Update account error:', error);
            alert('خطا در به‌روزرسانی حساب');
        }
    }, [currentUser, setChartOfAccounts, logActivity]);
    const onCancelBooking = useCallback(async (bookingId: string) => {
        if (!currentUser) return;

        try {
            const response = await apiService.cancelBooking(bookingId);
            if (response.success) {
                setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
                logActivity(currentUser, t('activityLog.bookingCancelled', bookingId));
                alert(t('bookingCancellation.success', bookingId));
            }
            else {
                alert(response.error || t('bookingCancellation.error'));
            }
        }
        catch (error) {
            console.error('Booking cancellation error:', error);
            alert(t('bookingCancellation.error'));
        }
    }, [currentUser, t, logActivity, setBookings]);
    const onUpdateProfile = useCallback(async (updates: { name?: string; currentPassword?: string; newPassword?: string; }) => {
        if (!currentUser) return { success: false, message: t('profile.update.error') };

        try {
            const response = await apiService.updateProfile(updates);
            if (response.success && response.data) {
                // Only update name in local state for security reasons (passwords are not stored client-side)
                setCurrentUser(prevUser => {
                    if (!prevUser) return null;
                    return { ...prevUser, name: response.data.user.name || prevUser.name };
                });
                logActivity(currentUser, t('activityLog.profileUpdated'));
                return { success: true, message: t('profile.update.success') };
            }
            else {
                return { success: false, message: response.error || t('profile.update.error') };
            }
        }
        catch (error) {
            console.error('Update profile error:', error);
            return { success: false, message: t('profile.update.error') };
        }
    }, [currentUser, t, logActivity, setCurrentUser]);
    const onCreateTicket = useCallback(async (ticketData: any) => {
        if (!currentUser) {
            alert('خطا: کاربر وارد نشده است');
            return { success: false };
        }
        
        try {
            // Ensure ticketData has the correct format
            const formattedTicketData = {
                subject: ticketData.subject || '',
                message: ticketData.message || '',
                bookingId: ticketData.bookingId || null,
                userId: currentUser.id
            };
            
            const response = await apiService.createTicket(formattedTicketData);
            if (response.success && response.data) {
                const newTicket = response.data.ticket;
                setTickets(prev => [...prev, newTicket]);
                logActivity(currentUser, `تیکت جدید ${newTicket.subject} ایجاد شد`);
                alert('تیکت با موفقیت ایجاد شد');
                return { success: true, ticket: newTicket };
            }
            else {
                alert(response.error || 'خطا در ایجاد تیکت');
                return { success: false };
            }
        }
        catch (error) {
            console.error('Create ticket error:', error);
            alert('خطا در ایجاد تیکت');
            return { success: false };
        }
    }, [currentUser, setTickets, logActivity]);
    const onAddSavedPassenger = useCallback(async (passenger: Omit<SavedPassenger, 'id'>) => {
        if (!currentUser) return;
        try {
            const response = await apiService.addSavedPassenger(passenger);
            if (response.success && response.data) {
                const newPassenger = response.data.passenger;
                setCurrentUser(prevUser => {
                    if (!prevUser) return null;
                    return { ...prevUser, savedPassengers: [...(prevUser.savedPassengers || []), newPassenger] };
                });
                logActivity(currentUser, t('activityLog.savedPassengerAdded', `${newPassenger.firstName} ${newPassenger.lastName}`));
                alert(t('profile.savedPassengers.addSuccess'));
            }
            else {
                alert(response.error || t('profile.savedPassengers.addError'));
            }
        }
        catch (error) {
            console.error('Add saved passenger error:', error);
            alert(t('profile.savedPassengers.addError'));
        }
    }, [currentUser, t, logActivity, setCurrentUser]);
    const onUpdateSavedPassenger = useCallback(async (passenger: SavedPassenger) => {
        if (!currentUser) {
            alert('خطا: کاربر وارد نشده است');
            return;
        }
        
        // If passenger doesn't have an ID, it's a new passenger - use add instead
        if (!passenger.id) {
            const { id, ...passengerWithoutId } = passenger;
            onAddSavedPassenger(passengerWithoutId);
            return;
        }
        try {
            const response = await apiService.updateSavedPassenger(passenger.id, passenger);
            if (response.success) {
                setCurrentUser(prevUser => {
                    if (!prevUser) return null;
                    return {
                        ...prevUser,
                        savedPassengers: (prevUser.savedPassengers || []).map(p => p.id === passenger.id ? passenger : p),
                    };
                });
                logActivity(currentUser, t('activityLog.savedPassengerUpdated', `${passenger.firstName} ${passenger.lastName}`));
                alert(t('profile.savedPassengers.updateSuccess'));
            }
            else {
                alert(response.error || t('profile.savedPassengers.updateError'));
            }
        }
        catch (error) {
            console.error('Update saved passenger error:', error);
            alert(t('profile.savedPassengers.updateError'));
        }
    }, [currentUser, t, logActivity, setCurrentUser]);
    const onDeleteSavedPassenger = useCallback(async (passengerId: string) => {
        if (!currentUser) return;
        try {
            const response = await apiService.deleteSavedPassenger(passengerId);
            if (response.success) {
                setCurrentUser(prevUser => {
                    if (!prevUser) return null;
                    return {
                        ...prevUser,
                        savedPassengers: (prevUser.savedPassengers || []).filter(p => p.id !== passengerId),
                    };
                });
                logActivity(currentUser, t('activityLog.savedPassengerDeleted', passengerId));
                alert(t('profile.savedPassengers.deleteSuccess'));
            }
            else {
                alert(response.error || t('profile.savedPassengers.deleteError'));
            }
        }
        catch (error) {
            console.error('Delete saved passenger error:', error);
            alert(t('profile.savedPassengers.deleteError'));
        }
    }, [currentUser, t, logActivity, setCurrentUser]);

    const handleGoToProfile = useCallback(() => setView('PROFILE'), [setView]);
    const handleGoToSearch = useCallback(() => setView('SEARCH'), [setView]);

    const currentTenant = useMemo(() => tenants.find(t => t.id === currentUser?.tenantId) || tenants[0], [currentUser, tenants]);

    const renderContent = () => {
        console.log('Current view:', view, 'Current user:', currentUser);
        const step = view === 'SEARCH' ? 0 : view === 'PASSENGER_DETAILS' ? 1 : view === 'REVIEW' ? 2 : view === 'CONFIRMATION' ? 3 : -1;
        
        if (step !== -1 && searchQuery) {
             return (
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <BookingStepper steps={[t('stepper.selectFlight'), t('stepper.passengerDetails'), t('stepper.review'), t('stepper.confirmAndPay')]} activeStep={step} />
                    </div>
                    {view === 'PASSENGER_DETAILS' && selectedFlight && searchQuery && currentUser && <PassengerDetailsForm flight={selectedFlight} query={searchQuery} user={currentUser} currencies={currencies} onBack={handleBackToSearch} onSubmit={handlePassengerDetailsSubmit} />}
                    {view === 'REVIEW' && selectedFlight && searchQuery && passengersData && currentUser && <BookingReview flight={selectedFlight} query={searchQuery} passengers={passengersData} user={currentUser} onBack={handleBackToPassengerDetails} onConfirmBooking={handleConfirmBooking} currencies={currencies} />}
                    {view === 'CONFIRMATION' && selectedFlight && searchQuery && passengersData && currentUser && <BookingConfirmation flight={selectedFlight} query={searchQuery} passengerData={passengersData} user={currentUser} currencies={currencies} onBack={handleBackToPassengerDetails} onConfirm={handleConfirmBooking} />}
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
                        
    
                        
                        
                        {searchQuery ? (
                            <SearchResults flights={flights} onSelectFlight={handleSelectFlight} refundPolicies={refundPolicies} advertisements={advertisements} currentUser={currentUser} currencies={currencies} popularRoutes={popularRoutes} onSearch={handleSearch} />
                        ) : (
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
                if (currentUser.role === UserRole.USER) {
                    return <ProfilePage user={currentUser} bookings={bookings.filter(b => b.user?.id === currentUser.id)} tickets={tickets.filter(t => t.user?.id === currentUser.id)} currencies={currencies} refundPolicies={refundPolicies} onLogout={handleLogout} onCancelBooking={onCancelBooking} onUpdateProfile={onUpdateProfile} onCreateTicket={onCreateTicket} onUserAddMessageToTicket={handleUserAddMessageToTicket} onAddSavedPassenger={onAddSavedPassenger} onUpdateSavedPassenger={onUpdateSavedPassenger} onDeleteSavedPassenger={onDeleteSavedPassenger} />;
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
            case 'CURRENCY_CONVERTER':
                return <CurrencyConverter currencies={currencies} />;
            default:
                return null;
        }
    };

    return (
        <div className={`App font-sans`} data-lang={language}>
            <Header user={currentUser} tenant={currentTenant} onLoginClick={() => setView('LOGIN')} onLogout={handleLogout} onProfileClick={handleGoToProfile} onLogoClick={handleGoToSearch} onCurrencyConverterClick={() => setView('CURRENCY_CONVERTER')} />
            <main className="bg-secondary min-h-[calc(100vh-128px)]">
                {isLoading ? <LoadingSpinner /> : renderContent()}
            </main>
            <Footer user={currentUser} siteContent={siteContent} onAdminLoginClick={() => setView('ADMIN_LOGIN')} onGoToAbout={() => setView('ABOUT')} onGoToContact={() => setView('CONTACT')} />
        </div>
    );
};

export default App;

