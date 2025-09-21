import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default tenant
  const defaultTenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      id: 'tenant-1',
      name: 'Trevel Airlines',
      slug: 'default',
      contactEmail: 'info@trevel.com',
      contactPhone: '+98-21-12345678',
      isActive: true,
      logoUrl: '/logo.png',
      primaryColor: '#3B82F6',
      theme: 'default',
      homepageContentId: 'home-1',
      supportedLanguages: '["fa", "en", "ar"]',
      supportedCurrencies: '["IRR", "USD"]',
    },
  });

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@trevel.com' },
    update: {},
    create: {
      id: 'admin-1',
      email: 'admin@trevel.com',
      username: 'admin',
      name: 'مدیر سیستم',
      phone: '+98-912-1234567',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      canBypassRateLimit: true,
      tenantId: defaultTenant.id,
      displayCurrencies: '["IRR", "USD"]',
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12);
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@trevel.com' },
    update: {},
    create: {
      id: 'user-1',
      email: 'user@trevel.com',
      username: 'user',
      name: 'کاربر عادی',
      phone: '+98-912-7654321',
      passwordHash: userPassword,
      role: 'USER',
      status: 'ACTIVE',
      canBypassRateLimit: false,
      tenantId: defaultTenant.id,
      displayCurrencies: '["IRR"]',
    },
  });

  // Create wallets for users
  await prisma.wallet.upsert({
    where: { 
      userId_currency: {
        userId: adminUser.id,
        currency: 'IRR'
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      balance: 10000000, // 10M IRR
      currency: 'IRR',
    },
  });

  await prisma.wallet.upsert({
    where: { 
      userId_currency: {
        userId: regularUser.id,
        currency: 'IRR'
      }
    },
    update: {},
    create: {
      userId: regularUser.id,
      balance: 5000000, // 5M IRR
      currency: 'IRR',
    },
  });

  // Create countries
  const countries = [
    {
      id: 'IR',
      name: JSON.stringify({ fa: 'ایران', en: 'Iran', ar: 'إيران' }),
      flag: '🇮🇷',
      dialingCode: '+98',
      currency: 'IRR',
    },
    {
      id: 'TR',
      name: JSON.stringify({ fa: 'ترکیه', en: 'Turkey', ar: 'تركيا' }),
      flag: '🇹🇷',
      dialingCode: '+90',
      currency: 'TRY',
    },
    {
      id: 'AE',
      name: JSON.stringify({ fa: 'امارات متحده عربی', en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة' }),
      flag: '🇦🇪',
      dialingCode: '+971',
      currency: 'AED',
    },
    {
      id: 'US',
      name: JSON.stringify({ fa: 'آمریکا', en: 'United States', ar: 'الولايات المتحدة' }),
      flag: '🇺🇸',
      dialingCode: '+1',
      currency: 'USD',
    },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { id: country.id },
      update: {},
      create: country,
    });
  }

  // Create currencies
  const currencies = [
    {
      id: 'IRR',
      name: JSON.stringify({ fa: 'ریال ایران', en: 'Iranian Rial', ar: 'ريال إيراني' }),
      code: 'IRR',
      symbol: JSON.stringify({ fa: 'ریال', en: 'IRR', ar: 'ريال' }),
      exchangeRateToUSD: 0.000024,
      isBaseCurrency: true,
      isActive: true,
    },
    {
      id: 'USD',
      name: JSON.stringify({ fa: 'دلار آمریکا', en: 'US Dollar', ar: 'دولار أمريكي' }),
      code: 'USD',
      symbol: JSON.stringify({ fa: '$', en: '$', ar: '$' }),
      exchangeRateToUSD: 1,
      isBaseCurrency: false,
      isActive: true,
    },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: {},
      create: currency,
    });
  }

  // Create airlines
  const airlines = [
    {
      id: 'airline-1',
      name: JSON.stringify({ fa: 'ایران ایر', en: 'Iran Air', ar: 'إيران إير' }),
      logoUrl: '/airlines/iran-air.png',
    },
    {
      id: 'airline-2',
      name: JSON.stringify({ fa: 'ماهان ایر', en: 'Mahan Air', ar: 'ماهان إير' }),
      logoUrl: '/airlines/mahan-air.png',
    },
    {
      id: 'airline-3',
      name: JSON.stringify({ fa: 'ترکیش ایرلاینز', en: 'Turkish Airlines', ar: 'الخطوط الجوية التركية' }),
      logoUrl: '/airlines/turkish-airlines.png',
    },
  ];

  for (const airline of airlines) {
    await prisma.airline.upsert({
      where: { id: airline.id },
      update: airline,
      create: airline,
    });
  }

  // Create aircraft
  const aircraft = [
    {
      id: 'aircraft-1',
      name: JSON.stringify({ fa: 'بوئینگ ۷۳۷', en: 'Boeing 737', ar: 'بوينغ 737' }),
      capacity: 180,
    },
    {
      id: 'aircraft-2',
      name: JSON.stringify({ fa: 'ایرباس A320', en: 'Airbus A320', ar: 'إيرباص A320' }),
      capacity: 150,
    },
    {
      id: 'aircraft-3',
      name: JSON.stringify({ fa: 'بوئینگ ۷۷۷', en: 'Boeing 777', ar: 'بوينغ 777' }),
      capacity: 300,
    },
  ];

  for (const craft of aircraft) {
    await prisma.aircraft.upsert({
      where: { id: craft.id },
      update: {},
      create: craft,
    });
  }

  // Create flight classes
  const flightClasses = [
    {
      id: 'class-1',
      name: JSON.stringify({ fa: 'اکونومی', en: 'Economy', ar: 'اقتصادية' }),
    },
    {
      id: 'class-2',
      name: JSON.stringify({ fa: 'بیزنس', en: 'Business', ar: 'رجال الأعمال' }),
    },
    {
      id: 'class-3',
      name: JSON.stringify({ fa: 'فرست کلاس', en: 'First Class', ar: 'الدرجة الأولى' }),
    },
  ];

  for (const flightClass of flightClasses) {
    await prisma.flightClass.upsert({
      where: { id: flightClass.id },
      update: {},
      create: flightClass,
    });
  }

  // Create airports
  const airports = [
    {
      id: 'airport-1',
      iata: 'IKA',
      icao: 'OIIE',
      name: JSON.stringify({ fa: 'فرودگاه بین‌المللی امام خمینی', en: 'Imam Khomeini International Airport', ar: 'مطار الإمام الخميني الدولي' }),
      city: JSON.stringify({ fa: 'تهران', en: 'Tehran', ar: 'طهران' }),
      country: JSON.stringify({ fa: 'ایران', en: 'Iran', ar: 'إيران' }),
    },
    {
      id: 'airport-2',
      iata: 'MHD',
      icao: 'OIMM',
      name: JSON.stringify({ fa: 'فرودگاه بین‌المللی مشهد', en: 'Mashhad International Airport', ar: 'مطار مشهد الدولي' }),
      city: JSON.stringify({ fa: 'مشهد', en: 'Mashhad', ar: 'مشهد' }),
      country: JSON.stringify({ fa: 'ایران', en: 'Iran', ar: 'إيران' }),
    },
    {
      id: 'airport-3',
      iata: 'IST',
      icao: 'LTFM',
      name: JSON.stringify({ fa: 'فرودگاه بین‌المللی استانبول', en: 'Istanbul Airport', ar: 'مطار إسطنبول' }),
      city: JSON.stringify({ fa: 'استانبول', en: 'Istanbul', ar: 'إسطنبول' }),
      country: JSON.stringify({ fa: 'ترکیه', en: 'Turkey', ar: 'تركيا' }),
    },
    {
      id: 'airport-4',
      iata: 'DXB',
      icao: 'OMDB',
      name: JSON.stringify({ fa: 'فرودگاه بین‌المللی دبی', en: 'Dubai International Airport', ar: 'مطار دبي الدولي' }),
      city: JSON.stringify({ fa: 'دبی', en: 'Dubai', ar: 'دبي' }),
      country: JSON.stringify({ fa: 'امارات متحده عربی', en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة' }),
    },
  ];

  for (const airport of airports) {
    await prisma.airport.upsert({
      where: { iata: airport.iata },
      update: {},
      create: airport,
    });
  }

  // Create commission models
  const commissionModels = [
    {
      id: 'cm-1',
      name: JSON.stringify({ fa: 'مدل استاندارد', en: 'Standard Model', ar: 'النموذج القياسي' }),
      calculationType: 'Percentage',
      charterCommission: 5.0,
      creatorCommission: 2.0,
      webServiceCommission: 1.0,
    },
    {
      id: 'cm-2',
      name: JSON.stringify({ fa: 'مدل پریمیوم', en: 'Premium Model', ar: 'النموذج المميز' }),
      calculationType: 'Percentage',
      charterCommission: 7.0,
      creatorCommission: 3.0,
      webServiceCommission: 1.5,
    },
  ];

  for (const model of commissionModels) {
    await prisma.commissionModel.upsert({
      where: { id: model.id },
      update: {},
      create: model,
    });
  }

  // Create refund policies
  const refundPolicies = [
    {
      id: 'rp-1',
      name: JSON.stringify({ fa: 'سیاست استرداد استاندارد', en: 'Standard Refund Policy', ar: 'سياسة الاسترداد القياسية' }),
      policyType: 'Domestic',
      airlineId: null,
      rules: JSON.stringify([
        { hoursBeforeDeparture: 24, refundPercentage: 100 },
        { hoursBeforeDeparture: 12, refundPercentage: 80 },
        { hoursBeforeDeparture: 6, refundPercentage: 50 },
        { hoursBeforeDeparture: 0, refundPercentage: 0 },
      ]),
    },
  ];

  for (const policy of refundPolicies) {
    await prisma.refundPolicy.upsert({
      where: { id: policy.id },
      update: {},
      create: policy,
    });
  }

  // Create sample flights
  const flights = [
    {
      id: 'flight-1',
      airline: 'ایران ایر',
      airlineLogoUrl: '/airlines/iran-air.png',
      flightNumber: 'IR701',
      aircraft: 'بوئینگ ۷۳۷',
      flightClass: 'اکونومی',
      duration: 120,
      stops: 0,
      price: 2500000,
      taxes: 150000,
      availableSeats: 150,
      totalCapacity: 180,
      baggageAllowance: '20kg',
      status: 'SCHEDULED',
      bookingClosesBeforeDepartureHours: 3,
      sourcingType: 'Manual',
      commissionModelId: 'cm-1',
      refundPolicyId: 'rp-1',
      creatorId: adminUser.id,
      tenantId: defaultTenant.id,
      departureAirportId: 'airport-1',
      departureTerminal: 'T1',
      departureGate: 'A1',
      departureTime: new Date('2024-02-15T10:00:00Z'),
      arrivalAirportId: 'airport-2',
      arrivalTerminal: 'T1',
      arrivalGate: 'B1',
      arrivalTime: new Date('2024-02-15T12:00:00Z'),
      airlineId: 'airline-1',
      aircraftId: 'aircraft-1',
      flightClassId: 'class-1',
    },
    {
      id: 'flight-2',
      airline: 'ماهان ایر',
      airlineLogoUrl: '/airlines/mahan-air.png',
      flightNumber: 'W5-1234',
      aircraft: 'ایرباس A320',
      flightClass: 'اکونومی',
      duration: 180,
      stops: 0,
      price: 3500000,
      taxes: 200000,
      availableSeats: 120,
      totalCapacity: 150,
      baggageAllowance: '25kg',
      status: 'SCHEDULED',
      bookingClosesBeforeDepartureHours: 3,
      sourcingType: 'Manual',
      commissionModelId: 'cm-2',
      refundPolicyId: 'rp-1',
      creatorId: adminUser.id,
      tenantId: defaultTenant.id,
      departureAirportId: 'airport-1',
      departureTerminal: 'T2',
      departureGate: 'C1',
      departureTime: new Date('2024-02-15T14:00:00Z'),
      arrivalAirportId: 'airport-3',
      arrivalTerminal: 'T1',
      arrivalGate: 'D1',
      arrivalTime: new Date('2024-02-15T17:00:00Z'),
      airlineId: 'airline-2',
      aircraftId: 'aircraft-2',
      flightClassId: 'class-1',
    },
  ];

  for (const flight of flights) {
    await prisma.flight.upsert({
      where: { id: flight.id },
      update: {},
      create: flight,
    });
  }

  // Create rate limits
  const rateLimits = [
    {
      id: 'rl-1',
      fromCity: 'تهران',
      toCity: 'مشهد',
      maxPrice: 3000000,
    },
    {
      id: 'rl-2',
      fromCity: 'تهران',
      toCity: 'استانبول',
      maxPrice: 5000000,
    },
  ];

  for (const rateLimit of rateLimits) {
    await prisma.rateLimit.upsert({
      where: { id: rateLimit.id },
      update: {},
      create: rateLimit,
    });
  }

  // Create advertisements
  const advertisements = [
    {
      id: 'ad-1',
      title: 'پروازهای ارزان به مشهد',
      imageUrl: '/ads/mashhad-promo.jpg',
      linkUrl: '/search?from=تهران&to=مشهد',
      placement: 'SEARCH_RESULTS_TOP',
      isActive: true,
    },
    {
      id: 'ad-2',
      title: 'رزرو هتل در استانبول',
      imageUrl: '/ads/istanbul-hotel.jpg',
      linkUrl: '/hotels/istanbul',
      placement: 'SIDEBAR_BOTTOM',
      isActive: true,
    },
  ];

  for (const ad of advertisements) {
    await prisma.advertisement.upsert({
      where: { id: ad.id },
      update: {},
      create: ad,
    });
  }

  // Create site content
  const siteContents = [
    {
      id: 'content-1',
      section: 'home',
      content: JSON.stringify({
        heroImageUrl: '/hero-bg.jpg',
        popularDestinations: {
          title: { fa: 'مقاصد محبوب', en: 'Popular Destinations', ar: 'الوجهات الشائعة' },
          subtitle: { fa: 'بهترین مقاصد سفر را انتخاب کنید', en: 'Choose the best travel destinations', ar: 'اختر أفضل وجهات السفر' },
          destinations: [
            { name: { fa: 'مشهد', en: 'Mashhad', ar: 'مشهد' }, imageUrl: '/destinations/mashhad.jpg' },
            { name: { fa: 'استانبول', en: 'Istanbul', ar: 'إسطنبول' }, imageUrl: '/destinations/istanbul.jpg' },
            { name: { fa: 'دبی', en: 'Dubai', ar: 'دبي' }, imageUrl: '/destinations/dubai.jpg' },
          ],
        },
      }),
    },
    {
      id: 'content-2',
      section: 'about',
      content: JSON.stringify({
        title: { fa: 'درباره ما', en: 'About Us', ar: 'معلومات عنا' },
        body: { fa: 'ما بهترین خدمات سفر را ارائه می‌دهیم', en: 'We provide the best travel services', ar: 'نحن نقدم أفضل خدمات السفر' },
        imageUrl: '/about-us.jpg',
      }),
    },
    {
      id: 'content-3',
      section: 'contact',
      content: JSON.stringify({
        title: { fa: 'تماس با ما', en: 'Contact Us', ar: 'اتصل بنا' },
        body: { fa: 'برای اطلاعات بیشتر با ما تماس بگیرید', en: 'Contact us for more information', ar: 'اتصل بنا للحصول على مزيد من المعلومات' },
        address: { fa: 'تهران، خیابان ولیعصر', en: 'Tehran, Valiasr Street', ar: 'طهران، شارع ولي العصر' },
        phone: '+98-21-12345678',
        email: 'info@trevel.com',
        mapImageUrl: '/map.jpg',
      }),
    },
  ];

  for (const content of siteContents) {
    await prisma.siteContent.upsert({
      where: { section: content.section },
      update: {},
      create: content,
    });
  }

  // Create telegram bot config
  await prisma.telegramBotConfig.upsert({
    where: { id: 'telegram_config' },
    update: {},
    create: {
      id: 'telegram_config',
      isEnabled: false,
      botToken: '',
      chatId: '',
      notifyOn: JSON.stringify({
        newBooking: true,
        bookingCancellation: true,
        refundUpdate: true,
        newUser: true,
        newTicket: true,
      }),
    },
  });

  // Create whatsapp bot config
  await prisma.whatsAppBotConfig.upsert({
    where: { id: 'whatsapp_config' },
    update: {},
    create: {
      id: 'whatsapp_config',
      isEnabled: false,
      apiKey: '',
      phoneNumberId: '',
      notifyOn: JSON.stringify({
        bookingSuccess: true,
        flightChange: true,
      }),
    },
  });

  // Create role permissions
  await prisma.rolePermissions.upsert({
    where: { id: 'role_permissions' },
    update: {},
    create: {
      id: 'role_permissions',
      permissions: JSON.stringify({
        SUPER_ADMIN: [
          'VIEW_STATS', 'CREATE_FLIGHTS', 'EDIT_FLIGHTS', 'DELETE_FLIGHTS',
          'MANAGE_BOOKINGS', 'MANAGE_REFUNDS', 'MANAGE_TICKETS', 'MANAGE_USERS',
          'EDIT_USER_ROLE', 'MANAGE_BASIC_DATA', 'MANAGE_COMMISSION_MODELS',
          'VIEW_ACTIVITY_LOG', 'MANAGE_ACCOUNTING', 'MANAGE_RATE_LIMITS',
          'MANAGE_CONTENT', 'MANAGE_ADS', 'MANAGE_TENANTS', 'MANAGE_TELEGRAM_BOT',
          'MANAGE_WHATSAPP_BOT'
        ],
        ADMIN: [
          'VIEW_STATS', 'CREATE_FLIGHTS', 'EDIT_FLIGHTS', 'DELETE_FLIGHTS',
          'MANAGE_BOOKINGS', 'MANAGE_REFUNDS', 'MANAGE_TICKETS', 'MANAGE_USERS',
          'MANAGE_BASIC_DATA', 'MANAGE_COMMISSION_MODELS', 'VIEW_ACTIVITY_LOG',
          'MANAGE_ACCOUNTING', 'MANAGE_RATE_LIMITS'
        ],
        EDITOR: [
          'VIEW_STATS', 'CREATE_FLIGHTS', 'EDIT_FLIGHTS', 'MANAGE_BOOKINGS',
          'MANAGE_TICKETS', 'MANAGE_BASIC_DATA'
        ],
        SUPPORT: [
          'VIEW_STATS', 'MANAGE_TICKETS', 'MANAGE_REFUNDS'
        ],
        AFFILIATE: [
          'VIEW_STATS', 'CREATE_OWN_FLIGHTS', 'EDIT_OWN_FLIGHTS', 'DELETE_OWN_FLIGHTS',
          'VIEW_OWN_BOOKINGS', 'VIEW_OWN_ACCOUNTING'
        ],
        ACCOUNTANT: [
          'VIEW_STATS', 'MANAGE_ACCOUNTING', 'VIEW_ACTIVITY_LOG'
        ],
        USER: [
          'VIEW_OWN_PROFILE', 'UPDATE_OWN_PROFILE', 'VIEW_OWN_BOOKINGS', 
          'CREATE_BOOKINGS', 'VIEW_OWN_TICKETS', 'CREATE_TICKETS'
        ]
      }),
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('👤 Admin credentials: admin@trevel.com / admin123');
  console.log('👤 User credentials: user@trevel.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

