import React, { useState, useEffect } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { apiService } from '@/services/apiService';
import { CalendarIcon } from './icons/CalendarIcon';
import moment from 'jalali-moment';

interface DayPrice {
  date: string;
  price: number;
  isAvailable: boolean;
  isLowest?: boolean;
}

interface PriceCalendarProps {
  tripType?: 'oneway' | 'roundtrip';
  returnDate?: Date;
  onReturnDateSelect?: (date: Date) => void;
}

const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}K`;
  }
  return price.toString();
};

const PriceCalendar: React.FC<PriceCalendarProps> = ({
  tripType = 'oneway',
  returnDate,
  onReturnDateSelect
}) => {
  const { t, language } = useLocalization();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dailyPrices, setDailyPrices] = useState<DayPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null
  });

  // Generate mock data for demonstration
  useEffect(() => {
    const generateMockPrices = () => {
      const prices: DayPrice[] = [];
      const startDate = moment().subtract(15, 'days');
      
      for (let i = 0; i < 60; i++) {
        const date = startDate.clone().add(i, 'days');
        const basePrice = 1500000 + Math.random() * 1000000;
        const isAvailable = Math.random() > 0.1; // 90% availability
        const isLowest = Math.random() > 0.95; // 5% chance of being lowest
        
        prices.push({
          date: date.format('YYYY-MM-DD'),
          price: Math.round(basePrice),
          isAvailable,
          isLowest
        });
      }
      
      setDailyPrices(prices);
    };

    generateMockPrices();
  }, []);

  const getPriceForDate = (date: moment.Moment): DayPrice | undefined => {
    return dailyPrices.find(dp => dp.date === date.format('YYYY-MM-DD'));
  };

  const isInRange = (date: moment.Moment) => {
    if (!selectedRange.start || !selectedRange.end) return false;
    return date.isBetween(selectedRange.start, selectedRange.end, 'day', '[]');
  };

  const isRangeStart = (date: moment.Moment) => {
    return selectedRange.start && date.isSame(selectedRange.start, 'day');
  };

  const isRangeEnd = (date: moment.Moment) => {
    return selectedRange.end && date.isSame(selectedRange.end, 'day');
  };

  const isToday = (date: moment.Moment) => {
    return date.isSame(moment(), 'day');
  };

  const isPastDate = (date: moment.Moment) => {
    return date.isBefore(moment(), 'day');
  };

  const handleDateClick = (date: moment.Moment) => {
    if (isPastDate(date)) return;
    
    const dayPrice = getPriceForDate(date);
    if (!dayPrice?.isAvailable) return;

    if (tripType === 'roundtrip') {
      // Handle round trip date selection
      if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
        // Start new range
        setSelectedRange({ start: date.toDate(), end: null });
      } else if (selectedRange.start && !selectedRange.end) {
        // Complete the range
        if (date.isAfter(selectedRange.start, 'day')) {
          setSelectedRange({ start: selectedRange.start, end: date.toDate() });
          if (onReturnDateSelect) {
            onReturnDateSelect(date.toDate());
          }
        } else {
          // If clicked date is before start date, make it the new start
          setSelectedRange({ start: date.toDate(), end: null });
        }
      }
    } else {
      // Handle one way date selection
      setSelectedRange({ start: date.toDate(), end: null });
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = moment(prev);
      if (direction === 'prev') {
        newMonth.subtract(1, 'month');
      } else {
        newMonth.add(1, 'month');
      }
      return newMonth.toDate();
    });
  };

  const getPriceColor = (dayPrice: DayPrice | undefined) => {
    if (!dayPrice || !dayPrice.isAvailable) return 'text-red-500';
    if (dayPrice.isLowest) return 'text-green-600';
    if (dayPrice.price < 1800000) return 'text-green-500';
    if (dayPrice.price < 2200000) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPriceBackground = (dayPrice: DayPrice | undefined) => {
    if (!dayPrice || !dayPrice.isAvailable) return 'bg-red-50';
    if (dayPrice.isLowest) return 'bg-green-50';
    if (dayPrice.price < 1800000) return 'bg-green-50';
    if (dayPrice.price < 2200000) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getDateClasses = (date: moment.Moment, dayPrice: DayPrice | undefined) => {
    const baseClasses = 'h-10 md:h-12 flex flex-col items-center justify-center text-xs cursor-pointer transition-colors';
    const isCurrentMonth = date.isSame(currentMonth, 'month');
    const isPast = isPastDate(date);
    const isTodayDate = isToday(date);
    const inRange = isInRange(date);
    const rangeStart = isRangeStart(date);
    const rangeEnd = isRangeEnd(date);

    let classes = baseClasses;

    if (!isCurrentMonth) {
      classes += ' text-gray-300';
    } else if (isPast) {
      classes += ' text-gray-400 cursor-not-allowed';
    } else if (isTodayDate) {
      classes += ' bg-blue-100 text-blue-600 font-semibold';
    } else if (rangeStart || rangeEnd) {
      classes += ' bg-blue-600 text-white font-semibold';
    } else if (inRange) {
      classes += ' bg-blue-200 text-blue-800';
    } else {
      classes += ' hover:bg-gray-100';
    }

    if (dayPrice?.isAvailable) {
      classes += ` ${getPriceBackground(dayPrice)}`;
    }

    return classes;
  };

  const renderCalendarDays = () => {
    const startOfMonth = moment(currentMonth).startOf('month');
    const endOfMonth = moment(currentMonth).endOf('month');
    const startOfCalendar = startOfMonth.clone().startOf('week');
    const endOfCalendar = endOfMonth.clone().endOf('week');

    const days = [];
    const current = startOfCalendar.clone();

    while (current.isSameOrBefore(endOfCalendar, 'day')) {
      const dayPrice = getPriceForDate(current);
      const isCurrentMonth = current.isSame(currentMonth, 'month');
      const isPast = isPastDate(current);
      const isTodayDate = isToday(current);
      const inRange = isInRange(current);
      const rangeStart = isRangeStart(current);
      const rangeEnd = isRangeEnd(current);

      days.push(
        <div
          key={current.format('YYYY-MM-DD')}
          className={getDateClasses(current, dayPrice)}
          onClick={() => handleDateClick(current)}
        >
          <span className="text-xs md:text-sm">{current.format('D')}</span>
          {dayPrice && (
            <span className={`text-xs ${getPriceColor(dayPrice)}`}>
              {formatPrice(dayPrice.price)}
            </span>
          )}
        </div>
      );

      current.add(1, 'day');
    }

    return days;
  };

  const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-800">تقویم قیمت‌ها</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm md:text-base font-medium text-gray-700">
          {moment(currentMonth).format('MMMM YYYY')}
        </h4>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs md:text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        {renderCalendarDays()}
      </div>

      {tripType === 'roundtrip' && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs md:text-sm text-blue-700">
            برای انتخاب تاریخ برگشت، ابتدا تاریخ رفت را انتخاب کنید، سپس تاریخ برگشت را انتخاب کنید.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 text-xs md:text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-50 rounded"></div>
          <span>قیمت پایین</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-50 rounded"></div>
          <span>قیمت متوسط</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-50 rounded"></div>
          <span>قیمت بالا</span>
        </div>
      </div>
    </div>
  );
};

export default PriceCalendar;