import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { apiService } from '@/services/apiService';
import { SearchIcon } from './icons/SearchIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { PlaneIcon } from './icons/PlaneIcon';

interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  isActive: boolean;
}

interface AirportSearchBoxProps {
  placeholder?: string;
  value?: string;
  onChange?: (airport: Airport | null) => void;
  onSelect?: (airport: Airport) => void;
  className?: string;
  disabled?: boolean;
  showIcon?: boolean;
  iconType?: 'search' | 'location' | 'plane';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'filled';
}

const AirportSearchBox: React.FC<AirportSearchBoxProps> = ({
  placeholder = 'جستجوی فرودگاه...',
  value = '',
  onChange,
  onSelect,
  className = '',
  disabled = false,
  showIcon = true,
  iconType = 'search',
  size = 'md',
  variant = 'default'
}) => {
  const { t } = useLocalization();
  const [searchTerm, setSearchTerm] = useState(value ?? '');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value ?? '');
  }, [value]);

  const fetchAirports = useCallback(async (searchTerm: string = '') => {
    try {
      setIsLoading(true);
      const response = await apiService.get(`/api/v1/flights/airports/search?q=${encodeURIComponent(searchTerm)}`);
      setAirports(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching airports:', error);
      // Mock data for demonstration
      setAirports([
        {
          id: '1',
          code: 'IKA',
          name: 'فرودگاه بین‌المللی امام خمینی',
          city: 'تهران',
          country: 'ایران',
          isActive: true,
        },
        {
          id: '2',
          code: 'MHD',
          name: 'فرودگاه بین‌المللی مشهد',
          city: 'مشهد',
          country: 'ایران',
          isActive: true,
        },
        {
          id: '3',
          code: 'IFN',
          name: 'فرودگاه بین‌المللی اصفهان',
          city: 'اصفهان',
          country: 'ایران',
          isActive: true,
        },
        {
          id: '4',
          code: 'SYZ',
          name: 'فرودگاه بین‌المللی شیراز',
          city: 'شیراز',
          country: 'ایران',
          isActive: true,
        },
        {
          id: '5',
          code: 'THR',
          name: 'فرودگاه مهرآباد',
          city: 'تهران',
          country: 'ایران',
          isActive: true,
        },
        {
          id: '6',
          code: 'IST',
          name: 'فرودگاه بین‌المللی استانبول',
          city: 'استانبول',
          country: 'ترکیه',
          isActive: true,
        },
        {
          id: '7',
          code: 'DXB',
          name: 'فرودگاه بین‌المللی دبی',
          city: 'دبی',
          country: 'امارات',
          isActive: true,
        },
        {
          id: '8',
          code: 'AWZ',
          name: 'فرودگاه بین‌المللی اهواز',
          city: 'اهواز',
          country: 'ایران',
          isActive: true,
        },
        {
          id: '9',
          code: 'TBZ',
          name: 'فرودگاه بین‌المللی تبریز',
          city: 'تبریز',
          country: 'ایران',
          isActive: true,
        },
        {
          id: '10',
          code: 'KER',
          name: 'فرودگاه بین‌المللی کرمان',
          city: 'کرمان',
          country: 'ایران',
          isActive: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch airports when search term changes
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchAirports(searchTerm);
      }, 300); // Debounce search
      
      return () => clearTimeout(timeoutId);
    } else if (searchTerm.length === 0) {
      setAirports([]);
      setFilteredAirports([]);
    }
  }, [searchTerm, fetchAirports]);

  const filterAirports = useCallback(() => {
    if (!airports || !Array.isArray(airports)) {
      setFilteredAirports([]);
      setIsOpen(false);
      return;
    }
    
    const filtered = airports.filter(airport =>
      airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAirports(filtered);
    setIsOpen(filtered.length > 0);
    setFocusedIndex(-1);
  }, [airports, searchTerm]);

  useEffect(() => {
    fetchAirports();
  }, [fetchAirports]);

  useEffect(() => {
    if (searchTerm && searchTerm.length >= 2) {
      filterAirports();
    } else {
      setFilteredAirports([]);
      setIsOpen(false);
    }
  }, [searchTerm, filterAirports]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ?? '';
    setSearchTerm(value);
    onChange?.(null);
    setSelectedAirport(null);
  };

  const handleAirportSelect = (airport: Airport) => {
    setSelectedAirport(airport);
    setSearchTerm(`${airport.name} (${airport.code})`);
    setIsOpen(false);
    setFocusedIndex(-1);
    onChange?.(airport);
    onSelect?.(airport);
  };

  const handleInputFocus = () => {
    if (filteredAirports.length > 0) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredAirports.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredAirports.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredAirports.length) {
          handleAirportSelect(filteredAirports[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const getIcon = () => {
    switch (iconType) {
      case 'location':
        return <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'plane':
        return <PlaneIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getIconColor = () => {
    switch (iconType) {
      case 'location':
        return 'text-green-600';
      case 'plane':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-4 py-4 text-lg';
      default:
        return 'px-4 py-3 text-base';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border-2 border-gray-300 bg-transparent';
      case 'filled':
        return 'border border-gray-300 bg-gray-50';
      default:
        return 'border border-gray-300 bg-white';
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm ?? ''}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pr-4 pl-10 border rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            text-right placeholder-gray-500 transition-all duration-200
            ${getSizeClasses()}
            ${getVariantClasses()}
            ${isOpen ? 'rounded-b-none border-b-0' : ''}
            ${disabled ? 'opacity-50' : 'hover:border-gray-400'}
          `}
        />
        
        {/* Icon */}
        {showIcon && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getIconColor()}`}>
            {getIcon()}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Clear Button */}
        {searchTerm && !disabled && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedAirport(null);
              onChange?.(null);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredAirports.length > 0 ? (
            <div className="py-2">
              {filteredAirports.map((airport, index) => (
                <button
                  key={airport.id}
                  onClick={() => handleAirportSelect(airport)}
                  className={`
                    w-full px-4 py-3 text-right hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors
                    ${index === focusedIndex ? 'bg-blue-50 border-r-4 border-blue-500' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">{airport.name}</div>
                      <div className="text-sm text-gray-600 truncate">{airport.city}, {airport.country}</div>
                    </div>
                    <div className="text-left ml-3 flex-shrink-0">
                      <div className="font-bold text-blue-600 text-lg">{airport.code}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-center text-gray-500">
              {searchTerm.length < 2 ? 'حداقل ۲ کاراکتر وارد کنید' : 'فرودگاهی یافت نشد'}
            </div>
          )}
        </div>
      )}

      {/* Selected Airport Info */}
      {selectedAirport && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-right min-w-0 flex-1">
              <div className="font-medium text-blue-900 truncate">{selectedAirport.name}</div>
              <div className="text-sm text-blue-700 truncate">{selectedAirport.city}, {selectedAirport.country}</div>
            </div>
            <div className="text-left ml-3 flex-shrink-0">
              <div className="font-bold text-blue-600 text-lg">{selectedAirport.code}</div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Optimization */}
      <style>{`
        @media (max-width: 640px) {
          .dropdown-mobile {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90vw;
            max-width: 400px;
            max-height: 70vh;
            z-index: 9999;
          }
        }
      `}</style>
    </div>
  );
};

export default AirportSearchBox;


