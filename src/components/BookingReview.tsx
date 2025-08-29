

import React from 'react';
import type { Flight, SearchQuery, PassengerDetails, User, CurrencyInfo } from '@/types';
import type { PassengerData } from '@/types';
import { PriceSummary } from '@/components/PriceSummary';
import { UserIcon } from '@/components/icons/UserIcon';
import { Gender, Nationality } from '@/types';
import { WalletIcon } from '@/components/icons/WalletIcon';
import { useLocalization } from '@/hooks/useLocalization';
import { MailIcon } from '@/components/icons/MailIcon';
import { PhoneIcon } from '@/components/icons/PhoneIcon';
import { DetailedFlightSummaryCard } from '@/components/DetailedFlightSummaryCard';

interface BookingReviewProps {
    flight: Flight;
    query: SearchQuery;
    passengers: PassengerData;
    user: User;
    onBack: () => void;
    onConfirmBooking: () => void;
    currencies: CurrencyInfo[];
}

const PassengerReviewCard: React.FC<{ title: string, details: PassengerDetails[] }> = ({ title, details }) => {
    const { t } = useLocalization();
    if (details.length === 0) return null;

    return (
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-accent">{title}</h3>
            <div className="space-y-4">
                {details.map((p, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border shadow-sm">
                        <div className="flex items-center mb-3">
                            <UserIcon className="w-5 h-5 text-slate-500 ml-2" />
                            <h4 className="font-semibold text-slate-700">{t(`bookingReview.${title.toLowerCase()}` as any, 'en', index + 1)}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="font-semibold text-slate-500">{t('bookingReview.name')}:</div>
                            <div className="text-slate-800">{p.firstName} {p.lastName}</div>
                             <div className="font-semibold text-slate-500">{t('bookingReview.gender')}:</div>
                            <div className="text-slate-800">{p.gender === Gender.Male ? t('passengerDetails.male') : t('passengerDetails.female')}</div>
                            {p.nationality === Nationality.Iranian ? (
                                <>
                                    <div className="font-semibold text-slate-500">{t('bookingReview.nationality')}:</div>
                                    <div className="text-slate-800">{t('passengerDetails.iranian')}</div>
                                    <div className="font-semibold text-slate-500">{t('bookingReview.nationalId')}:</div>
                                    <div className="text-slate-800">{p.nationalId}</div>
                                </>
                            ) : (
                                 <>
                                    <div className="font-semibold text-slate-500">{t('bookingReview.nationality')}:</div>
                                    <div className="text-slate-800">{t('passengerDetails.foreign')}</div>
                                    <div className="font-semibold text-slate-500">{t('bookingReview.passportNumber')}:</div>
                                    <div className="text-slate-800">{p.passportNumber}</div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const BookingReview: React.FC<BookingReviewProps> = ({ flight, query, passengers, user, onBack, onConfirmBooking, currencies }) => {
    const { t, formatNumber } = useLocalization();
    const totalPassengers = passengers.adults.length + passengers.children.length + passengers.infants.length;
    const finalPrice = (flight.price + flight.taxes) * totalPassengers;
    const hasSufficientFunds = (user.wallet?.IRR?.balance ?? 0) >= finalPrice;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Flight Details */}
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-slate-800">{t('bookingReview.flightSummary')}</h2>
                        <DetailedFlightSummaryCard flight={flight} />
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-slate-800">{t('passengerDetails.contactInfo')}</h2>
                        <div className="bg-white rounded-lg p-4 border shadow-sm space-y-3">
                             <div className="flex items-center text-sm">
                                <MailIcon className="w-5 h-5 text-slate-400 ml-3"/>
                                <span className="font-semibold text-slate-600">{t('signup.email')}:</span>
                                <span className="mr-2 text-slate-800">{passengers.contactEmail}</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <PhoneIcon className="w-5 h-5 text-slate-400 ml-3"/>
                                <span className="font-semibold text-slate-600">{t('passengerDetails.phoneNumber')}:</span>
                                <span className="mr-2 text-slate-800">{passengers.contactPhone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Passenger Details */}
                     <div>
                        <h2 className="text-3xl font-bold mb-4 text-slate-800">{t('bookingReview.passengerDetails')}</h2>
                        <div className="space-y-6">
                            <PassengerReviewCard title={t('passengerDetails.adults')} details={passengers.adults} />
                            <PassengerReviewCard title={t('passengerDetails.children')} details={passengers.children} />
                            <PassengerReviewCard title={t('passengerDetails.infants')} details={passengers.infants} />
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 lg:sticky top-8 space-y-6">
                     <PriceSummary flight={flight} passengers={query.passengers} user={user} currencies={currencies} />
                     <div className="bg-white rounded-lg shadow p-5 border">
                        <div className="flex items-center justify-between mb-4 text-sm">
                            <div className="flex items-center text-slate-600 font-medium">
                                <WalletIcon className="w-5 h-5 ml-2 text-slate-400" />
                                <span>{t('bookingReview.walletBalance')}:</span>
                            </div>
                            <span className="font-bold text-primary">{formatNumber(user.wallet.IRR?.balance ?? 0)} {t('placeholders.rial')}</span>
                        </div>
                         <button onClick={onBack} className="w-full text-center text-primary font-semibold py-2 rounded-lg hover:bg-secondary transition-colors mb-3">
                            {t('bookingReview.editInfo')}
                         </button>
                         <button 
                            onClick={onConfirmBooking}
                            disabled={!hasSufficientFunds}
                            className="w-full bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-accent-hover transition duration-300 text-lg disabled:bg-slate-400 disabled:cursor-not-allowed">
                            {hasSufficientFunds ? t('bookingReview.confirmAndPay') : t('bookingReview.insufficientFunds')}
                         </button>
                     </div>
                </aside>
            </div>
        </div>
    );
};