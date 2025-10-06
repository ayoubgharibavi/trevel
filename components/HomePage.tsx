import React from 'react';
import { FlightSearchForm } from './FlightSearchForm';

interface HomePageProps {
  onSearch: (searchData: any) => void;
  onSepehrSearch?: (searchData: any) => void;
  isLoading: boolean;
  airports: any[];
}

const HomePage: React.FC<HomePageProps> = ({ onSearch, onSepehrSearch, isLoading, airports }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              سفر هوشمند، تجربه بی‌نظیر
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              بهترین قیمت‌ها برای پروازهای داخلی و خارجی
            </p>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <FlightSearchForm
              onSearch={onSearch}
              onSepehrSearch={onSepehrSearch}
              isLoading={isLoading}
              airports={airports}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              چرا ما را انتخاب کنید؟
            </h2>
            <p className="text-lg text-gray-600">
              بهترین خدمات پروازی با قیمت‌های رقابتی
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">قیمت‌های رقابتی</h3>
              <p className="text-gray-600">بهترین قیمت‌ها را از تمام ایرلاین‌ها پیدا کنید</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">رزرو آسان</h3>
              <p className="text-gray-600">رزرو سریع و آسان با چند کلیک</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">پشتیبانی ۲۴/۷</h3>
              <p className="text-gray-600">پشتیبانی کامل در تمام ساعات شبانه‌روز</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              مقاصد محبوب
            </h2>
            <p className="text-lg text-gray-600">
              محبوب‌ترین مسیرهای پروازی
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'تهران', code: 'IKA', image: '/images/destinations/tehran.jpg' },
              { name: 'مشهد', code: 'MHD', image: '/images/destinations/mashhad.jpg' },
              { name: 'اصفهان', code: 'IFN', image: '/images/destinations/isfahan.jpg' },
              { name: 'شیراز', code: 'SYZ', image: '/images/destinations/shiraz.jpg' },
            ].map((destination) => (
              <div key={destination.code} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{destination.code}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{destination.name}</h3>
                  <p className="text-sm text-gray-600">{destination.code}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;