import React from 'react';
import type { Flight, SearchQuery, PassengerData, User, CurrencyInfo } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';
import { CheckCircleIcon } from '@/components/icons/CheckCircleIcon';
import { FlightSummaryCard } from '@/components/FlightSummaryCard';
import { PriceSummary } from '@/components/PriceSummary';
import { UserIcon } from '@/components/icons/UserIcon';
import { MailIcon } from '@/components/icons/MailIcon';
import { PhoneIcon } from '@/components/icons/PhoneIcon';

interface BookingConfirmationProps {
    flight: Flight;
    query: SearchQuery;
    passengerData: PassengerData;
    user: User;
    currencies: CurrencyInfo[];
    onBack: () => void;
    onConfirm: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ 
    flight, 
    query, 
    passengerData, 
    user, 
    currencies, 
    onBack, 
    onConfirm 
}) => {
    const { t, formatNumber } = useLocalization();

    const totalPassengers = query.passengers.adults + query.passengers.children + query.passengers.infants;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header Section */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6">
                                <CheckCircleIcon className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-green-800 to-emerald-800 bg-clip-text text-transparent mb-4">
                                تایید نهایی رزرو
                            </h2>
                            <p className="text-slate-600 text-lg font-medium mb-6">
                                لطفاً اطلاعات زیر را بررسی کرده و در صورت صحت، رزرو خود را تایید کنید
                            </p>
                            
                            {/* Progress Indicator */}
                            <div className="bg-slate-100 rounded-xl p-4">
                                <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                                    <span>تایید نهایی</span>
                                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">مرحله 3 از 3</span>
                                </div>
                                <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{width: '100%'}}></div>
                                </div>
                            </div>
                        </div>

                        {/* Passenger Information */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <UserIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800">اطلاعات مسافران</h3>
                                    <p className="text-slate-500 font-medium">جزئیات کامل مسافران ({totalPassengers} نفر)</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Adults */}
                                {passengerData.adults.map((passenger, index) => (
                                    <div key={`adult-${index}`} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-lg">
                                                        {passenger.firstName} {passenger.lastName}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {passenger.nationality === 'IRANIAN' ? 'ایرانی' : 'خارجی'} • 
                                                        {passenger.gender === 'MALE' ? ' آقا' : ' خانم'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-slate-600">بزرگسال</p>
                                                <p className="text-xs text-slate-500">
                                                    {passenger.nationality === 'IRANIAN' 
                                                        ? `کد ملی: ${passenger.nationalId}` 
                                                        : `پاسپورت: ${passenger.passportNumber}`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Children */}
                                {passengerData.children.map((passenger, index) => (
                                    <div key={`child-${index}`} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-lg">
                                                        {passenger.firstName} {passenger.lastName}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {passenger.nationality === 'IRANIAN' ? 'ایرانی' : 'خارجی'} • 
                                                        {passenger.gender === 'MALE' ? ' آقا' : ' خانم'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-slate-600">کودک</p>
                                                <p className="text-xs text-slate-500">
                                                    {passenger.nationality === 'IRANIAN' 
                                                        ? `کد ملی: ${passenger.nationalId}` 
                                                        : `پاسپورت: ${passenger.passportNumber}`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Infants */}
                                {passengerData.infants.map((passenger, index) => (
                                    <div key={`infant-${index}`} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-lg">
                                                        {passenger.firstName} {passenger.lastName}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {passenger.nationality === 'IRANIAN' ? 'ایرانی' : 'خارجی'} • 
                                                        {passenger.gender === 'MALE' ? ' آقا' : ' خانم'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-slate-600">نوزاد</p>
                                                <p className="text-xs text-slate-500">
                                                    {passenger.nationality === 'IRANIAN' 
                                                        ? `کد ملی: ${passenger.nationalId}` 
                                                        : `پاسپورت: ${passenger.passportNumber}`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                    <MailIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800">اطلاعات تماس</h3>
                                    <p className="text-slate-500 font-medium">اطلاعات تماس برای ارسال بلیط</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                    <MailIcon className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-slate-500">ایمیل</p>
                                        <p className="font-semibold text-slate-800">{passengerData.contactEmail}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                    <PhoneIcon className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-slate-500">شماره تماس</p>
                                        <p className="font-semibold text-slate-800">{passengerData.contactPhone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1 lg:sticky top-8 space-y-6">
                        <FlightSummaryCard flight={flight} />
                        <PriceSummary flight={flight} passengers={query.passengers} user={user} currencies={currencies} />
                        
                        {/* Action Buttons */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 space-y-4">
                            <button
                                onClick={onConfirm}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                تایید و پرداخت
                            </button>
                            <button
                                onClick={onBack}
                                className="w-full text-center text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                بازگشت به ویرایش
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

