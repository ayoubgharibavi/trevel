import React, { useState, useMemo } from 'react';
import { FlightCard } from './FlightCard';
import { SortDropdown } from '@/components/SortDropdown';
import { AdBanner } from '@/components/AdBanner';
import { useLocalization } from '@/hooks/useLocalization';
import { Flight, SearchQuery, RefundPolicy, Advertisement, User, Currency } from '@/types';

interface SearchResultsProps {
  flights: Flight[];
  searchQuery: SearchQuery | null;
  onSelectFlight: (flight: Flight) => void;
  refundPolicies: RefundPolicy[];
  advertisements: Advertisement[];
  currentUser: User | null;
  currencies: Currency[];
  popularRoutes: any[];
  onSearch: (query: SearchQuery) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ 
  flights, 
  searchQuery, 
  onSelectFlight, 
  refundPolicies, 
  advertisements, 
  currentUser, 
  currencies, 
  popularRoutes, 
  onSearch 
}) => {
  const { t, formatNumber, language } = useLocalization();
  const [sortOption, setSortOption] = useState('price');
  const [selectedFilters, setSelectedFilters] = useState({
    stops: [] as string[],
    flightClass: [] as string[],
    ticketType: [] as string[],
    timeRange: [] as string[],
    airlines: [] as string[]
  });

  // Sort flights based on selected option
  const sortedFlights = useMemo(() => {
    const flightsCopy = [...flights];
    
    switch (sortOption) {
      case 'price':
        return flightsCopy.sort((a, b) => {
          const priceA = Number(a.price) + Number(a.taxes);
          const priceB = Number(b.price) + Number(b.taxes);
          return priceA - priceB;
        });
      case 'duration':
        return flightsCopy.sort((a, b) => {
          const durationA = typeof a.duration === 'number' ? a.duration : 0;
          const durationB = typeof b.duration === 'number' ? b.duration : 0;
          return durationA - durationB;
        });
      case 'departure':
        return flightsCopy.sort((a, b) => {
          const timeA = new Date(a.departure?.dateTime || 0).getTime();
          const timeB = new Date(b.departure?.dateTime || 0).getTime();
          return timeA - timeB;
        });
      default:
        return flightsCopy;
    }
  }, [flights, sortOption]);

  // Filter flights based on selected filters
  const filteredFlights = useMemo(() => {
    return sortedFlights.filter(flight => {
      // Filter by stops
      if (selectedFilters.stops.length > 0) {
        const stopsStr = flight.stops.toString();
        if (!selectedFilters.stops.includes(stopsStr)) return false;
      }

      // Filter by flight class
      if (selectedFilters.flightClass.length > 0) {
        const flightClass = typeof flight.flightClass === 'string' ? flight.flightClass : (flight.flightClass as any)?.name || '';
        if (!selectedFilters.flightClass.includes(flightClass)) return false;
      }

      // Filter by ticket type
      if (selectedFilters.ticketType.length > 0) {
        const ticketType = flight.ticketType || 'سیستمی';
        if (!selectedFilters.ticketType.includes(ticketType)) return false;
      }

      // Filter by time range
      if (selectedFilters.timeRange.length > 0) {
        const departureTime = new Date(flight.departure?.dateTime || 0).getHours();
        const timeRange = selectedFilters.timeRange.some(range => {
          switch (range) {
            case '0-8': return departureTime >= 0 && departureTime < 8;
            case '8-12': return departureTime >= 8 && departureTime < 12;
            case '12-18': return departureTime >= 12 && departureTime < 18;
            case '18-24': return departureTime >= 18 && departureTime < 24;
            default: return false;
          }
        });
        if (!timeRange) return false;
      }

      return true;
    });
  }, [sortedFlights, selectedFilters]);

  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: (prev[filterType as keyof typeof prev] as string[]).includes(value)
        ? (prev[filterType as keyof typeof prev] as string[]).filter(item => item !== value)
        : [...(prev[filterType as keyof typeof prev] as string[]), value]
    }));
  };

  const topAd = advertisements.find(ad => ad.position === 'top');
  const bottomAd = advertisements.find(ad => ad.position === 'bottom');

  if (!searchQuery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {t('searchResults.noSearchQuery')}
          </h2>
          <p className="text-gray-600">
            {t('searchResults.pleaseSearch')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{searchQuery.tripType === 'OneWay' ? 'یک طرفه' : 'رفت و برگشت'}</span>
                <span className="mx-2">•</span>
                <span className="font-medium">{searchQuery.passengers.adults + searchQuery.passengers.children + searchQuery.passengers.infants} مسافر</span>
                <span className="mx-2">•</span>
                <span className="font-medium">{searchQuery.departureDate instanceof Date ? searchQuery.departureDate.toLocaleDateString('fa-IR') : searchQuery.departureDate}</span>
                {searchQuery.returnDate && (
                  <>
                    <span className="mx-2">-</span>
                    <span className="font-medium">{searchQuery.returnDate instanceof Date ? searchQuery.returnDate.toLocaleDateString('fa-IR') : searchQuery.returnDate}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{searchQuery.from}</span>
                <span className="mx-2">→</span>
                <span className="font-medium">{searchQuery.to}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">فیلترها</h3>
              
              {/* Stops Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">توقف</h4>
                <div className="space-y-2">
                  {[
                    { value: '0', label: 'بدون توقف' },
                    { value: '1', label: 'یک توقف' },
                    { value: '2', label: 'دو توقف' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFilters.stops.includes(option.value)}
                        onChange={() => handleFilterChange('stops', option.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="mr-2 text-sm text-gray-600">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Flight Class Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">نوع پرواز</h4>
                <div className="space-y-2">
                  {['اقتصادی', 'بیزینسی', 'سطح یک'].map(option => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFilters.flightClass.includes(option)}
                        onChange={() => handleFilterChange('flightClass', option)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="mr-2 text-sm text-gray-600">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ticket Type Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">نوع بلیط</h4>
                <div className="space-y-2">
                  {['سیستمی', 'چارتری'].map(option => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFilters.ticketType.includes(option)}
                        onChange={() => handleFilterChange('ticketType', option)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="mr-2 text-sm text-gray-600">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Range Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">بازه زمانی</h4>
                <div className="space-y-2">
                  {[
                    { value: '0-8', label: '0-8 (صبح)' },
                    { value: '8-12', label: '8-12 (ظهر)' },
                    { value: '12-18', label: '12-18 (بعدازظهر)' },
                    { value: '18-24', label: '18-24 (شب)' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFilters.timeRange.includes(option.value)}
                        onChange={() => handleFilterChange('timeRange', option.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="mr-2 text-sm text-gray-600">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Airlines Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">ایرلاین</h4>
                <div className="space-y-2">
                  {Array.from(new Set(flights.map(f => typeof f.airline === 'string' ? f.airline : (f.airline as any)?.name || ''))).map((airline: string) => (
                    <label key={airline} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFilters.airlines.includes(airline)}
                        onChange={() => handleFilterChange('airlines', airline)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="mr-2 text-sm text-gray-600">{airline}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Special Offer Banner */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">پیشنهاد ویژه</h3>
                  <p className="text-sm opacity-90">بهترین قیمت‌ها را برای شما پیدا کرده‌ایم</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">-20%</div>
                  <div className="text-sm opacity-90">تخفیف ویژه</div>
                </div>
              </div>
            </div>

            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    نتایج جستجو
                  </h2>
                  <p className="text-gray-600">
                    {filteredFlights.length} پرواز پیدا شد
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">مرتب‌سازی بر اساس:</span>
                  <SortDropdown 
                    value={sortOption} 
                    onChange={setSortOption}
                  />
                </div>
              </div>
            </div>

            {/* Flight Results */}
            {filteredFlights.length > 0 ? (
        <div className="space-y-4">
                {filteredFlights.map((flight, index) => (
                  <div key={flight.id} className="relative">
                    {/* Special Offer Badge for first flight */}
                    {index === 0 && (
                      <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                        پیشنهاد ویژه
                      </div>
                    )}
                    
                    <FlightCard 
                      flight={flight} 
                      onSelect={onSelectFlight} 
                      refundPolicies={refundPolicies} 
                      currentUser={currentUser} 
                      currencies={currencies} 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">✈️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  در این تاریخ پروازی وجود ندارد
                </h3>
                <p className="text-gray-600 mb-6">
                  متأسفانه برای تاریخ انتخابی شما پروازی یافت نشد. لطفاً تاریخ دیگری را انتخاب کنید.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  جستجوی مجدد
                </button>
              </div>
            )}

            {/* Bottom Advertisement */}
            {bottomAd && (
              <div className="mt-8">
                <AdBanner 
                  imageUrl={bottomAd.imageUrl} 
                  linkUrl={bottomAd.linkUrl} 
                  altText={bottomAd.altText} 
                  onAdClick={() => {
                    console.log('Ad clicked:', bottomAd.linkUrl);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};