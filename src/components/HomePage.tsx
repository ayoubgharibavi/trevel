import React, { useState, useRef, useEffect } from 'react';
import PriceCalendar from './PriceCalendar';
import AirportSearchBox from './AirportSearchBox';
import FlightSearchForm from './FlightSearchForm';

interface HomePageProps {
  onSearch: (searchData: any) => void;
  onSepehrSearch?: (searchData: any) => void;
  isLoading: boolean;
  airports: any[];
}

const HomePage: React.FC<HomePageProps> = ({ onSearch, onSepehrSearch, isLoading, airports }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchData, setSearchData] = useState({
    origin: '',
    destination: '',
    departureDate: new Date(),
    passengers: { adults: 1, children: 0, infants: 0 },
    tripType: 'oneway'
  });

  // UI States
  const [isPassengerDropdownOpen, setIsPassengerDropdownOpen] = useState(false);
  const [isOriginDropdownOpen, setIsOriginDropdownOpen] = useState(false);
  const [isDestinationDropdownOpen, setIsDestinationDropdownOpen] = useState(false);
  const [originFilter, setOriginFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  
  // Refs
  const passengerRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  // Popular cities for dropdown
  const popularCities = [
    { name: 'تهران (امام خمینی)', code: 'IKA', country: 'ایران' },
    { name: 'تهران (مهرآباد)', code: 'THR', country: 'ایران' },
    { name: 'مشهد', code: 'MHD', country: 'ایران' },
    { name: 'اصفهان', code: 'IFN', country: 'ایران' },
    { name: 'شیراز', code: 'SYZ', country: 'ایران' },
    { name: 'تبریز', code: 'TBZ', country: 'ایران' },
    { name: 'اهواز', code: 'AWZ', country: 'ایران' },
    { name: 'کرمان', code: 'KER', country: 'ایران' },
    { name: 'یزد', code: 'AZD', country: 'ایران' },
    { name: 'استانبول', code: 'IST', country: 'ترکیه' },
    { name: 'دبی', code: 'DXB', country: 'امارات' },
  ];

  // Filter cities based on search input
  const filteredOriginCities = popularCities.filter(city =>
    city.name.toLowerCase().includes(originFilter.toLowerCase()) ||
    city.code.toLowerCase().includes(originFilter.toLowerCase())
  );

  const filteredDestinationCities = popularCities.filter(city =>
    city.name.toLowerCase().includes(destinationFilter.toLowerCase()) ||
    city.code.toLowerCase().includes(destinationFilter.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (passengerRef.current && !passengerRef.current.contains(event.target as Node)) {
        setIsPassengerDropdownOpen(false);
      }
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setIsOriginDropdownOpen(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setIsDestinationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search Data:', searchData);
    
    // Convert searchData to SearchQuery format
    const searchQuery = {
      tripType: searchData.tripType === 'oneway' ? 'OneWay' : 'RoundTrip',
      from: searchData.origin,
      to: searchData.destination,
      departureDate: searchData.departureDate.toISOString().split('T')[0],
      passengers: searchData.passengers
    };
    
    console.log('Converted Search Query:', searchQuery);
    onSearch(searchQuery);
  };

  const handleInputChange = (field: string, value: any) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOriginSelect = (city: any) => {
    // Extract city name without airport code for search
    const cityName = city.name.includes('(') ? city.name.split('(')[0].trim() : city.name;
    setSearchData(prev => ({ ...prev, origin: cityName }));
    setOriginFilter(city.name);
    setIsOriginDropdownOpen(false);
  };

  const handleDestinationSelect = (city: any) => {
    // Extract city name without airport code for search
    const cityName = city.name.includes('(') ? city.name.split('(')[0].trim() : city.name;
    setSearchData(prev => ({ ...prev, destination: cityName }));
    setDestinationFilter(city.name);
    setIsDestinationDropdownOpen(false);
  };

  const handlePassengerChange = (type: 'adults' | 'children' | 'infants', value: number) => {
    setSearchData(prev => ({
      ...prev,
      passengers: {
        ...prev.passengers,
        [type]: Math.max(0, value)
      }
    }));
  };

  const getPassengerText = () => {
    const total = (searchData.passengers?.adults || 1) + (searchData.passengers?.children || 0) + (searchData.passengers?.infants || 0);
    return `${total} مسافر`;
  };

  const swapCities = () => {
    const temp = searchData.origin;
    setSearchData(prev => ({
      ...prev,
      origin: prev.destination,
      destination: temp
    }));
    setOriginFilter(searchData.destination);
    setDestinationFilter(temp);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
              سفر هوشمند، تجربه بی‌نظیر
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-blue-100">
              بهترین قیمت‌ها برای پروازهای داخلی و خارجی
            </p>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="py-6 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8">
            <form onSubmit={handleSearch} className="space-y-8 sm:space-y-10">
              {/* Trip Type */}
              <div className="flex space-x-3 sm:space-x-6 space-x-reverse">
                <button
                  type="button"
                  onClick={() => handleInputChange('tripType', 'oneway')}
                  className={`px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    searchData.tripType === 'oneway'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  یک طرفه
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('tripType', 'roundtrip')}
                  className={`px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    searchData.tripType === 'roundtrip'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  رفت و برگشت
                </button>
              </div>

              {/* Search Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
                {/* Origin */}
                <div className="relative" ref={originRef}>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">مبدا</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={originFilter}
                      onChange={(e) => setOriginFilter(e.target.value)}
                      onFocus={() => setIsOriginDropdownOpen(true)}
                      placeholder="شهر مبدا را انتخاب کنید"
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-sm sm:text-base"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    
                    {/* Swap Button */}
                    <button
                      type="button"
                      onClick={swapCities}
                      className="absolute left-10 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="جابجایی مبدا و مقصد"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </button>

                    {/* Dropdown */}
                    {isOriginDropdownOpen && (
                      <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-2 mb-4">
                        {filteredOriginCities.length > 0 ? (
                          <div className="py-2">
                            {filteredOriginCities.map((city, index) => (
                              <button
                                key={`${city.code}-${index}`}
                                onClick={() => handleOriginSelect(city)}
                                className="w-full px-4 py-3 text-right hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="text-right min-w-0 flex-1">
                                    <div className="font-medium text-gray-900">{city.name}</div>
                                    <div className="text-sm text-gray-600">{city.country}</div>
                                  </div>
                                  <div className="text-left ml-3 flex-shrink-0">
                                    <div className="font-bold text-blue-600">{city.code}</div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-3 text-center text-gray-500">
                            شهر مورد نظر یافت نشد
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Destination */}
                <div className="relative" ref={destinationRef}>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">مقصد</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={destinationFilter}
                      onChange={(e) => setDestinationFilter(e.target.value)}
                      onFocus={() => setIsDestinationDropdownOpen(true)}
                      placeholder="شهر مقصد را انتخاب کنید"
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-sm sm:text-base"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>

                    {/* Dropdown */}
                    {isDestinationDropdownOpen && (
                      <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-2 mb-4">
                        {filteredDestinationCities.length > 0 ? (
                          <div className="py-2">
                            {filteredDestinationCities.map((city, index) => (
                              <button
                                key={`${city.code}-${index}`}
                                onClick={() => handleDestinationSelect(city)}
                                className="w-full px-4 py-3 text-right hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="text-right min-w-0 flex-1">
                                    <div className="font-medium text-gray-900">{city.name}</div>
                                    <div className="text-sm text-gray-600">{city.country}</div>
                                  </div>
                                  <div className="text-left ml-3 flex-shrink-0">
                                    <div className="font-bold text-blue-600">{city.code}</div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-3 text-center text-gray-500">
                            شهر مورد نظر یافت نشد
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div className="relative">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">تاریخ</label>
                  <input
                    type="date"
                    value={searchData.departureDate.toISOString().split('T')[0]}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      setSelectedDate(date);
                      handleInputChange('departureDate', date);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-sm sm:text-base"
                  />
                </div>

                {/* Passengers */}
                <div className="relative" ref={passengerRef}>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">مسافران</label>
                  <button
                    type="button"
                    onClick={() => setIsPassengerDropdownOpen(!isPassengerDropdownOpen)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right flex items-center justify-between text-sm sm:text-base"
                  >
                    <span>{getPassengerText()}</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Passenger Dropdown */}
                  {isPassengerDropdownOpen && (
                    <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-2 mb-4 p-4">
                      <div className="space-y-4">
                        {/* Adults */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">بزرگسال</span>
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <button
                              type="button"
                              onClick={() => handlePassengerChange('adults', (searchData.passengers?.adults || 1) - 1)}
                              disabled={(searchData.passengers?.adults || 1) <= 1}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{searchData.passengers?.adults || 1}</span>
                            <button
                              type="button"
                              onClick={() => handlePassengerChange('adults', (searchData.passengers?.adults || 1) + 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Children */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">کودک (2-11 سال)</span>
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <button
                              type="button"
                              onClick={() => handlePassengerChange('children', (searchData.passengers?.children || 0) - 1)}
                              disabled={(searchData.passengers?.children || 0) <= 0}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{searchData.passengers?.children || 0}</span>
                            <button
                              type="button"
                              onClick={() => handlePassengerChange('children', (searchData.passengers?.children || 0) + 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Infants */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">نوزاد (کمتر از 2 سال)</span>
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <button
                              type="button"
                              onClick={() => handlePassengerChange('infants', (searchData.passengers?.infants || 0) - 1)}
                              disabled={(searchData.passengers?.infants || 0) <= 0}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{searchData.passengers?.infants || 0}</span>
                            <button
                              type="button"
                              onClick={() => handlePassengerChange('infants', (searchData.passengers?.infants || 0) + 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <div className="text-center pt-6 sm:pt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 sm:px-8 md:px-12 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto"
                >
                  {isLoading ? 'در حال جستجو...' : 'جستجوی پرواز'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">چرا پرواز هوشمند؟</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">امکانات ویژه برای تجربه سفر بهتر</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-4 sm:p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">بهترین قیمت‌ها</h3>
              <p className="text-sm sm:text-base text-gray-600">قیمت‌های رقابتی و تخفیف‌های ویژه برای تمام پروازها</p>
            </div>

            <div className="text-center p-4 sm:p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">امنیت بالا</h3>
              <p className="text-sm sm:text-base text-gray-600">پرداخت امن و حفاظت از اطلاعات شخصی شما</p>
            </div>

            <div className="text-center p-4 sm:p-6 rounded-lg hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">پشتیبانی ۲۴/۷</h3>
              <p className="text-sm sm:text-base text-gray-600">پشتیبانی تمام وقت برای حل مشکلات شما</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">مقاصد محبوب</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">محبوب‌ترین مقاصد سفر</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: 'تهران', image: '/images/tehran.jpg', price: 'از ۲۵۰ هزار تومان' },
              { name: 'مشهد', image: '/images/mashhad.jpg', price: 'از ۱۸۰ هزار تومان' },
              { name: 'شیراز', image: '/images/shiraz.jpg', price: 'از ۲۰۰ هزار تومان' },
              { name: 'اصفهان', image: '/images/isfahan.jpg', price: 'از ۲۲۰ هزار تومان' }
            ].map((destination, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 sm:h-40 md:h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-lg sm:text-xl md:text-2xl font-bold">{destination.name}</span>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{destination.name}</h3>
                  <p className="text-sm sm:text-base text-blue-600 font-medium">{destination.price}</p>
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


