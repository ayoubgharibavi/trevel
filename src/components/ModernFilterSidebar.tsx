import React, { useState } from 'react';


interface ModernFilterSidebarProps {
  flights: any[];
  onFilterChange: (filters: any) => void;
}

export const ModernFilterSidebar: React.FC<ModernFilterSidebarProps> = ({
  flights,
  onFilterChange
}) => {
  const [filters, setFilters] = useState({
    departureTime: [] as string[],
    priceRange: { min: 2286200, max: 8350300 },
    flightClass: [] as string[],
    airlines: [] as string[]
  });

  const handleFilterChange = (filterType: string, value: any) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const timeRanges = [
    { value: '00-08', label: '۰۰:۰۰ تا ۸ صبح', price: '۲,۴۸۵,۰۰۰', icon: '🌅' },
    { value: '08-14', label: '۸ تا ۱۴ بعد از ظهر', price: '۲,۷۱۴,۴۰۰', icon: '☀️' },
    { value: '14-20', label: '۱۴ تا ۲۰ شب', price: '۲,۲۸۶,۲۰۰', icon: '🌆' },
    { value: '20-24', label: '۲۰ تا ۲۳:۵۹ شب', price: '۲,۲۸۶,۲۰۰', icon: '🌙' }
  ];

  const flightClasses = [
    { value: 'economy', label: 'اکونومی', count: 41 },
    { value: 'business', label: 'بیزینس', count: 9 },
    { value: 'premium', label: 'پریمیوم اکونومی', count: 1 }
  ];

  const airlines = [
    { value: 'flykish', label: 'فلای کیش', price: '۲,۲۸۶,۲۰۰', logo: '✈️' },
    { value: 'ata', label: 'آتا', price: '۲,۲۸۶,۲۰۰', logo: '✈️' },
    { value: 'taradan', label: 'تارادان', price: '۲,۲۹۶,۰۰۰', logo: '✈️' }
  ];

  return (
    <div className="w-80 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2">فیلتر نتایج جستجو</h3>
        <p className="text-sm text-gray-600">نمایش ۵۱ پرواز از ۵۱ پرواز</p>
      </div>

      {/* زمان حرکت */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">زمان حرکت</h4>
        <div className="space-y-3">
          {timeRanges.map((range) => (
            <label key={range.value} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.departureTime.includes(range.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...filters.departureTime, range.value]
                      : filters.departureTime.filter(v => v !== range.value);
                    handleFilterChange('departureTime', newValues);
                  }}
                  className="w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="mr-3 text-lg">{range.icon}</span>
                <span className="text-sm font-medium text-gray-700">{range.label}</span>
              </div>
              <span className="text-xs text-gray-500">از {range.price} تومان</span>
            </label>
          ))}
        </div>
      </div>

      {/* محدوده قیمت */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">محدوده قیمت (تومان)</h4>
        <div className="px-2">
          <input
            type="range"
            min="2286200"
            max="8350300"
            value={filters.priceRange.max}
            onChange={(e) => {
              const newRange = { ...filters.priceRange, max: parseInt(e.target.value) };
              handleFilterChange('priceRange', newRange);
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>۲,۲۸۶,۲۰۰</span>
            <span>۸,۳۵۰,۳۰۰</span>
          </div>
        </div>
      </div>

      {/* کلاس پروازی */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">کلاس پروازی</h4>
        <div className="space-y-3">
          {flightClasses.map((flightClass) => (
            <label key={flightClass.value} className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.flightClass.includes(flightClass.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...filters.flightClass, flightClass.value]
                      : filters.flightClass.filter(v => v !== flightClass.value);
                    handleFilterChange('flightClass', newValues);
                  }}
                  className="w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="mr-3 text-sm font-medium text-gray-700">{flightClass.label}</span>
              </div>
              <span className="text-xs text-gray-500">{flightClass.count} مورد</span>
            </label>
          ))}
        </div>
      </div>

      {/* ایرلاین */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">ایرلاین</h4>
        <div className="space-y-3">
          {airlines.map((airline) => (
            <label key={airline.value} className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.airlines.includes(airline.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...filters.airlines, airline.value]
                      : filters.airlines.filter(v => v !== airline.value);
                    handleFilterChange('airlines', newValues);
                  }}
                  className="w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="mr-3 text-lg">{airline.logo}</span>
                <span className="text-sm font-medium text-gray-700">{airline.label}</span>
              </div>
              <span className="text-xs text-gray-500">از {airline.price} تومان</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
