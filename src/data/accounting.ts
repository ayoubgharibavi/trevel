
import { type Account, AccountType } from '@/types';

export const initialChartOfAccounts: Account[] = [
    // 1000: الأصول (Assets)
    { id: '1000', name: { ar: 'الأصول', fa: 'دارایی‌ها', en: 'Assets' }, type: AccountType.Asset, parent: null, isParent: true },
    { id: '1010', name: { ar: 'النقدية والبنوك', fa: 'نقد و بانک', en: 'Cash and Banks' }, type: AccountType.Asset, parent: '1000', isParent: false },
    { id: '1020', name: { ar: 'حسابات مدينة', fa: 'حساب‌های دریافتنی', en: 'Accounts Receivable' }, type: AccountType.Asset, parent: '1000', isParent: false },
    { id: '1030', name: { ar: 'دفعات مقدمة', fa: 'پیش‌پرداخت‌ها', en: 'Prepayments' }, type: AccountType.Asset, parent: '1000', isParent: false },

    // 2000: الالتزامات (Liabilities)
    { id: '2000', name: { ar: 'الالتزامات', fa: 'بدهی‌ها', en: 'Liabilities' }, type: AccountType.Liability, parent: null, isParent: true },
    { id: '2010', name: { ar: 'حسابات دائنة', fa: 'حساب‌های پرداختنی', en: 'Accounts Payable' }, type: AccountType.Liability, parent: '2000', isParent: false },
    { id: '2020', name: { ar: 'ضرائب مستحقة', fa: 'مالیات‌های پرداختنی', en: 'Taxes Payable' }, type: AccountType.Liability, parent: '2000', isParent: false },
    { id: '2030', name: { ar: 'إيرادات غير مكتسبة', fa: 'درآمدهای تحقق نیافته', en: 'Unearned Revenue' }, type: AccountType.Liability, parent: '2000', isParent: false },
    { id: '2040', name: { ar: 'عمولة الطيران العارض المستحقة', fa: 'کمیسیون چارترکننده پرداختنی', en: 'Charterer Commission Payable' }, type: AccountType.Liability, parent: '2000', isParent: false },
    { id: '2050', name: { ar: 'عمولة المنشئ المستحقة', fa: 'کمیسیون ایجادکننده پرداختنی', en: 'Creator Commission Payable' }, type: AccountType.Liability, parent: '2000', isParent: false },

    // 3000: حقوق الملكية (Equity)
    { id: '3000', name: { ar: 'حقوق الملكية', fa: 'حقوق صاحبان سهام', en: 'Equity' }, type: AccountType.Equity, parent: null, isParent: true },
    { id: '3010', name: { ar: 'رأس المال', fa: 'سرمایه', en: 'Capital Stock' }, type: AccountType.Equity, parent: '3000', isParent: false },
    { id: '3020', name: { ar: 'أرباح محتجزة', fa: 'سود انباشته', en: 'Retained Earnings' }, type: AccountType.Equity, parent: '3000', isParent: false },
    
    // 4000: الإيرادات (Revenue)
    { id: '4000', name: { ar: 'الإيرادات', fa: 'درآمدها', en: 'Revenue' }, type: AccountType.Revenue, parent: null, isParent: true },
    { id: '4010', name: { ar: 'إيرادات المبيعات', fa: 'درآمدهای فروش', en: 'Sales Revenue' }, type: AccountType.Revenue, parent: '4000', isParent: true },
    { id: '4011', name: { ar: 'صافي إيرادات التذاكر', fa: 'درآمد خالص بلیط', en: 'Net Ticket Revenue' }, type: AccountType.Revenue, parent: '4010', isParent: false },
    { id: '4012', name: { ar: 'إيرادات عمولة الخدمة الإلكترونية', fa: 'درآمد کمیسیون وب‌سرویس', en: 'Web Service Commission Revenue' }, type: AccountType.Revenue, parent: '4010', isParent: false },
    { id: '4020', name: { ar: 'إيرادات رسوم الخدمة', fa: 'درآمد کارمزد خدمات', en: 'Service Fee Revenue' }, type: AccountType.Revenue, parent: '4000', isParent: false },
    { id: '4030', name: { ar: 'إيرادات غرامات الإلغاء', fa: 'درآمد جریمه کنسلی', en: 'Cancellation Fee Revenue' }, type: AccountType.Revenue, parent: '4000', isParent: false },

    // 5000: المصروفات (Expenses)
    { id: '5000', name: { ar: 'المصروفات', fa: 'هزینه‌ها', en: 'Expenses' }, type: AccountType.Expense, parent: null, isParent: true },
    { id: '5010', name: { ar: 'مصروفات تشغيلية', fa: 'هزینه‌های عملیاتی', en: 'Operating Expenses' }, type: AccountType.Expense, parent: '5000', isParent: true },
    { id: '5011', name: { ar: 'مصروف الرواتب والأجور', fa: 'هزینه حقوق و دستمزد', en: 'Salaries and Wages Expense' }, type: AccountType.Expense, parent: '5010', isParent: false },
    { id: '5012', name: { ar: 'مصروف الإيجار', fa: 'هزینه اجاره', en: 'Rent Expense' }, type: AccountType.Expense, parent: '5010', isParent: false },
    { id: '5013', name: { ar: 'مصروفات المرافق (كهرباء، ماء، هاتف)', fa: 'هزینه آب و برق و تلفن', en: 'Utilities Expense' }, type: AccountType.Expense, parent: '5010', isParent: false },
    
    { id: '5020', name: { ar: 'مصروفات البيع والتسويق', fa: 'هزینه‌های فروش و بازاریابی', en: 'Selling & Marketing Expenses' }, type: AccountType.Expense, parent: '5000', isParent: true },
    { id: '5021', name: { ar: 'مصروف الإعلانات', fa: 'هزینه تبلیغات', en: 'Advertising Expense' }, type: AccountType.Expense, parent: '5020', isParent: false },
    { id: '5022', name: { ar: 'مصروف العمولة', fa: 'هزینه کمیسیون', en: 'Commission Expense' }, type: AccountType.Expense, parent: '5020', isParent: false },

    { id: '5030', name: { ar: 'مصروفات عمومية وإدارية', fa: 'هزینه‌های عمومی و اداری', en: 'General & Administrative Expenses' }, type: AccountType.Expense, parent: '5000', isParent: true },
    { id: '5031', name: { ar: 'مصروف المستلزمات المكتبية', fa: 'هزینه ملزومات اداری', en: 'Office Supplies Expense' }, type: AccountType.Expense, parent: '5030', isParent: false },
    { id: '5032', name: { ar: 'مصروف الرسوم البنكية', fa: 'هزینه کارمزد بانکی', en: 'Bank Fees Expense' }, type: AccountType.Expense, parent: '5030', isParent: false },
    { id: '5040', name: { ar: 'تكلفة شراء التذاكر', fa: 'هزینه خرید بلیط', en: 'Ticket Purchase Cost' }, type: AccountType.Expense, parent: '5000', isParent: false },
];