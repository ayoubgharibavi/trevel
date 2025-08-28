
import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

export const LoadingSpinner: React.FC = () => {
  const { t } = useLocalization();
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-600">{t('flightSearch.searching')}</p>
    </div>
  );
};
