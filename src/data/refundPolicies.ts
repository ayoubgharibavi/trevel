import { PolicyType, type RefundPolicy } from '@/types';

export const initialRefundPolicies: RefundPolicy[] = [
    {
        id: 'RP-1',
        name: {
            ar: 'سياسة استرداد قياسية دولية',
            fa: 'سیاست استرداد استاندارد بین‌المللی',
            en: 'Standard International Refund Policy'
        },
        policyType: PolicyType.International,
        rules: [
            { id: 'rule-1-1', hoursBeforeDeparture: 72, penaltyPercentage: 10 }, // 10% penalty if cancelled more than 72 hours before
            { id: 'rule-1-2', hoursBeforeDeparture: 24, penaltyPercentage: 50 }, // 50% penalty if cancelled between 72 and 24 hours before
            { id: 'rule-1-3', hoursBeforeDeparture: 0, penaltyPercentage: 100 },   // 100% penalty if cancelled less than 24 hours before
        ]
    },
    {
        id: 'RP-2',
        name: {
            ar: 'سياسة استرداد مرنة داخلية',
            fa: 'سیاست استرداد منعطف داخلی',
            en: 'Flexible Domestic Refund Policy'
        },
        policyType: PolicyType.Domestic,
        rules: [
            { id: 'rule-2-1', hoursBeforeDeparture: 24, penaltyPercentage: 0 },   // 0% penalty if cancelled more than 24 hours before
            { id: 'rule-2-2', hoursBeforeDeparture: 0, penaltyPercentage: 80 },  // 80% penalty if cancelled less than 24 hours before
        ]
    },
    {
        id: 'RP-3',
        name: {
            ar: 'غير قابل للاسترداد (عام)',
            fa: 'غیر قابل استرداد (عمومی)',
            en: 'Non-refundable (General)'
        },
        rules: [
            { id: 'rule-3-1', hoursBeforeDeparture: 0, penaltyPercentage: 100 }, // 100% penalty always
        ]
    }
];
