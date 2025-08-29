
import { type CommissionModel, CommissionCalculationType } from '@/types';

export const initialCommissionModels: CommissionModel[] = [
    {
        id: 'CM-1',
        name: { ar: 'الطيران العارض القياسي', fa: 'چارتری استاندارد', en: 'Standard Charter' },
        calculationType: CommissionCalculationType.Percentage,
        charterCommission: 5, // 5% for charter provider
        creatorCommission: 2, // 2% for flight creator
        webServiceCommission: 1.5, // 1.5% for platform
    },
    {
        id: 'CM-2',
        name: { ar: 'خدمة ماهان الإلكترونية', fa: 'وب‌سرویس ماهان', en: 'Mahan Web Service' },
        calculationType: CommissionCalculationType.Percentage,
        charterCommission: 6, // 6% for web service provider
        creatorCommission: 1.5,
        webServiceCommission: 1,
    },
    {
        id: 'CM-3',
        name: { ar: 'النموذج العائم - ربح ثابت', fa: 'شناوری - سود ثابت', en: 'Floating Model - Fixed Profit' },
        calculationType: CommissionCalculationType.FixedAmount,
        charterCommission: 0,
        creatorCommission: 50000, // 50,000 Toman fixed profit
        webServiceCommission: 20000, // 20,000 Toman fixed profit
    },
     {
        id: 'CM-4',
        name: { ar: 'الرحلات الدولية', fa: 'پروازهای بین‌المللی', en: 'International Flights' },
        calculationType: CommissionCalculationType.Percentage,
        charterCommission: 8,
        creatorCommission: 2.5,
        webServiceCommission: 2,
    },
];
