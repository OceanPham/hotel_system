import {
  Component,
  signal,
  OnInit,
  inject,
  PLATFORM_ID,
  afterNextRender,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL } from '../../constants';

interface BookingData {
  room: {
    id: number;
    roomName: string;
    roomImage: string;
    priceRange: string;
    rating: number;

    bedCount: number;
    capacity: number;
    pricePerNight: number;
  };
  checkInDate: string;
  checkOutDate: string;
  checkInTime: string;
  checkOutTime: string;
  guestCount: string;
  specialRequests: string;
  selectedServices: ServiceItem[];
  nights: number;
  roomTotalPrice: number;
  servicesTotalPrice: number;
  taxes: number;
  serviceFee: number;
  totalPrice: number;
}

interface ServiceItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  type: 'credit' | 'ewallet' | 'bank' | 'cash';
}

// Interface mới cho Booking API
interface BookingRequest {
  userId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  specialRequests?: string;
  selectedServices: ServiceItem[];
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  paymentMethod: string;
  roomPrice: number;
  servicesPrice: number;
  taxes: number;
  serviceFee: number;
  totalPrice: number;
  nights: number;
}

interface BookingResponse {
  status: string;
  message: string;
  data: {
    bookingId: number;
    userId: number;
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
    guestCount: number;
    totalPrice: number;
    status: string;
    createdAt: string;
  };
  bookingId?: number;
}

interface PaymentInvoiceRequest {
  bookingId: number;
  roomId: number;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  nights: number;
  roomPrice: number;
  servicesPrice: number;
  taxes: number;
  serviceFee: number;
  totalPrice: number;
  paymentMethod: string;
  customerInfo: {
    userId: number;
    phone: string;
    email: string;
    name?: string;
  };
  selectedServices: ServiceItem[];
  specialRequests?: string;
}

interface PaymentInvoiceResponse {
  status: string;
  message: string;
  data: {
    invoiceId: string;
    bookingId: string;
    paymentStatus: string;
    totalAmount: number;
    createdAt: string;
  };
}

interface ApiRoomResponse {
  status: string;
  date: string;
  data: {
    id: number;
    roomName: string;
    roomNumber: string;
    roomType: string;
    basePrice: number;
    status: string;
    description: string;
  };
}

interface ApiServiceResponse {
  status: string;
  date: string;
  data: {
    id: number;
    name: string;
    price: number;
    description?: string;
    category?: string;
    image?: string;
    available?: boolean;
  };
}

interface UserData {
  id: number;
  username: string;
  email: string;
  phone: string;
  fullName: string;
  role: string;
  token: string;
}

// Thêm interface mới cho payment invoice API
interface PaymentInvoicePayload {
  bookingId: number;
  roomAmount: number;
  serviceAmount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
}

interface PaymentInvoiceApiResponse {
  status: string;
  message: string;
  data?: any;
}

@Component({
  selector: 'app-booking-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bookingpayment.component.html',
  styleUrl: './bookingpayment.component.css',
})
export class BookingpaymentComponent implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  showSuccessModal = false; // ← THÊM DÒNG NÀY
  successBookingData: any = null; // ← THÊM DÒNG NÀY
  // Notification system
  notificationMessage = signal<string>('');
  notificationType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  showNotification = signal(false);

  // ===== API ENDPOINTS =====
  private baseApiUrl = `${API_URL}/api`;
  private readonly BOOKING_API_URL = `${this.baseApiUrl}/bookings`; // API mới của booking ở đây
  private readonly PAYMENT_API_URL = `${this.baseApiUrl}/v1/payment-invoices`;
  private readonly getRoomByIdApi = `${this.baseApiUrl}/v1/rooms`;
  private readonly getServiceByIdApi = `${this.baseApiUrl}/v1/includeds`;

  // ===== LOCAL STORAGE KEYS =====
  private readonly STORAGE_KEYS = {
    ROOMS_BY_ID: 'hotel_rooms_by_id',
    SELECTED_ROOM: 'hotel_selected_room',
    USER_DATA: 'user',
    FAVORITE_ROOMS: 'hotel_favorite_rooms',
    SERVICES_CACHE: 'hotel_services_cache',
    SELECTED_SERVICES: 'hotel_selected_services',
    BOOKING_DATA: 'hotel_booking_payment_data',
    BOOKING_PAYMENT_DATA: 'hotel_booking_payment_data',
    SEARCH_FILTERS: 'hotel_search_filters',
    PAYMENT_STEP: 'hotel_payment_step',
    PAYMENT_FORM: 'hotel_payment_form',
  };

  // Step management
  currentStep = signal(1);
  totalSteps = 4;
  currentUser = signal<UserData | null>(null);

  constructor(public router: Router, private cdRef: ChangeDetectorRef) {
    afterNextRender(() => {
      console.log('🚀 PAYMENT - Component initialized');

      // Debug localStorage ngay khi component load
      const bookingData = localStorage.getItem('hotel_booking_payment_data');
      console.log(
        '🔍 PAYMENT - Raw booking data from localStorage:',
        bookingData
      );

      if (bookingData) {
        try {
          const parsed = JSON.parse(bookingData);
          console.log('🔍 PAYMENT - Parsed booking data:', parsed);
          console.log(
            '🔍 PAYMENT - bookingForm in parsed data:',
            parsed.bookingForm
          );
        } catch (e) {
          console.error('❌ PAYMENT - Error parsing booking data:', e);
        }
      }

      this.loadUserData();
      this.loadRealBookingData();
    });
  }

  // Loading states
  isProcessingPayment = signal(false);
  isLoadingData = signal(false);
  paymentError = signal<string | null>(null);
  loadingError = signal<string | null>(null);

  // Booking data
  bookingData = signal<BookingData | null>(null);
  hasValidData = signal(false);

  // Payment form
  paymentForm = {
    method: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    phone: '',
    email: '',
  };

  // Booking confirmation
  confirmBooking = signal(false);
  paymentCompleted = signal(false);
  invoiceData = signal<any>(null);

  // Success notification
  showSuccessNotification = signal(false);
  successMessage = signal('');
  bookingId = signal('');

  // Generate booking ID once and store it
  private generatedBookingId: string | null = null;

  // Payment methods
  paymentMethods: PaymentMethod[] = [
    { id: 'vnpay', name: 'VNPay', icon: '💳', type: 'ewallet' },
    { id: 'momo', name: 'MoMo', icon: '🟢', type: 'ewallet' },
    { id: 'bank', name: 'Chuyển khoản ngân hàng', icon: '🏦', type: 'bank' },
    { id: 'credit', name: 'Thẻ tín dụng/ghi nợ', icon: '💳', type: 'credit' },
    { id: 'cash', name: 'Thanh toán tại khách sạn', icon: '💵', type: 'cash' },
  ];

  // QR Code data for bank transfer
  bankQRData = {
    bankName: 'Vietcombank',
    accountNumber: '1234567890',
    accountName: 'AZURE HOTEL',
    amount: 0,
    description: '',
  };

  ngOnInit() {
    console.log('🚀 BookingPayment Component ngOnInit');
    this.isLoadingData.set(true);
    this.loadingError.set(null);
    this.hasValidData.set(false);
  }

  // ===== SUCCESS NOTIFICATION METHODS =====
  showPaymentSuccess(bookingId: string, message?: string) {
    this.bookingId.set(bookingId);
    this.successMessage.set(message || 'Thanh toán thành công!');
    this.showSuccessNotification.set(true);

    // Auto hide after 10 seconds
    setTimeout(() => {
      this.hideSuccessNotification();
    }, 10000);
  }

  hideSuccessNotification() {
    this.showSuccessNotification.set(false);
    this.successMessage.set('');
    this.bookingId.set('');
  }

  // ===== PERSISTENCE METHODS =====
  private loadPersistedState() {
    if (!this.isLocalStorageAvailable()) return;

    // Load persisted step
    const savedStep = this.getFromStorage(this.STORAGE_KEYS.PAYMENT_STEP);
    if (savedStep && savedStep >= 1 && savedStep <= this.totalSteps) {
      this.currentStep.set(savedStep);
    }

    // Load persisted form data
    const savedForm = this.getFromStorage(this.STORAGE_KEYS.PAYMENT_FORM);
    if (savedForm) {
      this.paymentForm = { ...this.paymentForm, ...savedForm };
    }

    console.log('🔄 Loaded persisted state:', {
      step: this.currentStep(),
      form: this.paymentForm,
    });
  }

  private saveCurrentState() {
    if (!this.isLocalStorageAvailable()) return;

    this.setToStorage(this.STORAGE_KEYS.PAYMENT_STEP, this.currentStep());
    this.setToStorage(this.STORAGE_KEYS.PAYMENT_FORM, this.paymentForm);
  }

  // ===== SAFE LOCALSTORAGE ACCESS =====
  private isLocalStorageAvailable(): boolean {
    return (
      isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined'
    );
  }

  getFromStorage(key: string): any {
    if (!this.isLocalStorageAvailable()) {
      console.log('⚠️ localStorage not available');
      return null;
    }

    try {
      const data = localStorage.getItem(key);
      if (!data || data === 'undefined' || data === 'null') {
        return null;
      }

      // Check if it's already an object
      if (typeof data === 'object') {
        return data;
      }

      const parsedData = JSON.parse(data);
      return parsedData;
    } catch (error) {
      console.error(`❌ Error parsing localStorage key ${key}:`, error);
      return null;
    }
  }

  setToStorage(key: string, value: any): void {
    if (!this.isLocalStorageAvailable()) {
      console.log('⚠️ localStorage not available for setting');
      return;
    }

    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`❌ Error setting localStorage key ${key}:`, error);
    }
  }

  removeFromStorage(key: string): void {
    if (!this.isLocalStorageAvailable()) {
      console.log('⚠️ localStorage not available for removal');
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`❌ Error removing localStorage key ${key}:`, error);
    }
  }

  // ===== DEBUG METHODS =====
  debugAllLocalStorage() {
    if (!this.isLocalStorageAvailable()) {
      console.log('⚠️ localStorage not available for debugging');
      return;
    }

    console.log('🔍 === DEBUG ALL LOCALSTORAGE ===');

    Object.entries(this.STORAGE_KEYS).forEach(([keyName, key]) => {
      const data = this.getFromStorage(key);
      if (data) {
        console.log(`✅ Found [${keyName}] - ${key}:`, data);
      } else {
        console.log(`❌ Missing [${keyName}] - ${key}: null`);
      }
    });

    console.log('🔍 === ALL HOTEL RELATED KEYS ===');
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('hotel') || key.includes('booking'))) {
          const value = localStorage.getItem(key);
          console.log(`📂 [${key}]:`, value);
        }
      }
    } catch (error) {
      console.error('❌ Error accessing localStorage keys:', error);
    }
  }

  // ===== FALLBACK DATA =====
  private createFallbackRoomData(): any {
    return {
      id: 1,
      name: 'Phòng Standard',
      roomName: 'Phòng Standard',
      price: 500000,
      pricePerNight: 500000,
      basePrice: 500000,
      image: this.getDefaultRoomImage(),
      roomImage: this.getDefaultRoomImage(),
      priceRange: '500,000 VNĐ',
      rating: 4,
      bedCount: 1,
      capacity: 2,
      description: 'Phòng tiêu chuẩn với đầy đủ tiện nghi',
    };
  }

  private tryFindRoomDataFromAlternativeSources(): any {
    // Try different possible keys for room data
    const possibleKeys = [
      'hotel_selected_room',
      'selectedRoom',
      'booking_room',
      'current_room',
      'room_data',
    ];

    for (const key of possibleKeys) {
      const roomData = this.getFromStorage(key);
      if (roomData && roomData.id) {
        console.log(`✅ Found room data in alternative key: ${key}`, roomData);
        return roomData;
      }
    }

    // Try to find room data in booking data
    const bookingData = this.getFromStorage(this.STORAGE_KEYS.BOOKING_DATA);
    if (bookingData && bookingData.room) {
      console.log('✅ Found room data in booking data:', bookingData.room);
      return bookingData.room;
    }

    // Try to find room data in payment data
    const paymentData = this.getFromStorage(
      this.STORAGE_KEYS.BOOKING_PAYMENT_DATA
    );
    if (paymentData && paymentData.room) {
      console.log('✅ Found room data in payment data:', paymentData.room);
      return paymentData.room;
    }

    return null;
  }

  // ===== LOAD REAL DATA FROM LOCALSTORAGE =====
  async loadRealBookingData(): Promise<void> {
    console.log('🔍 PAYMENT - Loading REAL booking data from localStorage...');
    this.isLoadingData.set(true);
    this.loadingError.set(null);
    this.hasValidData.set(false);

    try {
      // DEBUG: Kiểm tra dữ liệu trong localStorage
      const rawData = localStorage.getItem(
        this.STORAGE_KEYS.BOOKING_PAYMENT_DATA
      );
      console.log('🔍 PAYMENT - Raw localStorage data:', rawData);

      if (!this.isLocalStorageAvailable()) {
        throw new Error(
          'Không thể truy cập localStorage. Vui lòng làm mới trang.'
        );
      }

      const userData = this.getFromStorage(this.STORAGE_KEYS.USER_DATA);
      if (!userData) {
        throw new Error('Vui lòng đăng nhập để tiếp tục thanh toán');
      }

      // DEBUG: Log tất cả storage keys
      console.log('🔍 PAYMENT - All storage data:');
      Object.entries(this.STORAGE_KEYS).forEach(([key, value]) => {
        const data = this.getFromStorage(value);
        console.log(`  ${key}:`, data);
      });

      // Lấy dữ liệu booking payment
      let bookingPaymentData = this.getFromStorage(
        this.STORAGE_KEYS.BOOKING_PAYMENT_DATA
      );
      console.log('🔍 PAYMENT - BookingPaymentData:', bookingPaymentData);

      if (bookingPaymentData) {
        console.log(
          '🔍 PAYMENT - BookingForm in data:',
          bookingPaymentData.bookingForm
        );
        console.log(
          '🔍 PAYMENT - CheckInTime from data:',
          bookingPaymentData.bookingForm?.checkInTime
        );
        console.log(
          '🔍 PAYMENT - CheckOutTime from data:',
          bookingPaymentData.bookingForm?.checkOutTime
        );

        // SỬA: Sử dụng trực tiếp dữ liệu từ booking payment data
        const processedData = this.processBookingData(bookingPaymentData);
        this.bookingData.set(processedData);
        this.updateBankQRData(processedData);
        this.hasValidData.set(true);

        console.log('✅ PAYMENT - Final processed data:', processedData);
        console.log(
          '✅ PAYMENT - Final checkInTime:',
          processedData.checkInTime
        );
        console.log(
          '✅ PAYMENT - Final checkOutTime:',
          processedData.checkOutTime
        );
      } else {
        console.log(
          '⚠️ PAYMENT - No booking payment data found, creating from other sources...'
        );

        // Fallback logic...
        let selectedRoom =
          this.getFromStorage(this.STORAGE_KEYS.SELECTED_ROOM) ||
          this.tryFindRoomDataFromAlternativeSources();

        if (!selectedRoom) {
          console.warn('⚠️ No room data found, using fallback data');
          selectedRoom = this.createFallbackRoomData();
          this.loadingError.set(this.createRoomDataWarning());
        }

        const allServices =
          this.getFromStorage(this.STORAGE_KEYS.SELECTED_SERVICES) || [];
        const selectedServices = await this.processSelectedServices(
          allServices
        );
        const searchFilters =
          this.getFromStorage(this.STORAGE_KEYS.SEARCH_FILTERS) || {};

        const bookingData = this.createBookingData(
          selectedRoom,
          selectedServices,
          searchFilters
        );
        this.validateAndProcessBookingData(bookingData);
        this.setToStorage(this.STORAGE_KEYS.BOOKING_PAYMENT_DATA, bookingData);
      }
    } catch (error) {
      this.handleLoadingError(error);
    } finally {
      this.finalizeLoading();
    }
  }

  // ===== CÁC PHƯƠNG THỨC HỖ TRỢ =====
  private createRoomDataWarning(): string {
    return `⚠️ Không tìm thấy thông tin phòng đã chọn. Đang sử dụng dữ liệu mẫu. Để có trải nghiệm tốt nhất: 1. Quay lại trang chủ 2. Chọn phòng từ danh sách 3. Tiến hành đặt phòng`;
  }

  private async processSelectedServices(
    services: any[]
  ): Promise<ServiceItem[]> {
    const selectedServices = services.filter(
      (service) => (service.quantity || 0) > 0
    );
    if (selectedServices.length > 0) {
      console.log('🔄 Processing services data...');
      return await this.processServicesData(selectedServices);
    }
    console.log('⚠️ No services selected (quantity > 0)');
    return [];
  }

  private createBookingData(
    room: any,
    services: ServiceItem[],
    filters: any
  ): any {
    return {
      room: room,
      checkInDate: filters.checkInDate || this.getDefaultCheckInDate(),
      checkOutDate: filters.checkOutDate || this.getDefaultCheckOutDate(),
      // SỬA: Sử dụng thời gian từ filters thay vì cố định
      checkInTime: filters.checkInTime || '14:00',
      checkOutTime: filters.checkOutTime || '12:00',
      guestCount: filters.guestCount || '2',
      specialRequests: filters.specialRequests || '',
      selectedServices: services,
    };
  }

  private validateAndProcessBookingData(data: any): void {
    if (!this.validateBookingData(data)) {
      throw new Error('Dữ liệu đặt phòng không đầy đủ hoặc không hợp lệ');
    }
    const processedData = this.processBookingData(data);
    this.bookingData.set(processedData);
    this.updateBankQRData(processedData);
    this.hasValidData.set(true);
    this.setToStorage(this.STORAGE_KEYS.BOOKING_PAYMENT_DATA, processedData);
    console.log('✅ Successfully processed booking data:', processedData);
  }

  private handleLoadingError(error: any): void {
    console.error('❌ Error loading real booking data:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.loadingError.set(
      `Lỗi tải dữ liệu đặt phòng: ${errorMessage} Vui lòng: 1. Quay lại trang chủ 2. Chọn phòng từ danh sách 3. Chọn dịch vụ (nếu có) 4. Tiến hành đặt phòng`
    );
    this.hasValidData.set(false);
  }

  private finalizeLoading(): void {
    this.isLoadingData.set(false);
    setTimeout(() => this.cdr.detectChanges());
  }

  async processServicesData(servicesData: any[]): Promise<ServiceItem[]> {
    console.log('🔄 Processing services data:', servicesData);

    const processedServices: ServiceItem[] = [];

    for (const service of servicesData) {
      const quantity = service.quantity || 0;
      if (quantity <= 0) {
        console.log(
          `⏭️ Skipping service "${service.name}" - quantity: ${quantity}`
        );
        continue;
      }

      let serviceItem: ServiceItem = {
        id: service.id || 0,
        name: service.name || 'Dịch vụ',
        quantity: quantity,
        price: service.price || 0,
        totalPrice: 0,
      };

      if ((!service.price || service.price === 0) && service.id) {
        console.log(`🌐 Fetching price for service ${service.id} from API...`);
        try {
          const apiServiceData = await this.fetchServiceById(service.id);
          serviceItem.price = apiServiceData.price;
          serviceItem.name = apiServiceData.name;
        } catch (error) {
          console.warn(
            `⚠️ Could not fetch service ${service.id} from API, using localStorage data`
          );
        }
      }

      serviceItem.totalPrice = serviceItem.price * serviceItem.quantity;
      processedServices.push(serviceItem);

      console.log(
        `✅ Processed service: ${serviceItem.name} - ${
          serviceItem.quantity
        }x${this.formatPrice(serviceItem.price)} = ${this.formatPrice(
          serviceItem.totalPrice
        )}`
      );
    }

    console.log(`🎯 Final services count: ${processedServices.length}`);
    return processedServices;
  }

  private validateBookingData(data: any): boolean {
    if (!this.currentUser()) {
      this.loadingError.set('Vui lòng đăng nhập để tiếp tục thanh toán');
      return false;
    }

    if (!data.checkInDate || !data.checkOutDate) {
      console.error('❌ Missing check-in/check-out dates');
      return false;
    }

    const roomPrice =
      data.room.price || data.room.pricePerNight || data.room.basePrice;
    if (!roomPrice || roomPrice <= 0) {
      console.error('❌ Missing or invalid room price');
      return false;
    }

    console.log('✅ Booking data validation passed');
    return true;
  }

  // ===== API CALLS =====
  async fetchRoomById(roomId: number): Promise<any> {
    try {
      console.log(`🌐 Calling API: GET ${this.getRoomByIdApi}/${roomId}`);

      const response = await this.http
        .get<ApiRoomResponse>(`${this.getRoomByIdApi}/${roomId}`)
        .toPromise();

      if (response && response.status === 'Success' && response.data) {
        console.log('✅ Room API response:', response);

        return {
          pricePerNight: response.data.basePrice,
          basePrice: response.data.basePrice,
          price: response.data.basePrice,
          roomName: response.data.roomName,
          description: response.data.description,
        };
      }

      throw new Error('Invalid room API response');
    } catch (error) {
      console.error(`❌ Error fetching room ${roomId}:`, error);
      throw error;
    }
  }

  async fetchServiceById(serviceId: number): Promise<any> {
    try {
      console.log(`🌐 Calling API: GET ${this.getServiceByIdApi}/${serviceId}`);

      const response = await this.http
        .get<ApiServiceResponse>(`${this.getServiceByIdApi}/${serviceId}`)
        .toPromise();

      if (response && response.status === 'Success' && response.data) {
        console.log(`✅ Service API response for ${serviceId}:`, response);

        return {
          id: response.data.id,
          name: response.data.name,
          price: response.data.price,
          description: response.data.description,
        };
      }

      throw new Error('Invalid service API response');
    } catch (error) {
      console.error(`❌ Error fetching service ${serviceId}:`, error);
      throw error;
    }
  }

  getDefaultCheckInDate(): string {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  }

  getDefaultCheckOutDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    return tomorrow.toISOString().split('T')[0];
  }

  processBookingData(data: any): BookingData {
    console.log(
      '💰 PAYMENT - Processing booking data for pricing calculation:',
      data
    );

    // SỬA: Kiểm tra nếu data đã có cấu trúc BookingPaymentData
    let roomData: any, bookingFormData: any, servicesData: any;

    if (data.roomInfo) {
      // Dữ liệu từ BookingPaymentData (DetailroomComponent)
      roomData = data.roomInfo;
      bookingFormData = data.bookingForm;
      servicesData = data.selectedServices;
      console.log('📋 PAYMENT - Using BookingPaymentData structure');
    } else {
      // Dữ liệu legacy
      roomData = data.room;
      bookingFormData = data;
      servicesData = data.selectedServices;
      console.log('📋 PAYMENT - Using legacy data structure');
    }

    const roomPrice =
      roomData.price || roomData.pricePerNight || roomData.basePrice || 0;
    if (roomPrice <= 0) {
      throw new Error('Không tìm thấy giá phòng hợp lệ');
    }

    let selectedServices = Array.isArray(servicesData) ? servicesData : [];
    selectedServices = selectedServices.filter(
      (service: any) => service.quantity > 0
    );

    const nights = this.calculateNights(
      bookingFormData.checkInDate,
      bookingFormData.checkOutDate
    );
    const roomTotalPrice = this.calculateRoomTotalPrice(roomPrice, nights);
    const servicesTotalPrice =
      this.calculateServicesTotalPrice(selectedServices);
    const subtotal = roomTotalPrice + servicesTotalPrice;
    const taxes = this.calculateTaxes(subtotal);
    const serviceFee = this.calculateServiceFee(subtotal);
    const totalPrice = subtotal + taxes + serviceFee;

    console.log('💰 PAYMENT - Final booking data:', {
      checkInTime: bookingFormData.checkInTime,
      checkOutTime: bookingFormData.checkOutTime,
      roomPrice: this.formatPrice(roomPrice),
      nights,
      totalPrice: this.formatPrice(totalPrice),
    });

    return {
      room: {
        id: roomData.id,
        roomName: roomData.name || roomData.roomName,
        roomImage:
          roomData.image ||
          roomData.roomImage ||
          roomData.gallery?.[0] ||
          this.getDefaultRoomImage(),
        priceRange: roomData.priceRange || `${this.formatPrice(roomPrice)}`,
        rating: roomData.rating || 4,
        bedCount: roomData.bedCount || 1,
        capacity: roomData.capacity || 2,
        pricePerNight: roomPrice,
      },
      checkInDate: bookingFormData.checkInDate,
      checkOutDate: bookingFormData.checkOutDate,
      // SỬA: Sử dụng thời gian từ bookingFormData
      checkInTime: bookingFormData.checkInTime || '14:00',
      checkOutTime: bookingFormData.checkOutTime || '12:00',
      guestCount: bookingFormData.guestCount || '2',
      specialRequests: bookingFormData.specialRequests || '',
      selectedServices: selectedServices,
      nights,
      roomTotalPrice,
      servicesTotalPrice,
      taxes,
      serviceFee,
      totalPrice,
    };
  }

  getDefaultRoomImage(): string {
    return 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400';
  }

  // ===== PRICING CALCULATION METHODS =====
  calculateNights(checkIn: string, checkOut: string): number {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return nights > 0 ? nights : 1;
  }

  calculateRoomTotalPrice(pricePerNight: number, nights: number): number {
    return pricePerNight * nights;
  }

  calculateServicesTotalPrice(services: ServiceItem[]): number {
    if (!Array.isArray(services)) return 0;

    return services.reduce((total, service) => {
      const serviceTotal = (service.price || 0) * (service.quantity || 0);
      console.log(
        `💰 Service calc: ${service.name} = ${service.price} x ${service.quantity} = ${serviceTotal}`
      );
      return total + serviceTotal;
    }, 0);
  }

  calculateTaxes(subtotal: number): number {
    return 0;
  }

  calculateServiceFee(subtotal: number): number {
    return 0;
  }

  updateBankQRData(data: BookingData) {
    this.bankQRData.amount = data.totalPrice;
    this.bankQRData.description = `Thanh toan phong ${data.room.roomName} - ${data.nights} dem`;
  }

  // ===== STEP NAVIGATION WITH VALIDATION =====
  nextStep() {
    const currentStepValue = this.currentStep();

    if (!this.canProceedToNextStep(currentStepValue)) {
      this.showStepValidationError(currentStepValue);
      return;
    }

    if (currentStepValue < this.totalSteps) {
      setTimeout(() => {
        const newStep = currentStepValue + 1;
        this.currentStep.set(newStep);
        this.saveCurrentState();
        console.log(`📍 Moved to step ${newStep}`);
        this.cdRef.detectChanges();
      });
    }
  }

  previousStep() {
    const currentStepValue = this.currentStep();
    if (currentStepValue > 1) {
      const newStep = currentStepValue - 1;
      this.currentStep.set(newStep);
      this.saveCurrentState();
      console.log(`📍 Moved back to step ${newStep}`);
    }
  }

  goToStep(step: number) {
    if (!this.canNavigateToStep(step)) {
      this.showNavigationError(step);
      return;
    }

    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep.set(step);
      this.saveCurrentState();
      console.log(`📍 Navigated to step ${step}`);
    }
  }

  private canProceedToNextStep(currentStep: number): boolean {
    switch (currentStep) {
      case 1:
        return this.isStep1Valid();
      case 2:
        return this.isStep2Valid();
      case 3:
        return this.isStep3Valid();
      default:
        return true;
    }
  }

  private canNavigateToStep(targetStep: number): boolean {
    const currentStepValue = this.currentStep();

    if (targetStep < currentStepValue) {
      return true;
    }

    for (let step = 1; step < targetStep; step++) {
      if (!this.canProceedToNextStep(step)) {
        return false;
      }
    }

    return true;
  }

  private showStepValidationError(step: number) {
    let message = '';
    switch (step) {
      case 1:
        message = 'Vui lòng chờ dữ liệu đặt phòng được tải hoàn tất!';
        break;
      case 2:
        message = 'Vui lòng chọn phương thức thanh toán!';
        break;
      case 3:
        message = 'Vui lòng điền đầy đủ thông tin thanh toán!';
        break;
    }
    this.showNotificationMessage(message, 'warning'); // ← THAY BẰNG DÒNG NÀY
  }

  private showNavigationError(step: number) {
    this.showNotificationMessage(
      `Bạn cần hoàn thành các bước trước đó để có thể chuyển đến bước ${step}!`,
      'warning'
    ); // ← THAY BẰNG ĐOẠN NÀY
  }

  // ===== PAYMENT METHODS =====
  selectPaymentMethod(methodId: string) {
    this.paymentForm.method = methodId;
    this.saveCurrentState();
  }

  // ===== VALIDATION =====
  isStep1Valid(): boolean {
    return !!this.bookingData() && this.hasValidData() && !this.isLoadingData();
  }

  isStep2Valid(): boolean {
    return !!this.paymentForm.method;
  }

  isStep3Valid(): boolean {
    if (!this.paymentForm.method) return false;

    switch (this.paymentForm.method) {
      case 'credit':
        return !!(
          this.paymentForm.cardNumber &&
          this.paymentForm.expiryDate &&
          this.paymentForm.cvv &&
          this.paymentForm.cardName
        );
      case 'bank':
      case 'vnpay':
      case 'momo':
        return !!(this.paymentForm.phone && this.paymentForm.email);
      case 'cash':
        return true;
      default:
        return false;
    }
  }

  // ===== PAYMENT PROCESSING =====
  async processPayment() {
    console.log('=== USING USER SELECTED DATES ===');

    const user = this.currentUser();
    const bookingData = this.bookingData();

    if (!user || !bookingData) {
      console.error('❌ Missing data');
      return;
    }

    // Kiểm tra ngày hợp lệ
    if (!bookingData.checkInDate || !bookingData.checkOutDate) {
      this.showNotificationMessage(
        'Thiếu thông tin ngày nhận/trả phòng',
        'error'
      ); // ← THAY BẰNG DÒNG NÀY
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    // SỬ DỤNG NGÀY USER ĐÃ CHỌN
    const correctPayload = {
      fullName: user.fullName || 'Trần Thị Bình',
      roomNumber: '104',
      checkInDate: bookingData.checkInDate, // ← SỬA: Dùng ngày user chọn
      checkOutDate: bookingData.checkOutDate, // ← SỬA: Dùng ngày user chọn
      status: 'Confirmed',
      bookingType: 'Night',
      note: bookingData.specialRequests || 'Booking từ website',
    };

    console.log('📋 Payload with user selected dates:', correctPayload);

    try {
      const bookingResponse = await this.http
        .post(`${API_URL}/api/bookings`, correctPayload, { headers })
        .toPromise();
      console.log('🎉 BOOKING SUCCESS:', bookingResponse);

      // THÊM PHẦN GỌI PAYMENT API SAU KHI BOOKING THÀNH CÔNG
      if (bookingResponse) {
        await this.createPaymentInvoice(bookingResponse, bookingData);
      }

      this.successBookingData = correctPayload;
      this.showSuccessModal = true;
    } catch (error: any) {
      console.log('❌ BOOKING FAILED:', error.status, error.error);

      // Nếu có lỗi validation ngày từ backend, hiển thị thông báo cụ thể
      if (error.status === 400 && error.error?.message?.includes('date')) {
        this.showNotificationMessage(
          `Lỗi ngày tháng: ${error.error.message}. Vui lòng kiểm tra lại ngày nhận/trả phòng.`,
          'error'
        ); // ← THAY BẰNG
      } else {
        this.showNotificationMessage(
          `Đặt phòng thất bại: ${error.error?.retMsg || error.message}`,
          'error'
        ); // ← THAY BẰNG
      }
    }
  }

  async createPaymentInvoice(
    bookingResponse: any,
    bookingData: BookingData
  ): Promise<any> {
    try {
      console.log('💰 Creating payment invoice...');
      console.log('📋 Full booking response:', bookingResponse);

      // LẤY BOOKING ID TỪ RESPONSE
      let bookingId = null;

      // Thử nhiều cách lấy booking ID từ response
      if (bookingResponse.id) {
        bookingId = bookingResponse.id;
      } else if (bookingResponse.bookingId) {
        bookingId = bookingResponse.bookingId;
      } else if (bookingResponse.data?.id) {
        bookingId = bookingResponse.data.id;
      } else if (bookingResponse.data?.bookingId) {
        bookingId = bookingResponse.data.bookingId;
      }

      // NẾU KHÔNG TÌM THẤY BOOKING ID, TẠO ID TẠM THỜI
      if (!bookingId || bookingId <= 0) {
        console.warn('⚠️ API không trả về booking ID, tạo ID tạm thời');
        bookingId = Date.now(); // Sử dụng timestamp làm booking ID tạm thời
        console.log(`🔧 Generated temporary booking ID: ${bookingId}`);
      } else {
        console.log(`✅ Found booking ID: ${bookingId}`);
      }

      // Tạo payload cho payment invoice
      const paymentPayload = {
        bookingId: Number(bookingId),
        roomAmount: bookingData.roomTotalPrice || 1000000,
        serviceAmount: bookingData.servicesTotalPrice || 0,
        tax: bookingData.taxes || 0,
        totalAmount: bookingData.totalPrice || 1000000,
        paymentMethod: this.getPaymentMethodName(),
        status: 'Paid',
      };

      console.log('💰 Payment invoice payload:', paymentPayload);

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      });

      const paymentResponse = await this.http
        .post(`${API_URL}/api/v1/payment-invoices`, paymentPayload, {
          headers,
        })
        .toPromise();

      console.log('✅ Payment invoice created successfully:', paymentResponse);
      return paymentResponse;
    } catch (error: any) {
      console.error('❌ Payment invoice creation failed:', error);
      console.warn('⚠️ Payment invoice failed but booking is still successful');
      return null;
    }
  }

  getPaymentMethodName(): string {
    const paymentMethodNames = {
      vnpay: 'VNPay',
      momo: 'MoMo',
      bank: 'Chuyển khoản ngân hàng',
      credit: 'Thẻ tín dụng/ghi nợ',
      cash: 'Tiền mặt',
    };

    return (
      paymentMethodNames[
        this.paymentForm.method as keyof typeof paymentMethodNames
      ] || 'Tiền mặt'
    );
  }

  createBookingPayload(bookingData: BookingData): BookingRequest {
    console.log('🔥 ENTERED createBookingPayload method');

    const user = this.currentUser();
    console.log('🔍 Raw user data:', user);

    if (!user) {
      throw new Error('Vui lòng đăng nhập để tiếp tục đặt phòng');
    }

    console.log('🔍 Raw booking data:', bookingData);
    console.log('🔍 Room data specifically:', bookingData?.room);

    if (!bookingData.room?.id) {
      throw new Error('Không tìm thấy thông tin phòng');
    }

    if (!bookingData.checkInDate || !bookingData.checkOutDate) {
      throw new Error('Thiếu thông tin ngày nhận/trả phòng');
    }

    if (!user.id) {
      throw new Error('Không tìm thấy ID người dùng');
    }

    // LOG CHI TIẾT IDs TRƯỚC KHI GỬI
    const userId = Number(user.id);
    const roomId = Number(bookingData.room.id);

    console.log('🚨 CRITICAL DEBUG:');
    console.log('🚨 user.id:', user.id, 'type:', typeof user.id);
    console.log('🚨 userId after Number():', userId, 'type:', typeof userId);
    console.log(
      '🚨 bookingData.room.id:',
      bookingData.room.id,
      'type:',
      typeof bookingData.room.id
    );
    console.log('🚨 roomId after Number():', roomId, 'type:', typeof roomId);

    const payload = {
      userId: userId,
      roomId: roomId,
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      guestCount: Number(bookingData.guestCount) || 1,
      specialRequests: bookingData.specialRequests || '',
      selectedServices: bookingData.selectedServices.map((service) => ({
        id: Number(service.id),
        name: service.name || '',
        quantity: Number(service.quantity) || 0,
        price: Number(service.price) || 0,
        totalPrice: Number(service.totalPrice) || 0,
      })),
      customerInfo: {
        name:
          this.paymentForm.cardName ||
          user.fullName ||
          user.username ||
          'Khách hàng',
        phone: this.paymentForm.phone || user.phone || '',
        email: this.paymentForm.email || user.email || '',
      },
      paymentMethod: this.paymentForm.method || 'cash',
      roomPrice: Number(bookingData.roomTotalPrice) || 0,
      servicesPrice: Number(bookingData.servicesTotalPrice) || 0,
      taxes: Number(bookingData.taxes) || 0,
      serviceFee: Number(bookingData.serviceFee) || 0,
      totalPrice: Number(bookingData.totalPrice) || 0,
      nights: Number(bookingData.nights) || 1,
    };

    console.log(
      '🚨 FINAL PAYLOAD ABOUT TO SEND:',
      JSON.stringify(payload, null, 2)
    );

    if (!payload.customerInfo.email) {
      throw new Error('Email khách hàng không được để trống');
    }

    if (!payload.customerInfo.phone) {
      throw new Error('Số điện thoại khách hàng không được để trống');
    }

    if (payload.totalPrice <= 0) {
      throw new Error('Tổng giá trị đơn hàng phải lớn hơn 0');
    }

    if (isNaN(payload.userId) || payload.userId <= 0) {
      throw new Error(`userId không hợp lệ: ${payload.userId}`);
    }

    if (isNaN(payload.roomId) || payload.roomId <= 0) {
      throw new Error(`roomId không hợp lệ: ${payload.roomId}`);
    }

    return payload;
  }

  createPaymentInvoicePayload(
    bookingId: number,
    bookingData: BookingData
  ): PaymentInvoicePayload {
    const paymentMethodNames = {
      vnpay: 'VNPay',
      momo: 'MoMo',
      bank: 'Chuyển khoản ngân hàng',
      credit: 'Thẻ tín dụng/ghi nợ',
      cash: 'Tiền mặt',
    };

    const paymentMethodName =
      paymentMethodNames[
        this.paymentForm.method as keyof typeof paymentMethodNames
      ] || 'Tiền mặt';

    return {
      bookingId: Number(bookingId),
      roomAmount: Number(bookingData.roomTotalPrice),
      serviceAmount: Number(bookingData.servicesTotalPrice),
      tax: Number(bookingData.taxes),
      totalAmount: Number(bookingData.totalPrice),
      paymentMethod: paymentMethodName,
      status: 'Paid',
    };
  }

  callBookingAPI(payload: BookingRequest): Promise<BookingResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    console.log(
      '🚀 Full booking payload being sent:',
      JSON.stringify(payload, null, 2)
    );

    return this.http
      .post<BookingResponse>(this.BOOKING_API_URL, payload, { headers })
      .toPromise() as Promise<BookingResponse>;
  }

  async callPaymentInvoiceAPI(
    payload: PaymentInvoicePayload
  ): Promise<PaymentInvoiceApiResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    console.log('🌐 Calling Payment Invoice API:', this.PAYMENT_API_URL);
    console.log(
      '📋 Payment invoice payload:',
      JSON.stringify(payload, null, 2)
    );

    try {
      const response = await this.http
        .post<PaymentInvoiceApiResponse>(this.PAYMENT_API_URL, payload, {
          headers,
        })
        .toPromise();

      if (!response) {
        throw new Error('Không nhận được phản hồi từ API payment invoice');
      }

      return response;
    } catch (error: any) {
      console.error('❌ Payment Invoice API Error:', error);
      throw new Error(
        `Lỗi tạo hóa đơn thanh toán: ${error.message || 'Không xác định'}`
      );
    }
  }

  handleBookingSuccess(response: BookingResponse | any) {
    console.log('🎉 Đặt phòng thành công:', response);

    setTimeout(() => {
      let responseData: any = null;
      let bookingId: string = '';

      if (response?.data?.bookingId) {
        responseData = response.data;
        bookingId = response.data.bookingId.toString();
      } else if (response?.bookingId) {
        responseData = response;
        bookingId = response.bookingId.toString();
      } else {
        console.warn('⚠️ Không có booking ID trong response');
        bookingId = this.generateBookingId();
        responseData = {
          bookingId: bookingId,
          userId: this.currentUser()?.id || 0,
          roomId: this.bookingData()?.room.id || 0,
          totalPrice: this.bookingData()?.totalPrice || 0,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        };
      }

      this.generatedBookingId = bookingId;
      this.bookingId.set(bookingId);

      this.invoiceData.set(responseData);
      this.paymentCompleted.set(true);
      this.showPaymentSuccess(bookingId, 'Đặt phòng thành công!');
      this.nextStep();
      this.saveBookingToHistory(responseData);
      this.clearTempBookingData();
    });
  }

  handlePaymentSuccess(
    bookingResponse: BookingResponse,
    paymentResponse: PaymentInvoiceApiResponse
  ) {
    console.log('🎉 Full payment process completed successfully!');
    console.log('📋 Booking Response:', bookingResponse);
    console.log('💰 Payment Response:', paymentResponse);

    setTimeout(() => {
      const bookingId =
        bookingResponse.data?.bookingId || bookingResponse.bookingId;

      const combinedData = {
        booking: bookingResponse.data || bookingResponse,
        payment: paymentResponse.data || paymentResponse,
        bookingId: bookingId?.toString() || this.generateBookingId(),
      };

      this.generatedBookingId = combinedData.bookingId;
      this.bookingId.set(combinedData.bookingId);

      this.invoiceData.set(combinedData);
      this.paymentCompleted.set(true);
      this.showPaymentSuccess(
        combinedData.bookingId,
        'Đặt phòng và thanh toán thành công!'
      );
      this.nextStep();
      this.saveBookingToHistory(combinedData);
      this.clearTempBookingData();
    });
  }

  handlePaymentError(error: any) {
    console.error('❌ Full error object:', error);
    console.error('❌ Error status:', error.status);
    console.error('❌ Error statusText:', error.statusText);
    console.error('❌ Error headers:', error.headers);
    console.error('❌ Error error:', error.error);
    console.error('❌ Error message:', error.message);

    // Log chi tiết response body
    if (error.error) {
      console.error(
        '❌ Server response body:',
        JSON.stringify(error.error, null, 2)
      );
    }

    let errorMessage =
      'Có lỗi xảy ra trong quá trình đặt phòng. Vui lòng thử lại!';

    // Xử lý các loại lỗi khác nhau
    if (error.status === 400) {
      if (error.error?.retMsg === 'User or room not found') {
        errorMessage =
          'Không tìm thấy thông tin người dùng hoặc phòng trong hệ thống. Vui lòng:\n1. Đăng nhập lại\n2. Chọn lại phòng từ danh sách\n3. Thử lại';
      } else if (error.error?.message) {
        errorMessage = `Lỗi dữ liệu: ${error.error.message}`;
      } else if (error.error?.retMsg) {
        errorMessage = `Lỗi: ${error.error.retMsg}`;
      } else if (error.error?.errors) {
        const errors = Array.isArray(error.error.errors)
          ? error.error.errors.join(', ')
          : JSON.stringify(error.error.errors);
        errorMessage = `Lỗi validation: ${errors}`;
      } else {
        errorMessage =
          'Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại thông tin!';
      }
    } else if (error.status === 401) {
      errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!';
      this.router.navigate(['/login']);
    } else if (error.status === 403) {
      errorMessage = 'Bạn không có quyền thực hiện thao tác này!';
    } else if (error.status === 500) {
      errorMessage = 'Lỗi server. Vui lòng thử lại sau!';
    } else if (error.message) {
      errorMessage = error.message;
    }

    this.paymentError.set(errorMessage);
    this.showNotificationMessage(errorMessage, 'error');
  }

  saveBookingToHistory(bookingResponse: any) {
    if (!this.isLocalStorageAvailable()) return;

    try {
      let bookingHistory: any[] = [];
      const historyData = this.getFromStorage('bookingHistory');

      if (historyData) {
        if (Array.isArray(historyData)) {
          bookingHistory = historyData;
        } else if (typeof historyData === 'string') {
          try {
            bookingHistory = JSON.parse(historyData);
          } catch (parseError) {
            console.warn('❌ Could not parse booking history, starting fresh');
            bookingHistory = [];
          }
        }
      }

      if (!Array.isArray(bookingHistory)) {
        bookingHistory = [];
      }

      const booking = {
        ...this.bookingData(),
        paymentMethod: this.paymentForm.method,
        bookingDate: bookingResponse.createdAt || new Date().toISOString(),
        status: bookingResponse.status || 'confirmed',
        bookingId:
          bookingResponse.bookingId ||
          bookingResponse.data?.bookingId ||
          this.generatedBookingId,
        userId:
          bookingResponse.userId ||
          bookingResponse.data?.userId ||
          this.currentUser()?.id,
        apiResponse: bookingResponse,
      };

      bookingHistory.push(booking);
      this.setToStorage('bookingHistory', bookingHistory);
      console.log('📝 Booking saved to history:', booking);
    } catch (error) {
      console.error('❌ Error saving booking to history:', error);
    }
  }

  clearTempBookingData() {
    this.removeFromStorage(this.STORAGE_KEYS.BOOKING_PAYMENT_DATA);
    this.removeFromStorage(this.STORAGE_KEYS.BOOKING_DATA);
    this.removeFromStorage(this.STORAGE_KEYS.SELECTED_SERVICES);
    this.removeFromStorage(this.STORAGE_KEYS.SELECTED_ROOM);
    this.removeFromStorage(this.STORAGE_KEYS.PAYMENT_STEP);
    this.removeFromStorage(this.STORAGE_KEYS.PAYMENT_FORM);
    console.log('🗑️ Cleared temporary booking data');
  }

  generateBookingId(): string {
    return Date.now().toString().slice(-8);
  }

  // ===== GETTER METHODS FOR PRICING DISPLAY =====
  getRoomTotalPrice(): number {
    return this.bookingData()?.roomTotalPrice || 0;
  }

  getServicesTotalPrice(): number {
    return this.bookingData()?.servicesTotalPrice || 0;
  }

  getTaxes(): number {
    return this.bookingData()?.taxes || 0;
  }

  getServiceFee(): number {
    return this.bookingData()?.serviceFee || 0;
  }

  getTotalPrice(): number {
    return this.bookingData()?.totalPrice || 0;
  }

  getSubtotal(): number {
    return this.getRoomTotalPrice() + this.getServicesTotalPrice();
  }

  // ===== UTILITY METHODS =====
  formatPrice(price: number): string {
    if (!price || isNaN(price)) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getStepTitle(step: number): string {
    switch (step) {
      case 1:
        return 'Thông tin đặt phòng';
      case 2:
        return 'Phương thức thanh toán';
      case 3:
        return 'Thông tin thanh toán';
      case 4:
        return 'Hoàn tất';
      default:
        return '';
    }
  }

  goBackToDetailRoom() {
    this.router.navigate(['/']);
  }

  createArray(size: number): number[] {
    return Array(size).fill(0);
  }

  private validateRequiredData(): boolean {
    const requiredKeys = [
      this.STORAGE_KEYS.SELECTED_ROOM,
      this.STORAGE_KEYS.BOOKING_DATA,
    ];

    return requiredKeys.every((key) => {
      const data = this.getFromStorage(key);
      if (!data) {
        console.error(`Thiếu dữ liệu bắt buộc: ${key}`);
      }
      return !!data;
    });
  }

  // ===== USER DATA METHODS =====
  private loadUserData(): void {
    const userData = this.getFromStorage(this.STORAGE_KEYS.USER_DATA);
    console.log('Dữ liệu user từ localStorage:', userData);

    if (userData) {
      this.currentUser.set(userData);
      this.populateUserForm();
      console.log('✅ Đã load user:', userData);
    } else {
      console.error('❌ Không tìm thấy user trong localStorage');
      this.router.navigate(['/login']);
    }
  }

  private populateUserForm(): void {
    const user = this.currentUser();
    if (user) {
      this.paymentForm.email = user.email || '';
      this.paymentForm.phone = user.phone || '';
      this.paymentForm.cardName = user.fullName || '';
    }
    this.setToStorage(this.STORAGE_KEYS.PAYMENT_FORM, this.paymentForm);
  }

  private validateUserData(): boolean {
    const user = this.currentUser();
    if (!user) return false;

    if (!user.email) {
      this.loadingError.set(
        'Email không được để trống. Vui lòng cập nhật thông tin cá nhân.'
      );
      return false;
    }

    if (!user.phone) {
      this.loadingError.set(
        'Số điện thoại không được để trống. Vui lòng cập nhật thông tin cá nhân.'
      );
      return false;
    }

    return true;
  }

  generateBookingIdIfNeeded() {
    if (!this.bookingId()) {
      this.bookingId.set(this.generateBookingId());
    }
    return this.bookingId();
  }

  private initializeDefaultData() {
    if (!this.isLocalStorageAvailable()) return;

    if (!this.getFromStorage(this.STORAGE_KEYS.USER_DATA)) {
      console.warn('Không tìm thấy dữ liệu user, yêu cầu đăng nhập');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.getFromStorage(this.STORAGE_KEYS.BOOKING_DATA)) {
      console.warn(
        'Không tìm thấy dữ liệu đặt phòng, quay lại trang chọn phòng'
      );
      this.router.navigate(['/rooms']);
      return;
    }

    const defaultPaymentStep =
      this.getFromStorage(this.STORAGE_KEYS.PAYMENT_STEP) || 1;
    this.currentStep.set(defaultPaymentStep);

    const defaultPaymentForm = this.getFromStorage(
      this.STORAGE_KEYS.PAYMENT_FORM
    ) || {
      method: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: '',
      phone: '',
      email: '',
    };
    Object.assign(this.paymentForm, defaultPaymentForm);
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }
  goToBookingHistory() {
    this.closeSuccessModal();
    this.router.navigate(['/bookinghistory']);
  }

  // Method mới để hiển thị notification
  showNotificationMessage(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 5000
  ) {
    this.notificationMessage.set(message);
    this.notificationType.set(type);
    this.showNotification.set(true);

    // Tự động ẩn sau một khoảng thời gian
    setTimeout(() => {
      this.hideNotification();
    }, duration);
  }

  hideNotification() {
    this.showNotification.set(false);
    setTimeout(() => {
      this.notificationMessage.set('');
      this.notificationType.set('info');
    }, 300); // Delay để animation hoạt động
  }

  goToHome() {
    this.closeSuccessModal();
    this.router.navigate(['/']);
  }

  getFormattedNotificationMessage(): string {
    return this.notificationMessage().replace(/\n/g, '<br>');
  }
} // ← Dấu } đóng class
