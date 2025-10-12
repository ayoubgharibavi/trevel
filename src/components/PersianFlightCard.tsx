import React, { useState } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { Flight, RefundPolicy, User, Currency } from '@/types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { PlaneIcon } from './icons/PlaneIcon';

interface PersianFlightCardProps {
  flight: Flight;
  onSelect: (flight: Flight) => void;
  refundPolicies: RefundPolicy[];
  currentUser: User | null;
  currencies: Currency[];
  showCommission?: boolean;
  isSpecialOffer?: boolean;
}

export const PersianFlightCard: React.FC<PersianFlightCardProps> = ({
  flight,
  onSelect,
  refundPolicies,
  currentUser,
  currencies,
  showCommission = true,
  isSpecialOffer = false
}) => {
  const { formatNumber, t, language } = useLocalization();
  const [activeTab, setActiveTab] = useState('');

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString(language === 'en' ? 'en-US' : 'fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDuration = (duration: string | number) => {
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    return duration;
  };

  const calculateCommission = (price: number) => {
    const commissionRate = 0.03 + Math.random() * 0.05; // 3-8% commission
    const commission = Math.round(price * commissionRate);
    return {
      commission,
      commissionRate: Math.round(commissionRate * 100),
      salePrice: price + commission,
      purchasePrice: price - commission
    };
  };

  // Convert Rials to Tomans (divide by 10)
  const totalPriceInRials = Number(flight.price) + Number(flight.taxes);
  const totalPrice = Math.round(totalPriceInRials / 10); // Convert to Tomans
  const commissionData = showCommission ? calculateCommission(totalPriceInRials) : null;
  const ticketType = flight.sourcingType === 'Charter' ? t('flightCard.charter') : t('flightCard.system');
  const remainingSeats = flight.availableSeats || Math.floor(Math.random() * 7 + 1);

  const tabs = [
    { id: 'price', label: t('flightCard.priceDetails') },
    { id: 'info', label: t('flightCard.flightInfo') },
    { id: 'refund', label: t('flightCard.refundRules') },
    { id: 'visa', label: t('flightCard.visaRules') },
    { id: 'baggage', label: t('flightCard.baggageRules') }
  ];

  return (
    <div className={`bg-white rounded-lg sm:rounded-xl shadow-lg border overflow-hidden transition-all duration-300 hover:shadow-xl ${isSpecialOffer ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50' : 'border-gray-200'}`} dir={language === 'en' ? 'ltr' : 'rtl'}>
            {/* Special Offer Badge */}
            {isSpecialOffer && (
              <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white text-center py-2 text-xs sm:text-sm font-bold shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <span className="text-lg">🎉</span>
                  <span className="tracking-wide">{t('flightCard.specialOffer')}</span>
                  <span className="text-lg">🎉</span>
                </div>
              </div>
            )}
      
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 lg:gap-6">
          {/* Flight Details */}
          <div className="flex-1 w-full xl:w-auto">
            {/* Flight Type Tags */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${flight.sourcingType === 'Charter' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {ticketType}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                {flight.flightClass || t('flightCard.economy')}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                {flight.baggageAllowance || '20 KG'}
              </span>
              {/* Source tags removed as requested */}
            </div>

            {/* Flight Route */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              {/* Departure */}
              <div className="text-center flex-1 min-w-0">
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-1">
                  {flight.departure?.dateTime ? formatTime(flight.departure.dateTime) : t('flightCard.unknown')}
                </div>
                <div className="text-xs sm:text-sm text-gray-700 font-semibold mb-1">
                  {flight.departure?.airportCode || t('flightCard.unknown')}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {flight.departure?.city || t('flightCard.unknown')}
                </div>
              </div>

              {/* Flight Path with Line */}
              <div className="flex flex-col items-center mx-3 sm:mx-6 flex-shrink-0 relative">
                {/* Duration */}
                <div className="text-xs text-gray-600 mb-1 sm:mb-2 font-medium">
                  {formatDuration(flight.duration)}
                </div>
                
                {/* Visual Line from Departure to Arrival */}
                <div className="relative w-24 sm:w-32 md:w-40 lg:w-48 h-px bg-gradient-to-r from-blue-500 via-gray-400 to-green-500">
                  {/* Departure Point */}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-sm"></div>
                  
                  {/* Plane Icon */}
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <PlaneIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 rotate-90" />
                  </div>
                  
                  {/* Arrival Point */}
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
                </div>
                
                {/* Stops Info */}
                <div className="text-xs text-gray-600 mt-1 sm:mt-2 font-medium">
                  {flight.stops === 0 ? t('flightCard.noStops') : `${flight.stops} توقف`}
                </div>
              </div>

              {/* Arrival */}
              <div className="text-center flex-1 min-w-0">
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-1">
                  {flight.arrival?.dateTime ? formatTime(flight.arrival.dateTime) : t('flightCard.unknown')}
                </div>
                <div className="text-xs sm:text-sm text-gray-700 font-semibold mb-1">
                  {flight.arrival?.airportCode || t('flightCard.unknown')}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {flight.arrival?.city || t('flightCard.unknown')}
                </div>
              </div>
            </div>

            {/* Airline and Baggage Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {flight.airlineLogoUrl && flight.airlineLogoUrl.trim() !== '' ? (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-lg shadow-sm flex items-center justify-center p-1 flex-shrink-0">
                    <img 
                      src={flight.airlineLogoUrl} 
                      alt={`${typeof flight.airline === 'string' ? flight.airline : (flight.airline?.name?.fa || flight.airline?.name?.en || flight.airline?.name || 'Airline')} logo`} 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                ) : (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-white font-bold text-xs">
                      {typeof flight.airline === 'string' ? flight.airline.charAt(0).toUpperCase() : (flight.airline?.name?.fa || flight.airline?.name?.en || flight.airline?.name || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                    {typeof flight.airline === 'string' ? flight.airline : (flight.airline?.name?.fa || flight.airline?.name?.en || flight.airline?.name || t('flightCard.unknown'))}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {flight.flightNumber} • {flight.aircraft?.name?.fa || flight.aircraft?.name?.en || flight.aircraft?.name || flight.aircraft || t('flightCard.unknown')}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full font-medium">
                      {flight.class}
                    </span>
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded-full font-medium">
                      {flight.baggageAllowance || '20 KG'}
                    </span>
                    {/* Flight Type Tags */}
                    {flight.sourcingType === 'Charter' && (
                      <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded-full font-medium">
                        چارتری
                      </span>
                    )}
                    {flight.sourcingType === 'System' && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-medium">
                        سیستمی
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
            </div>

            {/* Information Tabs */}
            <div className="flex items-center gap-1 text-xs overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`hover:text-blue-800 transition-all duration-200 px-2 py-1.5 sm:py-2 rounded-lg font-medium whitespace-nowrap touch-manipulation ${
                    activeTab === tab.id 
                      ? 'text-blue-700 bg-blue-100 border border-blue-200' 
                      : 'text-blue-600 hover:bg-blue-50 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price and Action */}
          <div className={`text-left w-full xl:w-auto ${language === 'en' ? 'xl:ml-6' : 'xl:mr-6'} xl:min-w-[300px]`}>
            <div className="flex flex-row gap-2 mb-3">
              {/* Price */}
              <div className="text-center p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm flex-1 sm:flex-[2]">
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-600 mb-1">
                  {formatNumber(totalPrice)}
                </div>
                <div className="text-xs sm:text-sm text-blue-700 font-semibold">{t('placeholders.toman')}</div>
              </div>
              
              {/* Remaining Seats */}
              <div className="flex items-center justify-center gap-1 p-1.5 sm:p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 w-16">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="text-center">
                  <div className="text-sm sm:text-base md:text-lg font-bold text-green-600 mb-0.5">
                    {remainingSeats}
                  </div>
                  <div className="text-[7px] sm:text-[8px] text-green-700 font-medium">
                    {t('flightCard.remainingSeats')}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Information Tabs */}
            <div className="mb-3">
              <div className="flex overflow-x-auto scrollbar-hide gap-1 py-1">
                <button
                  onClick={() => setActiveTab('pricing')}
                  className={`px-2 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors touch-manipulation ${
                    activeTab === 'pricing'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  جزئیات قیمت
                </button>
                <button
                  onClick={() => setActiveTab('flight')}
                  className={`px-2 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors touch-manipulation ${
                    activeTab === 'flight'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  اطلاعات پرواز
                </button>
                <button
                  onClick={() => setActiveTab('refund')}
                  className={`px-2 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors touch-manipulation ${
                    activeTab === 'refund'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  قوانین استرداد
                </button>
                <button
                  onClick={() => setActiveTab('visa')}
                  className={`px-2 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors touch-manipulation ${
                    activeTab === 'visa'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  قوانین ویزا و مسیر
                </button>
                <button
                  onClick={() => setActiveTab('baggage')}
                  className={`px-2 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors touch-manipulation ${
                    activeTab === 'baggage'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  قوانین بار
                </button>
              </div>
            </div>
            
            <button
              onClick={() => onSelect(flight)}
              className={`w-full font-bold py-2.5 px-3 rounded-lg transition-all duration-200 transform hover:scale-105 text-sm touch-manipulation ${
                isSpecialOffer 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg'
              }`}
            >
              {isSpecialOffer ? `🎯 ${t('flightCard.selectSpecialOffer')}` : t('flightCard.selectFlight')}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'price' && (
        <div className="border-t bg-gray-50 p-3 sm:p-4" dir={language === 'en' ? 'ltr' : 'rtl'}>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className={`py-2 font-medium text-gray-700 ${language === 'en' ? 'text-left' : 'text-right'}`}>{t('flightCard.ageRange')}</th>
                  <th className="text-center py-2 font-medium text-gray-700">{t('flightCard.basePrice')}</th>
                  <th className="text-center py-2 font-medium text-gray-700">{t('flightCard.tax')}</th>
                  <th className="text-center py-2 font-medium text-gray-700">{t('flightCard.services')}</th>
                  <th className="text-center py-2 font-medium text-gray-700">{t('flightCard.salePrice')}</th>
                  <th className="text-center py-2 font-medium text-gray-700">{t('flightCard.commission')}</th>
                  <th className="text-center py-2 font-medium text-gray-700">{t('flightCard.purchasePrice')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className={`py-3 text-gray-800 ${language === 'en' ? 'text-left' : 'text-right'}`}>{t('flightCard.adult')}</td>
                  <td className="py-3 text-center text-gray-600">{formatNumber(flight.price)}</td>
                  <td className="py-3 text-center text-gray-600">{formatNumber(flight.taxes || 0)}</td>
                  <td className="py-3 text-center text-gray-600">{formatNumber(flight.services || 0)}</td>
                  <td className="py-3 text-center text-gray-600">{formatNumber(Number(flight.price) + Number(flight.taxes || 0) + Number(flight.services || 0))}</td>
                  <td className="py-3 text-center text-gray-600">{formatNumber(commissionData?.commission || 0)}</td>
                  <td className="py-3 text-center text-gray-600">{formatNumber(commissionData?.purchasePrice || Number(flight.price) + Number(flight.taxes || 0) + Number(flight.services || 0))}</td>
                </tr>
                <tr className="border-b">
                  <td className={`py-3 text-gray-800 font-medium ${language === 'en' ? 'text-left' : 'text-right'}`}>{t('flightCard.total')}</td>
                  <td className="py-3 text-center text-gray-600"></td>
                  <td className="py-3 text-center text-gray-600"></td>
                  <td className="py-3 text-center text-gray-600"></td>
                  <td className="py-3 text-center text-gray-800 font-bold">{formatNumber(Number(flight.price) + Number(flight.taxes || 0) + Number(flight.services || 0))}</td>
                  <td className="py-3 text-center text-green-600 font-bold">{formatNumber(commissionData?.commission || 0)}</td>
                  <td className="py-3 text-center text-blue-600 font-bold">{formatNumber(commissionData?.purchasePrice || Number(flight.price) + Number(flight.taxes || 0) + Number(flight.services || 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-4">
            <button 
              onClick={() => setActiveTab('')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 touch-manipulation py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span>{t('flightCard.close')}</span>
              <ChevronDownIcon className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'info' && (
        <div className="border-t bg-gradient-to-br from-blue-50 to-indigo-50 p-3" dir={language === 'en' ? 'ltr' : 'rtl'}>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header with Duration */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <PlaneIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{t('flightCard.flightInfo')}</h3>
                    <p className="text-blue-100 text-xs">
                      {typeof flight.duration === 'number' 
                        ? language === 'en'
                          ? `${Math.floor(flight.duration / 60)} hours and ${flight.duration % 60} minutes`
                          : `${Math.floor(flight.duration / 60)} ساعت و ${flight.duration % 60} دقیقه`
                        : flight.duration || t('flightCard.unknown')
                      }
                    </p>
                  </div>
                </div>
                <div className={`${language === 'en' ? 'text-left' : 'text-right'}`}>
                  <div className="text-xs text-blue-100">{t('flightCard.flightNumber')}</div>
                  <div className="font-bold text-sm">{flight.flightNumber}</div>
                </div>
              </div>
            </div>

            {/* Additional Flight Information */}
            <div className="p-3 sm:p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">{t('flightCard.aircraft')}</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {flight.aircraft?.name?.fa || flight.aircraft?.name?.en || flight.aircraft?.name || flight.aircraft || t('flightCard.unknown')}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">{t('flightCard.flightClass')}</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {flight.flightClass || t('flightCard.economy')}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">{t('flightCard.totalCapacity')}</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {flight.totalCapacity ? `${flight.availableSeats || 0}/${flight.totalCapacity}` : t('flightCard.unknown')}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">{t('flightCard.baggageAllowance')}</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {flight.baggageAllowance || '30 KG'}
                  </div>
                </div>
              </div>
              
              {flight.bookingClosesBeforeDepartureHours && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <div className="text-xs text-yellow-700 mb-1">{t('flightCard.bookingCloses')}</div>
                  <div className="text-sm font-semibold text-yellow-800">
                    {flight.bookingClosesBeforeDepartureHours} ساعت قبل از پرواز
                  </div>
                </div>
              )}
              
              {flight.allotments && flight.allotments.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-700 mb-1">{t('flightCard.seatAllotments')}</div>
                  <div className="text-sm font-semibold text-blue-800">
                    {flight.allotments.length} تخصیص صندلی موجود
                  </div>
                </div>
              )}
            </div>

            {/* Flight Route */}
            <div className="p-3 sm:p-4">
              {/* Departure */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
                <div className={`${language === 'en' ? 'text-left' : 'text-right'} flex-1`}>
                  <div className="text-xs text-gray-500 mb-1">{t('flightCard.departure')}</div>
                  <div className="text-sm font-semibold text-gray-800 mb-1">
                    {flight.departure?.city || t('flightCard.unknown')}
                  </div>
                  <div className="text-xs text-gray-600">
                    {flight.departure?.airportName || flight.departure?.airportCode || t('flightCard.unknown')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ({flight.departure?.airportCode || t('flightCard.unknown')})
                  </div>
                </div>
                
                <div className="flex flex-col items-center mx-2 sm:mx-4">
                  <div className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                    {flight.departure?.dateTime ? formatTime(flight.departure.dateTime) : t('flightCard.unknown')}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {flight.departure?.dateTime ? new Date(flight.departure.dateTime).toLocaleDateString(language === 'en' ? 'en-US' : 'fa-IR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : t('flightCard.unknown')}
                  </div>
                </div>
              </div>

              {/* Flight Path Visual */}
              <div className="flex items-center justify-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-300 via-blue-500 to-green-300 relative">
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <PlaneIcon className="w-3 h-3 text-blue-600 rotate-90" />
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>

              {/* Arrival */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                <div className={`${language === 'en' ? 'text-left' : 'text-right'} flex-1`}>
                  <div className="text-xs text-gray-500 mb-1">{t('flightCard.arrival')}</div>
                  <div className="text-sm font-semibold text-gray-800 mb-1">
                    {flight.arrival?.city || t('flightCard.unknown')}
                  </div>
                  <div className="text-xs text-gray-600">
                    {flight.arrival?.airportName || flight.arrival?.airportCode || t('flightCard.unknown')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ({flight.arrival?.airportCode || t('flightCard.unknown')})
                  </div>
                </div>
                
                <div className="flex flex-col items-center mx-2 sm:mx-4">
                  <div className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                    {flight.arrival?.dateTime ? formatTime(flight.arrival.dateTime) : t('flightCard.unknown')}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {flight.arrival?.dateTime ? new Date(flight.arrival.dateTime).toLocaleDateString(language === 'en' ? 'en-US' : 'fa-IR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : t('flightCard.unknown')}
                  </div>
                </div>
              </div>

              {/* Flight Details Cards */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-blue-50 rounded-lg p-2 border border-blue-200 text-center">
                  <div className="text-xs text-blue-600 mb-1">{t('flightCard.class')}</div>
                  <div className="font-bold text-blue-800 text-xs">{flight.flightClass?.name?.fa || flight.flightClass?.name?.en || flight.flightClass?.name || flight.flightClass || t('flightCard.unknown')}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-2 border border-green-200 text-center">
                  <div className="text-xs text-green-600 mb-1">{t('flightCard.aircraft')}</div>
                  <div className="font-bold text-green-800 text-xs">{flight.aircraft?.name?.fa || flight.aircraft?.name?.en || flight.aircraft?.name || flight.aircraft || t('flightCard.unknown')}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-2 border border-purple-200 text-center">
                  <div className="text-xs text-purple-600 mb-1">{t('flightCard.stops')}</div>
                  <div className="font-bold text-purple-800 text-xs">
                    {flight.stops === 0 ? t('flightCard.none') : flight.stops}
                  </div>
                </div>
              </div>

              {/* Airline Information */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {flight.airlineLogoUrl && flight.airlineLogoUrl.trim() !== '' ? (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-lg shadow-sm flex items-center justify-center p-1">
                        <img 
                          src={flight.airlineLogoUrl} 
                          alt={`${typeof flight.airline === 'string' ? flight.airline : (flight.airline?.name?.fa || flight.airline?.name?.en || flight.airline?.name || 'Airline')} logo`} 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">
                          {typeof flight.airline === 'string' ? flight.airline.charAt(0).toUpperCase() : (flight.airline?.name?.fa || flight.airline?.name?.en || flight.airline?.name || 'A').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{t('flightCard.airline')}</div>
                      <div className="text-xs sm:text-sm font-bold text-gray-800">
                        {typeof flight.airline === 'string' ? flight.airline : (flight.airline?.name?.fa || flight.airline?.name?.en || flight.airline?.name || t('flightCard.unknown'))}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`${language === 'en' ? 'text-left' : 'text-right'}`}>
                    <div className="text-xs text-gray-500 mb-1">{t('flightCard.status')}</div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-green-600">
                        {flight.status === 'ON_TIME' ? t('flightCard.onTime') : 
                         flight.status === 'DELAYED' ? t('flightCard.delayed') : 
                         flight.status === 'CANCELLED' ? t('flightCard.cancelled') : t('flightCard.unknown')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-3">
            <button 
              onClick={() => setActiveTab('')}
              className="bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 px-4 py-3 rounded-lg border border-gray-200 shadow-sm flex items-center gap-1 transition-all duration-200 touch-manipulation"
            >
              <ChevronDownIcon className="w-3 h-3 rotate-180" />
              <span className="text-sm">{t('flightCard.close')}</span>
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'refund' && (
        <div className="border-t bg-gray-50 p-3 sm:p-4" dir={language === 'en' ? 'ltr' : 'rtl'}>
          <div className="bg-white rounded-lg p-3 sm:p-4">
            {/* Header */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{t('flightCard.refundTicketRules')}</h3>
              <div className="text-sm text-gray-600">
                {t('flightCard.refundRulesForFlight')} {flight.flightNumber} - {typeof flight.airline === 'string' ? flight.airline : (flight.airline?.name?.fa || flight.airline?.name?.en || flight.airline?.name || t('flightCard.airline'))}
              </div>
            </div>

            {/* Refund Policy Source */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">{t('flightCard.informationSource')}:</span>
                <span className="text-sm text-blue-600">
                  {refundPolicies.length > 0 ? t('flightCard.airlineWebService') : t('flightCard.adminPanel')}
                </span>
              </div>
            </div>

            {/* Dynamic Refund Policies from Web Service */}
            {refundPolicies.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 text-center">{t('flightCard.refundRulesFromWebService')}</h4>
                {refundPolicies.map((policy, index) => (
                  <div key={index} className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-green-800">{policy.name || t('flightCard.refundRule')}</h5>
                        <p className="text-sm text-green-600">{policy.description || t('flightCard.ruleDescription')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:p-4">
                      <div>
                        <h6 className="font-medium text-gray-700 mb-2">{t('flightCard.refundConditions')}:</h6>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• {t('flightCard.refundPercentage')}: {policy.refundPercentage || t('flightCard.unknown')}%</li>
                          <li>• {t('flightCard.cancellationFee')}: {policy.cancellationFee || t('flightCard.unknown')}</li>
                          <li>• {t('flightCard.refundDeadline')}: {policy.refundDeadline || t('flightCard.unknown')}</li>
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-medium text-gray-700 mb-2">{t('flightCard.ticketType')}:</h6>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• {t('flightCard.flightClass')}: {policy.flightClass || flight.flightClass?.name?.fa || flight.flightClass?.name?.en || flight.flightClass?.name || flight.flightClass}</li>
                          <li>• {t('flightCard.type')}: {policy.ticketType || t('flightCard.normal')}</li>
                          <li>• {t('flightCard.status')}: {policy.status || t('flightCard.active')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Default Refund Policies from Admin Panel */
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 text-center">{t('flightCard.defaultRefundRules')}</h4>
                
                {/* Refund Timeline */}
                <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 border border-yellow-200">
                  <h5 className="font-bold text-yellow-800 mb-3">{t('flightCard.refundTimeline')}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:p-4">
                    <div className="text-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-sm">24</span>
                      </div>
                      <h6 className="font-medium text-yellow-800 mb-1">24 {t('flightCard.hoursBefore')}</h6>
                      <p className="text-xs text-yellow-700">{t('flightCard.fullRefund')}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-sm">12</span>
                      </div>
                      <h6 className="font-medium text-orange-800 mb-1">12 {t('flightCard.hoursBefore')}</h6>
                      <p className="text-xs text-orange-700">{t('flightCard.refund80Percent')}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                      <h6 className="font-medium text-red-800 mb-1">2 {t('flightCard.hoursBefore')}</h6>
                      <p className="text-xs text-red-700">{t('flightCard.refund50Percent')}</p>
                    </div>
                  </div>
                </div>

                {/* Refund Rules by Flight Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:p-4">
                  {/* Charter Flights */}
                  <div className="bg-red-50 rounded-lg p-3 sm:p-4 border border-red-200">
                    <h5 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      {t('flightCard.charterFlights')}
                    </h5>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• {t('flightCard.refundUpTo48Hours')}</li>
                      <li>• {t('flightCard.refundUpTo24Hours')}</li>
                      <li>• {t('flightCard.refundUpTo12Hours')}</li>
                      <li>• {t('flightCard.lessThan12Hours')}</li>
                    </ul>
                  </div>

                  {/* Regular Flights */}
                  <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
                    <h5 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {t('flightCard.regularFlights')}
                    </h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• {t('flightCard.refundUpTo24HoursRegular')}</li>
                      <li>• {t('flightCard.refundUpTo12HoursRegular')}</li>
                      <li>• {t('flightCard.refundUpTo2HoursRegular')}</li>
                      <li>• {t('flightCard.lessThan2Hours')}</li>
                    </ul>
                  </div>
                </div>

                {/* Refund Process */}
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                  <h5 className="font-bold text-blue-800 mb-3">{t('flightCard.refundProcess')}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:p-4">
                    <div className="text-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-sm">1</span>
                      </div>
                      <h6 className="font-medium text-blue-800 mb-1">{t('flightCard.request')}</h6>
                      <p className="text-xs text-blue-700">{t('flightCard.submitRefundRequest')}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                      <h6 className="font-medium text-blue-800 mb-1">{t('flightCard.review')}</h6>
                      <p className="text-xs text-blue-700">{t('flightCard.reviewRefundConditions')}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-sm">3</span>
                      </div>
                      <h6 className="font-medium text-blue-800 mb-1">{t('flightCard.approval')}</h6>
                      <p className="text-xs text-blue-700">{t('flightCard.approveRefundRequest')}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-sm">4</span>
                      </div>
                      <h6 className="font-medium text-blue-800 mb-1">{t('flightCard.payment')}</h6>
                      <p className="text-xs text-blue-700">{t('flightCard.processRefundPayment')}</p>
                    </div>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-orange-50 rounded-lg p-3 sm:p-4 border border-orange-200">
                  <h5 className="font-bold text-orange-800 mb-3">{t('flightCard.importantNotes')}</h5>
                  <div className="text-sm text-orange-700 space-y-2">
                    <p>• {t('flightCard.discountedTicketsMayDiffer')}</p>
                    <p>• {t('flightCard.additionalFeesNotRefundable')}</p>
                    <p>• {t('flightCard.refundSamePaymentMethod')}</p>
                    <p>• {t('flightCard.refundProcessingTime')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 mt-4">
              <h5 className="font-bold text-gray-800 mb-3">{t('flightCard.contactForRefund')}</h5>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• {t('flightCard.contactSupportForRefund')}</p>
                <p>• {t('flightCard.flightNumber')}: {flight.flightNumber}</p>
                <p>• {t('flightCard.airline')}: {typeof flight.airline === 'string' ? flight.airline : (flight.airline?.name?.fa || flight.airline?.name?.en || flight.airline?.name || t('flightCard.unknown'))}</p>
                <p>• {t('flightCard.contactTime')}: {t('flightCard.available24Hours')}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-4">
            <button 
              onClick={() => setActiveTab('')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>{t('flightCard.close')}</span>
              <ChevronDownIcon className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'visa' && (
        <div className="border-t bg-gray-50 p-3 sm:p-4" dir={language === 'en' ? 'ltr' : 'rtl'}>
          <div className="bg-white rounded-lg p-3 sm:p-4">
            {/* Header */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{t('flightCard.visaAndRouteRules')}</h3>
              <div className="text-sm text-gray-600">
                {t('flightCard.visaAndRouteInfo')} {flight.departure?.city || t('flightCard.unknown')} {language === 'en' ? 'to' : 'به'} {flight.arrival?.city || t('flightCard.unknown')}
              </div>
            </div>

            {/* Route Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:p-4 mb-6">
              {/* Departure Country */}
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">D</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-800">{t('flightCard.departureCountry')}</h4>
                    <p className="text-sm text-blue-600">{flight.departure?.city || t('flightCard.unknown')}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('flightCard.airport')}:</span>
                    <span className="text-sm font-medium text-gray-800">{flight.departure?.airportCode || t('flightCard.unknown')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('flightCard.city')}:</span>
                    <span className="text-sm font-medium text-gray-800">{flight.departure?.city || t('flightCard.unknown')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('flightCard.countryCode')}:</span>
                    <span className="text-sm font-medium text-gray-800">{flight.departure?.countryCode || 'IR'}</span>
                  </div>
                </div>
              </div>

              {/* Arrival Country */}
              <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800">{t('flightCard.arrivalCountry')}</h4>
                    <p className="text-sm text-green-600">{flight.arrival?.city || t('flightCard.unknown')}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('flightCard.airport')}:</span>
                    <span className="text-sm font-medium text-gray-800">{flight.arrival?.airportCode || t('flightCard.unknown')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('flightCard.city')}:</span>
                    <span className="text-sm font-medium text-gray-800">{flight.arrival?.city || t('flightCard.unknown')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('flightCard.countryCode')}:</span>
                    <span className="text-sm font-medium text-gray-800">{flight.arrival?.countryCode || 'AE'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visa Requirements */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800 text-center">{t('flightCard.visaRequirements')}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:p-4">
                {/* Visa Required */}
                <div className="bg-red-50 rounded-lg p-3 sm:p-4 border border-red-200">
                  <h5 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {t('flightCard.visaRequired')}
                  </h5>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• {t('flightCard.touristVisaForIranians')}</li>
                    <li>• {t('flightCard.transitVisaForInternational')}</li>
                    <li>• {t('flightCard.businessVisaForWork')}</li>
                    <li>• {t('flightCard.studentVisaForStudents')}</li>
                  </ul>
                </div>

                {/* Visa Exemptions */}
                <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
                  <h5 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {t('flightCard.visaExemptions')}
                  </h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• {t('flightCard.schengenCitizens')}</li>
                    <li>• {t('flightCard.diplomaticPassportHolders')}</li>
                    <li>• {t('flightCard.transitLessThan24h')}</li>
                    <li>• {t('flightCard.childrenUnder12WithParents')}</li>
                  </ul>
                </div>
              </div>

              {/* Visa Application Process */}
              <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 border border-yellow-200">
                <h5 className="font-bold text-yellow-800 mb-3">{t('flightCard.visaApplicationProcess')}</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:p-4">
                  <div className="text-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <h6 className="font-medium text-yellow-800 mb-1">{t('flightCard.onlineApplication')}</h6>
                    <p className="text-xs text-yellow-700">{t('flightCard.completeVisaForm')}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <h6 className="font-medium text-yellow-800 mb-1">{t('flightCard.submitDocuments')}</h6>
                    <p className="text-xs text-yellow-700">{t('flightCard.submitRequiredDocuments')}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <h6 className="font-medium text-yellow-800 mb-1">{t('flightCard.receiveVisa')}</h6>
                    <p className="text-xs text-yellow-700">{t('flightCard.receiveVisaAndTravel')}</p>
                  </div>
                </div>
              </div>

              {/* Required Documents */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                <h5 className="font-bold text-gray-800 mb-3">{t('flightCard.requiredDocuments')}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:p-4">
                  <div>
                    <h6 className="font-medium text-gray-700 mb-2">{t('flightCard.mainDocuments')}:</h6>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• {t('flightCard.validPassport')}</li>
                      <li>• {t('flightCard.visaApplicationForm')}</li>
                      <li>• {t('flightCard.passportPhoto')}</li>
                      <li>• {t('flightCard.flightTicket')}</li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-medium text-gray-700 mb-2">{t('flightCard.additionalDocuments')}:</h6>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• {t('flightCard.employmentCertificate')}</li>
                      <li>• {t('flightCard.bankStatement')}</li>
                      <li>• {t('flightCard.travelInsurance')}</li>
                      <li>• {t('flightCard.hotelReservation')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Flight Route Information */}
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                <h5 className="font-bold text-blue-800 mb-3">{t('flightCard.flightRouteInformation')}</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('flightCard.route')}:</span>
                    <span className="text-sm font-medium text-gray-800">
                      {flight.departure?.airportCode || t('flightCard.unknown')} → {flight.arrival?.airportCode || t('flightCard.unknown')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('flightCard.flightDuration')}:</span>
                    <span className="text-sm font-medium text-gray-800">
                      {typeof flight.duration === 'number' 
                        ? language === 'en' 
                          ? `${Math.floor(flight.duration / 60)} hours and ${flight.duration % 60} minutes`
                          : `${Math.floor(flight.duration / 60)} ساعت و ${flight.duration % 60} دقیقه`
                        : flight.duration
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('flightCard.stops')}:</span>
                    <span className="text-sm font-medium text-gray-800">
                      {flight.stops === 0 ? t('flightCard.noStops') : language === 'en' ? `${flight.stops} stops` : `${flight.stops} توقف`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('flightCard.flightType')}:</span>
                    <span className="text-sm font-medium text-gray-800">
                      {flight.sourcingType === 'Charter' ? t('flightCard.charter') : t('flightCard.regular')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-orange-50 rounded-lg p-3 sm:p-4 border border-orange-200">
                <h5 className="font-bold text-orange-800 mb-3">{t('flightCard.importantNotes')}</h5>
                <div className="text-sm text-orange-700 space-y-2">
                  <p>• {t('flightCard.visaRulesMayChange')}</p>
                  <p>• {t('flightCard.contactEmbassyForAccurateInfo')}</p>
                  <p>• {t('flightCard.receiveVisaAtLeast2WeeksBefore')}</p>
                  <p>• {t('flightCard.translateDocumentsToEnglish')}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-4">
            <button 
              onClick={() => setActiveTab('')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>{t('flightCard.close')}</span>
              <ChevronDownIcon className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'baggage' && (
        <div className="border-t bg-gray-50 p-3 sm:p-4" dir={language === 'en' ? 'ltr' : 'rtl'}>
          <div className="bg-white rounded-lg p-3 sm:p-4">
            {/* Header */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{t('flightCard.baggageAndSuitcaseRules')}</h3>
              <div className="text-sm text-gray-600">
                {t('flightCard.baggageInfoForFlight')} {flight.flightNumber}
              </div>
            </div>

            {/* Baggage Allowance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:p-4 mb-6">
              {/* Hand Baggage */}
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">H</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-800">{t('flightCard.handBaggageTitle')}</h4>
                    <p className="text-sm text-blue-600">{language === 'en' ? 'Hand Baggage' : 'Hand Baggage'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('flightCard.allowedWeight')}:</span>
                    <span className="text-sm font-medium text-gray-800">{language === 'en' ? '8 kg' : '8 کیلوگرم'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('flightCard.dimensions')}:</span>
                    <span className="text-sm font-medium text-gray-800">{language === 'en' ? '55×40×20 cm' : '55×40×20 سانتی‌متر'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('flightCard.quantity')}:</span>
                    <span className="text-sm font-medium text-gray-800">{language === 'en' ? '1 piece' : '1 قطعه'}</span>
                  </div>
                </div>
              </div>

              {/* Checked Baggage */}
              <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">C</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800">{t('flightCard.checkedBaggageTitle')}</h4>
                    <p className="text-sm text-green-600">{language === 'en' ? 'Checked Baggage' : 'Checked Baggage'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('flightCard.allowedWeight')}:</span>
                    <span className="text-sm font-medium text-gray-800">{language === 'en' ? `${flight.baggageAllowance || '30'} kg` : `${flight.baggageAllowance || '30'} کیلوگرم`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('flightCard.dimensions')}:</span>
                    <span className="text-sm font-medium text-gray-800">{language === 'en' ? '158 cm' : '158 سانتی‌متر'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('flightCard.quantity')}:</span>
                    <span className="text-sm font-medium text-gray-800">{language === 'en' ? '1 piece' : '1 قطعه'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Baggage Rules */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800 text-center">{language === 'en' ? 'Rules and Regulations' : 'قوانین و مقررات'}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:p-4">
                {/* Prohibited Items */}
                <div className="bg-red-50 rounded-lg p-3 sm:p-4 border border-red-200">
                  <h5 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {t('flightCard.prohibitedItems')}
                  </h5>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• {t('flightCard.explosiveMaterials')}</li>
                    <li>• {t('flightCard.liquidsOver100ml')}</li>
                    <li>• {t('flightCard.sharpObjects')}</li>
                    <li>• {t('flightCard.extraLithiumBatteries')}</li>
                  </ul>
                </div>

                {/* Special Items */}
                <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 border border-yellow-200">
                  <h5 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    {t('flightCard.specialItems')}
                  </h5>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• {t('flightCard.liquidMedicines')}</li>
                    <li>• {t('flightCard.babyFood')}</li>
                    <li>• {t('flightCard.medicalEquipment')}</li>
                    <li>• {t('flightCard.musicalInstruments')}</li>
                  </ul>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                <h5 className="font-bold text-gray-800 mb-3">{t('flightCard.additionalInformation')}</h5>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• {t('flightCard.excessBaggageFee')}</p>
                  <p>• {t('flightCard.rulesMayVary')}</p>
                  <p>• {t('flightCard.contactAirline')}</p>
                  <p>• {t('flightCard.valuableBaggageInsurance')}</p>
                </div>
              </div>

              {/* Airline Contact */}
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                <h5 className="font-bold text-blue-800 mb-3">{t('flightCard.airlineContact')}</h5>
                <div className="text-sm text-blue-700">
                  <p>{t('flightCard.baggageQuestions')} {typeof flight.airline === 'string' ? flight.airline : (flight.airline?.name?.fa || flight.airline?.name?.en || flight.airline?.name || t('flightCard.unknown'))}</p>
                  <p className="mt-2">{t('flightCard.flightNumberLabel')}: {flight.flightNumber}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-4">
            <button 
              onClick={() => setActiveTab('')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>{t('flightCard.close')}</span>
              <ChevronDownIcon className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'pricing' && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-2">جزئیات قیمت</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>قیمت پایه:</span>
              <span>{formatNumber(Math.round((flight.basePrice || flight.price) / 10))} تومان</span>
            </div>
            <div className="flex justify-between">
              <span>مالیات:</span>
              <span>{formatNumber(Math.round((flight.tax || flight.taxes || 0) / 10))} تومان</span>
            </div>
            <div className="flex justify-between">
              <span>کارمزد:</span>
              <span>{formatNumber(Math.round((flight.fee || flight.services || 0) / 10))} تومان</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-800 border-t pt-2">
              <span>مجموع:</span>
              <span>{formatNumber(totalPrice)} تومان</span>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'flight' && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-2">اطلاعات پرواز</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>شماره پرواز:</span>
              <span>{flight.flightNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>نوع هواپیما:</span>
              <span>{flight.aircraftType || 'نامشخص'}</span>
            </div>
            <div className="flex justify-between">
              <span>کلاس پرواز:</span>
              <span>{flight.class}</span>
            </div>
            <div className="flex justify-between">
              <span>توقف:</span>
              <span>{flight.stops === 0 ? 'بدون توقف' : `${flight.stops} توقف`}</span>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'refund' && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-2">قوانین استرداد</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• امکان استرداد تا 24 ساعت قبل از پرواز</p>
            <p>• کسر 10% از مبلغ بابت کارمزد استرداد</p>
            <p>• استرداد کامل در صورت لغو پرواز توسط ایرلاین</p>
            <p>• عدم امکان استرداد در صورت عدم حضور در پرواز</p>
          </div>
        </div>
      )}
      
      {activeTab === 'visa' && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-2">قوانین ویزا و مسیر</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• بررسی الزامات ویزای مقصد قبل از خرید</p>
            <p>• مسئولیت مسافر در تهیه مدارک مورد نیاز</p>
            <p>• امکان تغییر مسیر با پرداخت هزینه اضافی</p>
            <p>• رعایت قوانین ترانزیت کشورهای میانی</p>
          </div>
        </div>
      )}
      
      {activeTab === 'baggage' && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-2">قوانین بار</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>بار مجاز:</span>
              <span>{flight.baggageAllowance || '20 کیلوگرم'}</span>
            </div>
            <p>• ابعاد بار دستی: 55×40×20 سانتی‌متر</p>
            <p>• بار اضافی با پرداخت هزینه اضافی</p>
            <p>• ممنوعیت حمل اشیاء خطرناک</p>
            <p>• مسئولیت مسافر در حفظ بار</p>
          </div>
        </div>
      )}

    </div>
  );
};
