import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { apiService } from '../services/apiService';
import { CurrencyDisplay } from './CurrencyDisplay';
import { ArrowRightLeftIcon } from './icons/ArrowRightLeftIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { CurrencyInfo, Language } from '../types';

interface CurrencyConverterProps {
  currencies?: CurrencyInfo[];
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ currencies: propCurrencies }) => {
  const { t, language } = useLocalization();
  const [currencies, setCurrencies] = useState<CurrencyInfo[]>([]);
  const [fromCurrency, setFromCurrency] = useState<string>('');
  const [toCurrency, setToCurrency] = useState<string>('');
  const [amount, setAmount] = useState<number>(1);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [rate, setRate] = useState<number | null>(null);

  // Helper function to parse localized name or symbol
  const parseLocalizedName = (name: any, lang: Language): string => {
    if (typeof name === 'string') {
      try {
        const parsed = JSON.parse(name);
        return parsed[lang] || parsed['fa'] || parsed['en'] || name;
      } catch {
        return name;
      }
    }
    if (typeof name === 'object' && name !== null) {
      const value = name[lang] || name['fa'] || name['en'];
      return typeof value === 'string' ? value : '';
    }
    return '';
  };

  useEffect(() => {
    if (propCurrencies && propCurrencies.length > 0) {
      setCurrencies(propCurrencies);
      // Set default currencies if available
      if (propCurrencies.length >= 2) {
        setFromCurrency(propCurrencies[0].id);
        setToCurrency(propCurrencies[1].id);
      }
    } else {
      fetchCurrencies();
    }
  }, [propCurrencies]);

  useEffect(() => {
    if (fromCurrency && toCurrency && amount > 0) {
      convertCurrency();
    } else {
      setConvertedAmount(null);
      setRate(null);
    }
  }, [fromCurrency, toCurrency, amount]);

  const fetchCurrencies = async () => {
    try {
      const response = await apiService.get('/exchange-rates/currencies');
      const currenciesData = response.data || [];
      setCurrencies(currenciesData);
      
      // Set default currencies if available
      if (currenciesData.length >= 2) {
        setFromCurrency(currenciesData[0].id);
        setToCurrency(currenciesData[1].id);
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
      setCurrencies([]); // Set empty array on error
    }
  };

  const convertCurrency = async () => {
    if (!fromCurrency || !toCurrency || amount <= 0) return;

    try {
      setLoading(true);
      const response = await apiService.get('/exchange-rates/convert', {
        params: {
          amount: amount.toString(),
          from: fromCurrency,
          to: toCurrency,
        },
      });
      
      setConvertedAmount(response.data.convertedAmount);
      
      // Calculate rate
      const calculatedRate = response.data.convertedAmount / amount;
      setRate(calculatedRate);
    } catch (error) {
      console.error('Error converting currency:', error);
      setConvertedAmount(null);
      setRate(null);
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getCurrencyByCode = (code: string) => {
    return currencies.find(currency => currency.code === code);
  };

  const getCurrencyById = (id: string) => {
    return currencies.find(currency => currency.id === id);
  };

  const handlePopularConversion = (fromCode: string, toCode: string) => {
    const fromCurrencyObj = getCurrencyByCode(fromCode);
    const toCurrencyObj = getCurrencyByCode(toCode);
    
    if (fromCurrencyObj && toCurrencyObj) {
      setFromCurrency(fromCurrencyObj.id);
      setToCurrency(toCurrencyObj.id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">تبدیل ارز</h2>
        <p className="text-gray-600">نرخ تبدیل ارزهای مختلف</p>
      </div>

      <div className="space-y-6">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مقدار
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
            placeholder="مقدار را وارد کنید"
            min="0"
            step="0.01"
          />
        </div>

        {/* Currency Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* From Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              از
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">انتخاب ارز</option>
              {currencies && currencies.map((currency) => (
                <option key={currency.id} value={currency.id}>
                  {currency.code} - {parseLocalizedName(currency.name, language)}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapCurrencies}
              className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              title="جابجایی ارزها"
            >
              <ArrowRightLeftIcon className="w-5 h-5" />
            </button>
          </div>

          {/* To Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              به
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">انتخاب ارز</option>
              {currencies && currencies.map((currency) => (
                <option key={currency.id} value={currency.id}>
                  {currency.code} - {parseLocalizedName(currency.name, language)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conversion Result */}
        {convertedAmount !== null && rate !== null && (
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {convertedAmount.toFixed(2)}
              </div>
              <div className="text-gray-600 mb-4">
                {getCurrencyById(toCurrency)?.code} - {parseLocalizedName(getCurrencyById(toCurrency)?.name, language)}
              </div>
              
              {/* Rate Display */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">نرخ تبدیل</div>
                <div className="text-lg font-semibold text-gray-900">
                  1 {getCurrencyById(fromCurrency)?.code} = {rate.toFixed(4)} {getCurrencyById(toCurrency)?.code}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-gray-600">در حال تبدیل...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && fromCurrency && toCurrency && amount > 0 && convertedAmount === null && (
          <div className="text-center py-8">
            <p className="text-red-600">خطا در تبدیل ارز. لطفاً دوباره تلاش کنید.</p>
          </div>
        )}

        {/* Popular Conversions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">تبدیل‌های محبوب</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { from: 'USD', to: 'EUR' },
              { from: 'USD', to: 'GBP' },
              { from: 'EUR', to: 'USD' },
              { from: 'GBP', to: 'USD' },
              { from: 'USD', to: 'JPY' },
              { from: 'USD', to: 'CAD' },
            ].map((pair) => {
              const fromCurrencyObj = getCurrencyByCode(pair.from);
              const toCurrencyObj = getCurrencyByCode(pair.to);
              
              if (!fromCurrencyObj || !toCurrencyObj) return null;
              
              return (
                <button
                  key={`${pair.from}-${pair.to}`}
                  onClick={() => handlePopularConversion(pair.from, pair.to)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-right"
                >
                  <div className="font-medium text-gray-900">
                    {pair.from} → {pair.to}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {parseLocalizedName(fromCurrencyObj.name, language)} به {parseLocalizedName(toCurrencyObj.name, language)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Currency Information */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات ارزها</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currencies.slice(0, 6).map((currency) => (
              <div key={currency.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{currency.code}</span>
                  <span className="text-sm text-gray-500">{parseLocalizedName(currency.symbol, language)}</span>
                </div>
                <div className="text-sm text-gray-600">{parseLocalizedName(currency.name, language)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  نرخ به دلار: {currency.exchangeRateToUSD.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

