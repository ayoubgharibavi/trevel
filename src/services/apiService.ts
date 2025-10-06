
import { API_BASE_URL } from '@/config';
import { ApiResponse, User, LoginPayload, SignupPayload, UpdateProfilePayload, AddSavedPassengerPayload, UpdateSavedPassengerPayload, UpdateUserPayload, TelegramBotConfig, WhatsAppBotConfig, RolePermissions, Advertisement, SiteContent, Booking, Ticket, Expense, Account, CommissionModel, CurrencyInfo, RefundPolicy, CountryInfo, RateLimit, ActivityLog, CreateExpensePayload, UpdateTenantPayload, CreateTenantPayload, ChargeWalletPayload, Refund, AdminStats, SavedPassenger, Flight, Tenant, BasicDataType, Wallet } from '@/types';

interface RequestOptions extends RequestInit {
  body?: string;
}

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.initTokens();
    this.initTokenRefresh();
    this.validateStoredTokens();
  }

  initTokens() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    console.log('🔑 ApiService initialized with tokens:', {
      hasAccessToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken,
      accessTokenPreview: this.accessToken ? this.accessToken.substring(0, 50) + '...' : null
    });
  }

  private isPublicEndpoint(endpoint: string): boolean {
    const publicEndpoints = [
      '/api/v1/auth/login',
      '/api/v1/auth/signup',
      '/api/v1/auth/refresh',
      '/api/v1/content/home',
      '/api/v1/content/about',
      '/api/v1/content/contact',
      '/api/v1/content/footer',
      '/api/v1/content/popular-destinations',
      '/api/v1/content/advertisements',
      '/api/v1/flights/search',
      '/api/v1/flights/popular-routes',
      '/api/v1/flights/airports/search',
      '/api/v1/flights/ai-search',
      '/api/v1/exchange-rates',
      '/api/v1/exchange-rates/currencies',
      '/api/v1/exchange-rates/convert',
      // Flight search APIs that are public
      '/api/v1/sepehr/search',
      '/api/v1/charter118/search',
      '/api/v1/flights/save-charter118',
      // Admin basic data endpoints that are public
      '/api/v1/admin/basic-data'
    ];
    
    return publicEndpoints.some(publicEndpoint => endpoint.startsWith(publicEndpoint));
  }

  private validateStoredTokens() {
    // Clear tokens if they seem invalid or too old
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const now = Date.now() / 1000;
        // If token expires in less than 1 hour, clear it
        if (payload.exp && payload.exp - now < 3600) {
          console.log('🔄 Clearing expired tokens');
          this.clearTokens();
        }
      } catch (error) {
        console.log('🔄 Clearing invalid tokens');
        this.clearTokens();
      }
    }
  }

  private initTokenRefresh() {
    // Implement periodic token refresh if needed, or rely on 401 intercept
  }

  private setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    console.log('🔑 Tokens updated successfully');
  }

  private clearTokens() {
    console.log('🗑️ Clearing tokens');
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data: ApiResponse<{ accessToken: string }> = await response.json();

      if (response.ok && data.success && data.data?.accessToken) {
        this.setTokens(data.data.accessToken, this.refreshToken!);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    this.clearTokens();
    return false;
  }

  // Public method for external token refresh
  async refreshTokenPublic(): Promise<boolean> {
    return this.refreshAccessToken();
  }

  private async request<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };

    // Check if this is a public endpoint that doesn't need authentication
    const isPublicEndpoint = this.isPublicEndpoint(endpoint);
    
    if (this.accessToken && !isPublicEndpoint) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
      console.log('🔑 Using access token for protected request:', endpoint);
    } else if (isPublicEndpoint) {
      console.log('🌐 Public endpoint, no auth required:', endpoint);
    } else {
      console.log('⚠️ No access token available for protected request:', endpoint);
      // For protected endpoints without token, return unauthorized error immediately
      if (!isPublicEndpoint) {
        return { success: false, error: 'Unauthorized', data: null };
      }
    }

    try {
      // SENIOR FIX: Add timeout and retry mechanism
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      let response = await fetch(url, { 
        ...options, 
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      // Handle 401 responses professionally
      if (response.status === 401) {
        // For public endpoints, 401 shouldn't happen - log and continue
        if (isPublicEndpoint) {
          console.warn('🚨 Unexpected 401 for public endpoint:', endpoint);
          // Continue processing the response normally
        } else if (endpoint !== '/api/v1/auth/refresh' && this.refreshToken) {
          // Try to refresh token for protected endpoints
          const refreshed = await this.refreshAccessToken();
          if (refreshed && this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
            response = await fetch(url, { ...options, headers });
          } else {
            this.clearTokens();
            // Force reload to clear stale data and redirect to login
            if (typeof window !== 'undefined') {
              console.log('🔄 Token refresh failed, forcing page reload');
              setTimeout(() => window.location.reload(), 100);
            }
            return { success: false, error: 'Unauthorized', data: null };
          }
        } else {
          // No refresh token available, clear tokens and return error
          this.clearTokens();
          return { success: false, error: 'Unauthorized', data: null };
        }
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        throw new Error('خطا در پردازش پاسخ سرور');
      }

      // Accept both 200 and 201 as successful responses
      if (response.status !== 200 && response.status !== 201) {
        // If the response is not ok, and data has a message, use that message
        // Otherwise, fallback to a generic error message
        throw new Error(data?.message || data?.error || 'خطا در برقراری ارتباط');
      }
      
      // Log successful responses for debugging
      console.log(`✅ API Response ${response.status}:`, endpoint, data);
      
      // Special logging for Charter118
      if (endpoint.includes('charter118')) {
        console.log('🔍 CHARTER118 API Response Details:');
        console.log('🔍 - Endpoint:', endpoint);
        console.log('🔍 - Status:', response.status);
        console.log('🔍 - Data:', data);
        console.log('🔍 - Success:', data?.success);
        console.log('🔍 - Data Array:', Array.isArray(data?.data));
        console.log('🔍 - Data Length:', data?.data?.length);
      }

      // For login/signup responses, store tokens if they are at the top level
      if (endpoint === '/api/v1/auth/login' || endpoint === '/api/v1/auth/signup') {
        if (data.accessToken && data.refreshToken) {
          this.setTokens(data.accessToken, data.refreshToken);
        }
      }

      // For search endpoints, return the data directly as it's already an array
      if (endpoint.includes('/flights/search')) {
        console.log('🔍 Search endpoint response data:', data);
        console.log('🔍 Search endpoint response data type:', typeof data);
        console.log('🔍 Search endpoint response data is array:', Array.isArray(data));
        console.log('🔍 Search endpoint response data length:', data?.length);
        console.log('🔍 Search endpoint response ok:', response.ok);
        console.log('🔍 Search endpoint response status:', response.status);
        return { data: data || [], success: true };
      }

      return { data, success: true };
    } catch (error) {
      console.error('API Error:', error);
      
      // SENIOR FIX: Better error handling for network issues
      let errorMessage = 'خطا در برقراری ارتباط';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout - server is not responding';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error - please check your connection and try again';
        } else if (error.message.includes('ERR_NETWORK_CHANGED')) {
          errorMessage = 'Network connection lost - please refresh the page';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { 
        success: false, 
        error: errorMessage,
        data: null // Ensure data is null on error
      };
    }
  }

  async login(identifier: string, password: string): Promise<ApiResponse<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }>> {
    console.log('Admin login attempt with:', identifier);
    const response = await this.request<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ 
        username: identifier.includes('@') ? undefined : identifier,
        email: identifier.includes('@') ? identifier : undefined,
        password 
      }),
    });

    console.log('Admin login response:', response);

    // Store tokens if login was successful
    if (response.success && response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  async signup(userData: SignupPayload): Promise<ApiResponse<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }>> {
    const response = await this.request<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store tokens if signup was successful
    if (response.success && response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  async logout(): Promise<ApiResponse<any>> {
    const response = await this.request('/api/v1/auth/logout', {
        method: 'POST'
    });
    this.clearTokens();
    return response;
  }

  // Force clear tokens and reload page (for debugging)
  forceLogout(): void {
    console.log('🔄 Force logout initiated');
    this.clearTokens();
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.reload();
    }
  }

  // Reload tokens from localStorage (for debugging)
  reloadTokens(): void {
    console.log('🔄 Reloading tokens from localStorage');
    this.initTokens();
  }

  async createBooking(bookingData: any): Promise<ApiResponse<{
    booking: Booking;
  }>> {
    return this.request<{
      booking: Booking;
    }>('/api/v1/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async cancelBooking(bookingId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  }

  async downloadETicketPDF(bookingId: string) {
    const token = this.accessToken;
    const link = document.createElement('a');
    link.href = `${API_BASE_URL}/api/v1/bookings/${bookingId}/e-ticket/pdf`;
    link.download = `e-ticket-${bookingId}.pdf`;
    link.style.display = 'none';

    try {
      const response = await fetch(link.href, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'خطا در دانلود PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download error:', error);
      // A more robust error notification system should be integrated here
      alert(error instanceof Error ? error.message : 'خطا در دانلود PDF');
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/api/v1/users/me');
  }

  async updateProfile(updates: UpdateProfilePayload): Promise<ApiResponse<{
    user: User;
  }>> {
    return this.request<{
      user: User;
    }>('/api/v1/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async createTicket(ticketData: any): Promise<ApiResponse<{
    ticket: Ticket;
  }>> {
    return this.request<{
      ticket: Ticket;
    }>('/api/v1/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async addMessageToTicket(ticketId: string, messageText: string): Promise<ApiResponse<{
    ticketStatus: Ticket['status'];
    ticket: Ticket;
  }>> {
    return this.request<{
      ticketStatus: Ticket['status'];
      ticket: Ticket;
    }>(`/api/v1/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message: messageText }),
    });
  }

  async getSavedPassengers(): Promise<ApiResponse<SavedPassenger[]>> {
    console.log('🔍 getSavedPassengers - Current access token:', this.accessToken);
    console.log('🔍 getSavedPassengers - localStorage access token:', localStorage.getItem('accessToken'));
    
    // Force refresh tokens before making the request
    this.refreshTokens();
    console.log('🔍 getSavedPassengers - After refresh, access token:', this.accessToken);
    
    return this.request<SavedPassenger[]>('/api/v1/users/me/saved-passengers');
  }

  async addSavedPassenger(passengerData: AddSavedPassengerPayload): Promise<ApiResponse<{
    passenger: SavedPassenger;
  }>> {
    console.log('🔍 addSavedPassenger - Current access token:', this.accessToken);
    console.log('🔍 addSavedPassenger - localStorage access token:', localStorage.getItem('accessToken'));
    
    // Force refresh tokens before making the request
    this.refreshTokens();
    console.log('🔍 addSavedPassenger - After refresh, access token:', this.accessToken);
    
    return this.request<{
      passenger: SavedPassenger;
    }>('/api/v1/users/me/saved-passengers', {
      method: 'POST',
      body: JSON.stringify(passengerData),
    });
  }

  async updateSavedPassenger(passengerId: string, passengerData: UpdateSavedPassengerPayload): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/users/me/saved-passengers/${passengerId}`, {
      method: 'PUT',
      body: JSON.stringify(passengerData),
    });
  }

  async generateTicketPDF(bookingId: string): Promise<ApiResponse<Blob>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${bookingId}/e-ticket/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    const blob = await response.blob();
    return {
      success: true,
      data: blob,
    };
  }

  async getUserBookings(): Promise<ApiResponse<any[]>> {
    return this.request('/api/v1/bookings', { method: 'GET' });
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  refreshTokens(): boolean {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    
    console.log('🔄 refreshTokens called');
    console.log('🔄 Current tokens:', { access: this.accessToken, refresh: this.refreshToken });
    console.log('🔄 Stored tokens:', { access: storedAccessToken, refresh: storedRefreshToken });
    
    if (storedAccessToken !== this.accessToken || storedRefreshToken !== this.refreshToken) {
      console.log('🔄 Refreshing apiService tokens from localStorage');
      this.accessToken = storedAccessToken;
      this.refreshToken = storedRefreshToken;
      console.log('🔄 New tokens:', { access: this.accessToken, refresh: this.refreshToken });
    } else {
      console.log('🔄 Tokens already up to date');
    }
    
    return !!(this.accessToken && this.refreshToken);
  }

  async deleteSavedPassenger(passengerId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/users/me/saved-passengers/${passengerId}`, {
      method: 'DELETE',
    });
  }

  async searchFlights(query: any): Promise<ApiResponse<Flight[]>> {
    try {
      const params = new URLSearchParams(query).toString();
      console.log('🔍 Search URL:', `/api/v1/flights/search?${params}`);
      console.log('🔍 Search query params:', query);
      const response = await this.request<Flight[]>(`/api/v1/flights/search?${params}`);
      console.log('🔍 Search API response:', response);
      console.log('🔍 Search API response success:', response.success);
      console.log('🔍 Search API response data:', response.data);
      console.log('🔍 Search API response data length:', response.data?.length);
      return response;
    } catch (error) {
      console.error('🔍 Search API error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', data: null };
    }
  }

  // Admin Endpoints
  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    return this.request<AdminStats>('/api/v1/admin/stats');
  }

  async getAdminUsers(page = 1, limit = 10): Promise<ApiResponse<{ users: User[]; total: number; }>> {
    return this.request<{ users: User[]; total: number; }>(`/api/v1/admin/users?page=${page}&limit=${limit}`);
  }

  async updateUser(userId: string, data: UpdateUserPayload): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async createUser(userData: Omit<User, 'id' | 'wallet' | 'createdAt' | 'canBypassRateLimit'>): Promise<ApiResponse<{
    user: User;
  }>> {
    return this.request<{
      user: User;
    }>('/api/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async chargeUserWallet(userId: string, data: ChargeWalletPayload): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/users/${userId}/charge-wallet`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserWallet(): Promise<ApiResponse<Wallet>> {
    return this.request<Wallet>('/api/v1/users/me/wallet');
  }

  async resetUserPassword(userId: string, newPassword: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  async getAdminBookings(page = 1, status?: string): Promise<ApiResponse<{ bookings: Booking[]; total: number; }>> {
    const params = new URLSearchParams({ page: page.toString() });
    if (status) params.append('status', status);
    return this.request<{ bookings: Booking[]; total: number; }>(`/api/v1/admin/bookings?${params}`);
  }

  async updateBooking(bookingId: string, bookingData: Booking): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  }

  async getAdminFlights(): Promise<ApiResponse<Flight[]>> {
    console.log('🔍 getAdminFlights called');
    const result = await this.request<Flight[]>('/api/v1/admin/flights');
    console.log('🔍 getAdminFlights result:', result);
    return result;
  }

  async getBasicData<T>(type: BasicDataType): Promise<ApiResponse<T[]>> {
    return this.request<T[]>(`/api/v1/admin/basic-data/${type}`);
  }

  async createFlight(flightData: Omit<Flight, 'id' | 'creatorId'>): Promise<ApiResponse<Flight>> {
    return this.request<Flight>('/api/v1/admin/flights', {
      method: 'POST',
      body: JSON.stringify(flightData),
    });
  }

  async updateFlight(flightId: string, flightData: Flight): Promise<ApiResponse<Flight>> {
    return this.request<Flight>(`/api/v1/admin/flights/${flightId}`, {
      method: 'PUT',
      body: JSON.stringify(flightData),
    });
  }

  async deleteFlight(flightId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/flights/${flightId}`, {
      method: 'DELETE',
    });
  }

  async toggleFlightStatus(flightId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/flights/${flightId}/toggle-status`, {
      method: 'PUT',
    });
  }

  async updateTelegramConfig(config: TelegramBotConfig): Promise<ApiResponse<any>> {
    return this.request('/api/v1/admin/integrations/telegram', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async updateWhatsAppConfig(config: WhatsAppBotConfig): Promise<ApiResponse<any>> {
    return this.request('/api/v1/admin/integrations/whatsapp', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async updateTicketStatus(ticketId: string, status: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async adminReplyToTicket(ticketId: string, message: string, sendChannels: any): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/tickets/${ticketId}/admin-reply`, {
      method: 'POST',
      body: JSON.stringify({ message, sendChannels }),
    });
  }

  async createBasicData(type: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/basic-data/${type}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBasicData(type: string, id: string, data: any): Promise<ApiResponse<any>> {
    // Remove the id from data to avoid conflicts with URL parameter
    const { id: dataId, ...dataWithoutId } = data;
    return this.request(`/api/v1/admin/basic-data/${type}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dataWithoutId),
    });
  }

  async deleteBasicData(type: string, id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/basic-data/${type}/${id}`, {
      method: 'DELETE',
    });
  }

  async createRateLimit(data: any): Promise<ApiResponse<any>> {
    return this.request('/api/v1/admin/rate-limits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRateLimit(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/rate-limits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRateLimit(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/rate-limits/${id}`, {
      method: 'DELETE',
    });
  }

  async createExpense(expenseData: CreateExpensePayload): Promise<ApiResponse<any>> {
    return this.request('/api/v1/admin/accounting/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  async createAccount(accountData: any): Promise<ApiResponse<any>> {
    return this.request('/api/v1/admin/accounting/chart-of-accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  }

  async updateAccount(accountId: string, accountData: any): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/accounting/chart-of-accounts/${accountId}`, {
      method: 'PUT',
      body: JSON.stringify(accountData),
    });
  }

  async getAdminContent(): Promise<ApiResponse<SiteContent>> {
    return this.request<SiteContent>('/api/v1/admin/content');
  }

  async updateAdminContent(content: SiteContent): Promise<ApiResponse<SiteContent>> {
    return this.request<SiteContent>('/api/v1/admin/content', {
      method: 'PUT',
      body: JSON.stringify(content),
    });
  }

  async getCurrencies(): Promise<ApiResponse<CurrencyInfo[]>> {
    return this.request<CurrencyInfo[]>('/api/v1/admin/basic-data/currency'); // Changed endpoint
  }

  async getRefundPolicies(): Promise<ApiResponse<RefundPolicy[]>> {
    return this.request<RefundPolicy[]>('/api/v1/admin/basic-data/refundPolicy'); // Changed endpoint
  }

  async getCountries(): Promise<ApiResponse<CountryInfo[]>> {
    return this.request<CountryInfo[]>('/api/v1/admin/basic-data/country'); // Changed endpoint
  }

  async getTelegramConfig(): Promise<ApiResponse<TelegramBotConfig>> {
    return this.request<TelegramBotConfig>('/api/v1/admin/integrations/telegram');
  }

  async getWhatsAppConfig(): Promise<ApiResponse<WhatsAppBotConfig>> {
    return this.request<WhatsAppBotConfig>('/api/v1/admin/integrations/whatsapp');
  }

  async getActivityLogs(): Promise<ApiResponse<ActivityLog[]>> {
    return this.request<ActivityLog[]>('/api/v1/admin/activity-logs');
  }

  async getRateLimits(): Promise<ApiResponse<RateLimit[]>> {
    return this.request<RateLimit[]>('/api/v1/admin/rate-limits');
  }

  async getRefunds(): Promise<ApiResponse<Refund[]>> {
    return this.request<Refund[]>('/api/v1/admin/refunds');
  }

  async getAllTickets(): Promise<ApiResponse<Ticket[]>> {
    return this.request<Ticket[]>('/api/v1/admin/tickets');
  }

  async getExpenses(): Promise<ApiResponse<Expense[]>> {
    return this.request<Expense[]>('/api/v1/admin/accounting/expenses');
  }

  async getCommissionModels(): Promise<ApiResponse<CommissionModel[]>> {
    return this.request<CommissionModel[]>('/api/v1/admin/commission-models');
  }

  async getTenants(): Promise<ApiResponse<Tenant[]>> {
    return this.request<Tenant[]>('/api/v1/admin/tenants');
  }

  async getPermissions(): Promise<ApiResponse<RolePermissions>> {
    return this.request<RolePermissions>('/api/v1/admin/permissions');
  }

  async getAdvertisements(): Promise<ApiResponse<Advertisement[]>> {
    return this.request<Advertisement[]>('/api/v1/admin/advertisements');
  }

  async getChartOfAccounts(): Promise<ApiResponse<Account[]>> {
    return this.request<Account[]>('/api/v1/admin/accounting/chart-of-accounts');
  }

  async getHomeContent(language: string): Promise<ApiResponse<SiteContent['home']>> {
    return this.request<SiteContent['home']>(`/api/v1/content/home?lang=${language}`);
  }

  async getAboutContent(language: string): Promise<ApiResponse<SiteContent['about']>> {
    return this.request<SiteContent['about']>(`/api/v1/content/about?lang=${language}`);
  }

  async getContactContent(language: string): Promise<ApiResponse<SiteContent['contact']>> {
    return this.request<SiteContent['contact']>(`/api/v1/content/contact?lang=${language}`);
  }

  async getPopularDestinations(language: string): Promise<ApiResponse<SiteContent['home']['popularDestinations']>> {
    return this.request<SiteContent['home']['popularDestinations']>(`/api/v1/content/popular-destinations?lang=${language}`);
  }

  async getPopularRoutes(): Promise<ApiResponse<{ from: string; to: string }[]>> {
    return this.request<{ from: string; to: string }[]>('/api/v1/flights/popular-routes');
  }

  async updateRefund(refundId: string, action: string, reason?: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/refunds/${refundId}`, {
      method: 'PUT',
      body: JSON.stringify({ action, reason }),
    });
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async updatePermissions(permissions: RolePermissions): Promise<ApiResponse<any>> {
    return this.request('/api/v1/admin/permissions', {
      method: 'PUT',
      body: JSON.stringify(permissions),
    });
  }

  async createAdvertisement(adData: Omit<Advertisement, 'id'>): Promise<ApiResponse<any>> {
    return this.request('/api/v1/admin/advertisements', {
      method: 'POST',
      body: JSON.stringify(adData),
    });
  }

  async updateAdvertisement(id: string, adData: Advertisement): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/advertisements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(adData),
    });
  }

  async deleteAdvertisement(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/advertisements/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();