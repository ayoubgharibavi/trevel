import { Injectable } from '@nestjs/common';

@Injectable()
export class ContentService {
  async getHomeContent(language: string) {
    // Mock home content - replace with Prisma when DB is ready
    return {
      heroImageUrl: '/assets/hero-bg.jpg',
      title: {
        fa: 'پرواز هوشمند - رزرو آسان بلیط هواپیما',
        en: 'Smart Flight - Easy Airline Ticket Booking',
        ar: 'الطيران الذكي - حجز تذاكر الطيران بسهولة'
      },
      subtitle: {
        fa: 'بهترین قیمت‌ها را با هوش مصنوعی پیدا کنید',
        en: 'Find the best prices with artificial intelligence',
        ar: 'اعثر على أفضل الأسعار بالذكاء الاصطناعي'
      }
    };
  }

  async getAboutContent(language: string) {
    // Mock about content - replace with Prisma when DB is ready
    return {
      title: {
        fa: 'درباره ما',
        en: 'About Us',
        ar: 'معلومات عنا'
      },
      body: {
        fa: 'پرواز هوشمند یک پلتفرم پیشرو برای رزرو بلیط هواپیما است که با استفاده از هوش مصنوعی، بهترین گزینه‌ها را به شما پیشنهاد می‌دهد.',
        en: 'Smart Flight is a leading platform for booking airline tickets, using artificial intelligence to suggest the best options for you.',
        ar: 'الطيران الذكي هي منصة رائدة لحجز تذاكر الطيران تستخدم الذكاء الاصطناعي لتقديم أفضل الخيارات لك.'
      },
      imageUrl: '/assets/about-us.jpg'
    };
  }

  async getContactContent(language: string) {
    // Mock contact content - replace with Prisma when DB is ready
    return {
      title: {
        fa: 'تماس با ما',
        en: 'Contact Us',
        ar: 'اتصل بنا'
      },
      body: {
        fa: 'ما همیشه آماده پاسخگویی به سوالات شما هستیم.',
        en: 'We are always ready to answer your questions.',
        ar: 'نحن دائما على استعداد للإجابة على أسئلتك.'
      },
      address: {
        fa: 'تهران، خیابان آزادی، پلاک ۱۲۳',
        en: 'Tehran, Azadi St, No. 123',
        ar: 'طهران، شارع آزادي، رقم 123'
      },
      phone: '+98 21 1234 5678',
      email: 'support@smartflight.com',
      mapImageUrl: '/assets/map.jpg'
    };
  }

  async getFooterContent(language: string) {
    // Mock footer content - replace with Prisma when DB is ready
    return {
      description: {
        fa: 'یک پلتفرم مدرن برای رزرو بلیط هواپیما، طراحی شده برای ارائه بهترین تجربه کاربری',
        en: 'A modern platform for booking airline tickets, designed to provide the best user experience',
        ar: 'منصة حديثة لحجز تذاكر الطيران، مصممة لتقديم أفضل تجربة مستخدم'
      },
      columns: [
        {
          id: 'col-1',
          title: {
            fa: 'لینک‌های سریع',
            en: 'Quick Links',
            ar: 'روابط سريعة'
          },
          links: [
            { id: 'link-1', text: { fa: 'درباره ما', en: 'About Us', ar: 'معلومات عنا' }, url: '/about' },
            { id: 'link-2', text: { fa: 'تماس با ما', en: 'Contact Us', ar: 'اتصل بنا' }, url: '/contact' },
            { id: 'link-3', text: { fa: 'سوالات متداول', en: 'FAQ', ar: 'الأسئلة الشائعة' }, url: '/faq' }
          ]
        }
      ]
    };
  }

  async getPopularDestinations(language: string) {
    // Mock popular destinations - replace with Prisma when DB is ready
    return {
      title: {
        fa: 'مقصدهای محبوب',
        en: 'Popular Destinations',
        ar: 'وجهات شهيرة'
      },
      subtitle: {
        fa: 'مکان‌هایی را که مشتریان ما دوست دارند به آنجا سفر کنند، کشف کنید.',
        en: 'Discover places our customers love to travel to.',
        ar: 'اكتشف الأماكن التي يحب عملاؤنا السفر إليها.'
      },
      destinations: [
        { id: 'dest-1', name: { fa: 'استانبول', en: 'Istanbul', ar: 'إسطنبول' }, imageUrl: '/assets/destinations/istanbul.jpg' },
        { id: 'dest-2', name: { fa: 'دبی', en: 'Dubai', ar: 'دبي' }, imageUrl: '/assets/destinations/dubai.jpg' },
        { id: 'dest-3', name: { fa: 'پاریس', en: 'Paris', ar: 'باريس' }, imageUrl: '/assets/destinations/paris.jpg' },
        { id: 'dest-4', name: { fa: 'تهران', en: 'Tehran', ar: 'طهران' }, imageUrl: '/assets/destinations/tehran.jpg' }
      ]
    };
  }

  async getAdvertisements(placement?: string) {
    // Mock advertisements - replace with Prisma when DB is ready
    const ads = [
      {
        id: 'ad-1',
        title: 'Summer Sale Banner',
        imageUrl: '/assets/ads/summer-sale.jpg',
        linkUrl: '/special-offers',
        placement: 'SEARCH_RESULTS_TOP',
        isActive: true
      },
      {
        id: 'ad-2',
        title: 'Hotel Deals Sidebar',
        imageUrl: '/assets/ads/hotel-deals.jpg',
        linkUrl: '/hotels',
        placement: 'SIDEBAR_BOTTOM',
        isActive: true
      }
    ];
    return placement ? ads.filter(ad => ad.placement === placement && ad.isActive) : ads.filter(ad => ad.isActive);
  }
}
