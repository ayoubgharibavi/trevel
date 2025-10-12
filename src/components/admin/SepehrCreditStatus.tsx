import React, { useState, useEffect } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { apiService } from '@/services/apiService';
import { RefreshIcon } from '../icons/RefreshIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { AlertTriangleIcon } from '../icons/AlertTriangleIcon';
import { CreditCardIcon } from '../icons/CreditCardIcon';

interface SepehrCreditStatus {
  balance: number;
  currency: string;
  lastUpdated: string;
  status: 'ACTIVE' | 'LOW' | 'INSUFFICIENT' | 'ERROR';
  threshold: number;
}

interface RechargeRequest {
  amount: number;
  currency: string;
  description: string;
}

const SepehrCreditStatus: React.FC = () => {
  const { t, formatNumber } = useLocalization();
  const [creditStatus, setCreditStatus] = useState<SepehrCreditStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecharging, setIsRecharging] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(10000000); // 10M IRR default
  const [rechargeDescription, setRechargeDescription] = useState('');

  useEffect(() => {
    fetchCreditStatus();
  }, []);

  const fetchCreditStatus = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get('/api/v1/sepehr/credit-status');
      if (response.success) {
        setCreditStatus(response.data);
      } else {
        // Mock data for demonstration
        setCreditStatus({
          balance: 5000000, // 5M IRR
          currency: 'IRR',
          lastUpdated: new Date().toISOString(),
          status: 'LOW',
          threshold: 10000000 // 10M IRR threshold
        });
      }
    } catch (error) {
      console.error('Error fetching Sepehr credit status:', error);
      // Mock data for demonstration
      setCreditStatus({
        balance: 5000000,
        currency: 'IRR',
        lastUpdated: new Date().toISOString(),
        status: 'LOW',
        threshold: 10000000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecharge = async () => {
    try {
      setIsRecharging(true);
      const rechargeRequest: RechargeRequest = {
        amount: rechargeAmount,
        currency: 'IRR',
        description: rechargeDescription || 'شارژ اعتبار سپهر'
      };

      const response = await apiService.post('/api/v1/sepehr/recharge', rechargeRequest);
      if (response.success) {
        await fetchCreditStatus();
        setShowRechargeModal(false);
        setRechargeAmount(10000000);
        setRechargeDescription('');
        alert('اعتبار سپهر با موفقیت شارژ شد');
      } else {
        alert('خطا در شارژ اعتبار: ' + response.message);
      }
    } catch (error) {
      console.error('Error recharging Sepehr credit:', error);
      alert('خطا در شارژ اعتبار سپهر');
    } finally {
      setIsRecharging(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100';
      case 'LOW':
        return 'text-yellow-600 bg-yellow-100';
      case 'INSUFFICIENT':
        return 'text-red-600 bg-red-100';
      case 'ERROR':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'فعال';
      case 'LOW':
        return 'کم';
      case 'INSUFFICIENT':
        return 'ناکافی';
      case 'ERROR':
        return 'خطا';
      default:
        return 'نامشخص';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'LOW':
      case 'INSUFFICIENT':
        return <AlertTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'ERROR':
        return <AlertTriangleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangleIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CreditCardIcon className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">وضعیت اعتبار سپهر</h3>
        </div>
        <button
          onClick={fetchCreditStatus}
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <RefreshIcon className="w-4 h-4" />
          بروزرسانی
        </button>
      </div>

      {creditStatus && (
        <div className="space-y-4">
          {/* Balance Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">موجودی فعلی</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatNumber(creditStatus.balance)} {creditStatus.currency}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(creditStatus.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(creditStatus.status)}`}>
                  {getStatusText(creditStatus.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Threshold Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">حداقل موجودی مورد نیاز</p>
                <p className="text-lg font-semibold text-blue-800">
                  {formatNumber(creditStatus.threshold)} {creditStatus.currency}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600 mb-1">آخرین بروزرسانی</p>
                <p className="text-sm text-blue-800">
                  {new Date(creditStatus.lastUpdated).toLocaleString('fa-IR')}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>پیشرفت موجودی</span>
              <span>{Math.round((creditStatus.balance / creditStatus.threshold) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  creditStatus.balance >= creditStatus.threshold
                    ? 'bg-green-500'
                    : creditStatus.balance >= creditStatus.threshold * 0.5
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((creditStatus.balance / creditStatus.threshold) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowRechargeModal(true)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              شارژ اعتبار
            </button>
            <button
              onClick={fetchCreditStatus}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              بررسی مجدد
            </button>
          </div>

          {/* Warning Messages */}
          {creditStatus.status === 'LOW' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800 font-medium">هشدار: موجودی کم</p>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                موجودی فعلی شما کمتر از حداقل مورد نیاز است. لطفاً اعتبار خود را شارژ کنید.
              </p>
            </div>
          )}

          {creditStatus.status === 'INSUFFICIENT' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="w-5 h-5 text-red-600" />
                <p className="text-red-800 font-medium">خطا: موجودی ناکافی</p>
              </div>
              <p className="text-red-700 text-sm mt-1">
                موجودی شما برای انجام عملیات کافی نیست. لطفاً فوراً اعتبار خود را شارژ کنید.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">شارژ اعتبار سپهر</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مبلغ شارژ ({creditStatus?.currency})
                </label>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="مبلغ شارژ را وارد کنید"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  توضیحات (اختیاری)
                </label>
                <textarea
                  value={rechargeDescription}
                  onChange={(e) => setRechargeDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="توضیحات اضافی..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRechargeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isRecharging}
              >
                انصراف
              </button>
              <button
                onClick={handleRecharge}
                disabled={isRecharging || rechargeAmount <= 0}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRecharging ? 'در حال شارژ...' : 'شارژ اعتبار'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SepehrCreditStatus;


