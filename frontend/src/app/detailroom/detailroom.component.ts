import { Component, signal, computed, OnInit, HostListener, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import axios from 'axios';
import { AxiosResponse } from 'axios';

interface Room {
  id: number;
  name: string;
  capacity: number;
  rating: number;
  priceRange: string;
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  description?: string;
  image: string;
  images?: string[];
  gallery: string[];
  featured: boolean;
  isFavorite: boolean;
  bedCount: number;
  category: string;
  roomNumber?: string;
  status?: string;
  amenities?: string[];
  area?: number;
  view?: string;
  type?: string;
  reviews: Review[];
  detailDescription?: string;
  facilities?: string[];
  policies?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: string;
  maxOccupancy?: number;
  roomSize?: string;
  bedType?: string;
  smokingPolicy?: string;
  petPolicy?: string;
  wifiIncluded?: boolean;
  breakfastIncluded?: boolean;
  airConditioning?: boolean;
  miniBar?: boolean;
  roomService?: boolean;
  laundryService?: boolean;
  conciergeService?: boolean;
  fitnessCenter?: boolean;
  swimmingPool?: boolean;
  spa?: boolean;
  restaurant?: boolean;
  businessCenter?: boolean;
  meetingRooms?: boolean;
  airport_shuttle?: boolean;
  parking?: boolean;
  location?: {
    floor?: number;
    building?: string;
    nearbyAttractions?: string[];
  };
  availability?: {
    available: boolean;
    nextAvailableDate?: string;
    bookedDates?: string[];
  };
  pricing?: {
    basePrice: number;
    taxes: number;
    serviceFee: number;
    totalPrice: number;
    currency: string;
    pricePerNight: number;
    weekendSurcharge?: number;
    holidaySurcharge?: number;
  };
}

interface Review {
  id: number;
  userName: string;
  avatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  gender?: string;
  nationality?: string;
  status?: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
  description?: string;
  image: string;
  category: string;
  quantity?: number;
}

interface HotelImage {
  url: string;
  name: string;
}

interface ApiService {
  id: number;
  name: string;
  price: number;
  description?: string;
  category?: string;
  image?: string;
  available?: boolean;
  serviceType?: string;
  type?: string;
}

interface ApiServiceResponse {
  status: string;
  date: string;
  data: ApiService[];
  total?: number;
  pageNo?: number;
  pageSize?: number;
}

interface BookingPaymentData {
  roomId: number;
  roomInfo: {
    id: number;
    name: string;
    image: string;
    price: number;
    capacity: number;
    checkInTime: string;
    checkOutTime: string;
    roomSize: string;
    bedType: string;
    amenities: string[];
  };
  selectedServices: Service[];
  bookingForm: {
    checkInDate: string;
    checkOutDate: string;
    checkInTime: string;
    checkOutTime: string;
    guestCount: string;
    specialRequests: string;
  };
  pricing: {
    roomPrice: number;
    servicesPrice: number;
    subtotal: number;
    taxes: number;
    serviceFee: number;
    totalPrice: number;
  };
  userInfo: User;
  timestamp: string;
}

@Component({
  selector: 'app-detailroom',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detailroom.component.html',
  styleUrl: './detailroom.component.css'
})
export class DetailroomComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ===== API ENDPOINTS - CẬP NHẬT CHO HOTEL-SERVICES =====
  private baseApiUrl = 'http://localhost:8080/api/v1';
  private getRoomByIdApi = 'http://localhost:8080/api/v1/rooms';
  private getServicesApi = 'http://localhost:8080/api/v1/hotel-services';
  private getServiceByIdApi = 'http://localhost:8080/api/v1/hotel-services';

  // ===== LOCAL STORAGE KEYS - CẬP NHẬT CHO HOTEL-SERVICES =====
  private readonly STORAGE_KEYS = {
    ROOMS_BY_ID: 'hotel_rooms_by_id',
    SELECTED_ROOM: 'hotel_selected_room',
    USER_DATA: 'hotel_user_data',
    FAVORITE_ROOMS: 'hotel_favorite_rooms',
    SERVICES_CACHE: 'hotel_services_cache',
    SELECTED_SERVICES: 'hotel_selected_services',
    BOOKING_DATA: 'hotel_booking_data',
    BOOKING_PAYMENT_DATA: 'hotel_booking_payment_data'
  };

  // ===== AUTH TOKEN METHOD =====
  private getAuthToken(): string | null {
    try {
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('authToken') || 
                   localStorage.getItem('accessToken') ||
                   localStorage.getItem('jwt_token');
      
      if (token) {
        console.log('🔑 Found auth token in localStorage');
        return token;
      }
      
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.token || user.accessToken) {
          return user.token || user.accessToken;
        }
      }
      
      console.warn('⚠️ No auth token found');
      return null;
    } catch (error) {
      console.error('❌ Lỗi khi lấy auth token:', error);
      return null;
    }
  }

  // ===== TEST API METHODS =====
  testHotelServicesDirectly() {
    console.log('🧪 ===== TEST HOTEL-SERVICES API TRỰC TIẾP =====');
    
    const testUrl = 'http://localhost:8080/api/v1/hotel-services';
    console.log('🧪 Test URL:', testUrl);
    
    const token = this.getAuthToken();
    console.log('🧪 Token:', token ? 'Có token' : 'Không có token');
    
    fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log('🧪 Fetch Response Status:', response.status);
      console.log('🧪 Fetch Response OK:', response.ok);
      console.log('🧪 Fetch Response Headers:', response.headers);
      return response.json();
    })
    .then(data => {
      console.log('🧪 ===== FETCH RESPONSE DATA =====');
      console.log('🧪 Fetch Response Data:', data);
      console.log('🧪 Data Type:', typeof data);
      console.log('🧪 Data Keys:', Object.keys(data));
      
      if (data.data) {
        console.log('🧪 Services Array:', data.data);
        console.log('🧪 Services Count:', data.data.length);
      }
    })
    .catch(error => {
      console.error('🧪 ===== FETCH ERROR =====');
      console.error('🧪 Fetch Error:', error);
    });
  }

  testAxiosDirectly() {
    console.log('🧪 === AXIOS TEST TRỰC TIẾP ===');
    
    const url = 'http://localhost:8080/api/v1/hotel-services';
    const token = this.getAuthToken();
    
    console.log('🧪 URL:', url);
    console.log('🧪 Token:', token ? 'Có' : 'Không');
    
    axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log('🧪 === AXIOS SUCCESS ===');
      console.log('🧪 Response:', response);
      console.log('🧪 Data:', response.data);
    })
    .catch(error => {
      console.log('🧪 === AXIOS ERROR ===');
      console.log('🧪 Error:', error);
      console.log('🧪 Response:', error.response);
    });
  }

  // ===== FIX 403 METHODS =====
  clearServicesCache() {
    console.log('🗑️ === CLEARING SERVICES CACHE ===');
    try {
      localStorage.removeItem(this.STORAGE_KEYS.SERVICES_CACHE);
      console.log('🗑️ Đã xóa services cache');
      
      this.allServices.set([]);
      console.log('🗑️ Đã clear allServices signal');
      
      this.forceMockServices();
    } catch (error) {
      console.error('❌ Lỗi khi clear cache:', error);
    }
  }

  forceMockServices() {
    console.log('🔧 === FORCE LOADING MOCK SERVICES ===');
    console.log('🔧 Mock data có:', this.mockHotelServicesData.length, 'items');
    
    const transformedMockServices = this.transformServicesData(this.mockHotelServicesData);
    console.log('🔧 Transformed mock services:', transformedMockServices);
    
    this.allServices.set(transformedMockServices);
    this.saveServicesToCache(transformedMockServices);
    this.servicesLoading.set(false);
    
    console.log('✅ Đã force load mock services thành công!');
    console.log('✅ Current allServices count:', this.allServices().length);
  }

  manualTestServices() {
    console.log('🔧 === MANUAL TEST SERVICES BUTTON CLICKED ===');
    console.log('🔧 Current allServices:', this.allServices());
    console.log('🔧 servicesLoading:', this.servicesLoading());
    console.log('🔧 servicesError:', this.servicesError());
    
    // Clear everything
    this.clearServicesCache();
    
    console.log('🔧 === ĐÃ CLEAR CACHE, SẼ LOAD MOCK DATA ===');
  }



  // ===== SIGNALS =====
  mobileMenuOpen = signal(false);
  userMenuOpen = signal(false);
  currentImageIndex = signal(0);
  isLoading = signal(false);
  error = signal<string | null>(null);
  roomId = signal<number | null>(null);
  servicesLoading = signal(false);
  servicesError = signal<string | null>(null);
  lightboxOpen = signal(false);
  lightboxImageIndex = signal(0);
  bookingModalOpen = signal(false);
  servicesModalOpen = signal(false);
  showMapDialog = signal(false);
  showDateWarning = signal(false);
  checkInDate = signal('');
  checkOutDate = signal('');
  guestCount = signal('2');
  selectedCategory = signal('all');
  selectedServices = signal<Service[]>([]);
  tempServices = signal<Service[]>([]);
  allServices = signal<Service[]>([]);
  currentUser = signal<User | null>(null);

  // ===== BOOKING FORM DATA =====
  bookingForm = {
    checkInDate: '',
    checkOutDate: '',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    guestCount: '2',
    specialRequests: ''
  };

  // ===== SERVICE CATEGORIES - CẬP NHẬT CHO HOTEL-SERVICES =====
  serviceCategories = [
    { value: 'all', label: 'Tất cả dịch vụ' },
    { value: 'food', label: 'Ăn uống' },
    { value: 'spa', label: 'Spa & Wellness' }, 
    { value: 'transport', label: 'Vận chuyển' },
    { value: 'laundry', label: 'Giặt là' },
    { value: 'other', label: 'Dịch vụ khác' }
  ];

  // ===== MOCK DATA =====
  private mockRoomData: Room = {
    id: 900,
    name: 'Phòng Garden Villa Premium',
    capacity: 4,
    rating: 5.0,
    priceRange: '4,000,000 - 6,000,000',
    price: 5000000,
    minPrice: 4000000,
    maxPrice: 6000000,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    isFavorite: false,
    bedCount: 2,
    category: 'suite',
    description: 'Phòng Garden Villa là sự kết hợp hoàn hảo giữa thiên nhiên và sang trọng với tầm nhìn tuyệt đẹp ra khu vườn xanh mát.',
    detailDescription: 'Suite Garden Villa rộng rãi với không gian sinh hoạt riêng biệt, phòng khách và phòng ngủ được thiết kế sang trọng.',
    amenities: [
      'Wi-Fi miễn phí tốc độ cao',
      'Điều hòa không khí thông minh',
      'TV màn hình phẳng 55 inch',
      'Phòng tắm riêng với bồn tắm Jacuzzi',
      'Bếp nhỏ đầy đủ thiết bị',
      'Ban công riêng với view vườn',
      'Minibar premium',
      'Két sắt điện tử',
      'Máy pha cà phê Nespresso',
      'Áo choàng tắm cao cấp'
    ],
    area: 65,
    view: 'Hướng vườn',
    type: 'Garden Villa Suite',
    roomSize: '65m²',
    bedType: 'Giường đôi King',
    smokingPolicy: 'Không hút thuốc',
    petPolicy: 'Không cho phép thú cưng',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    cancellationPolicy: 'Miễn phí hủy trước 24 giờ',
    maxOccupancy: 4,
    wifiIncluded: true,
    breakfastIncluded: false,
    airConditioning: true,
    miniBar: true,
    roomService: true,
    laundryService: true,
    conciergeService: true,
    fitnessCenter: true,
    swimmingPool: true,
    spa: true,
    restaurant: true,
    businessCenter: true,
    meetingRooms: false,
    airport_shuttle: true,
    parking: true,
    location: {
      floor: 5,
      building: 'Tòa nhà Garden',
      nearbyAttractions: [
        'Bãi biển Nha Trang - 500m',
        'Trung tâm mua sắm - 1km',
        'Chợ đêm - 800m',
        'Vinpearland - 2km'
      ]
    },
    availability: {
      available: true,
      nextAvailableDate: '',
      bookedDates: []
    },
    pricing: {
      basePrice: 5000000,
      taxes: 500000,
      serviceFee: 250000,
      totalPrice: 5750000,
      currency: 'VND',
      pricePerNight: 5000000,
      weekendSurcharge: 1000000,
      holidaySurcharge: 1500000
    },
    facilities: [
      'Hồ bơi ngoài trời',
      'Trung tâm thể dục',
      'Spa & Wellness',
      'Nhà hàng',
      'Bar/Lounge',
      'Dịch vụ phòng 24/7',
      'Trung tâm business',
      'Dịch vụ giặt là',
      'Đưa đón sân bay',
      'Bãi đậu xe',
      'Concierge'
    ],
    policies: [
      'Check-in: 14:00 - 00:00',
      'Check-out: 06:00 - 12:00',
      'Miễn phí hủy phòng trước 24 giờ',
      'Không hút thuốc trong phòng',
      'Không cho phép thú cưng',
      'Trẻ em dưới 12 tuổi được miễn phí',
      'Yêu cầu đặt cọc bằng thẻ tín dụng',
      'Xuất trình CMND/Passport khi check-in'
    ],
    reviews: [
      {
        id: 1,
        userName: 'Nguyễn Minh Anh',
        avatar: 'https://i.pravatar.cc/150?img=1',
        rating: 5,
        comment: 'Phòng Garden Villa thật sự tuyệt vời! Không gian rộng rãi, sạch sẽ và view vườn rất đẹp.',
        createdAt: '2 ngày trước'
      },
      {
        id: 2,
        userName: 'Trần Văn Bình',
        avatar: 'https://i.pravatar.cc/150?img=2',
        rating: 5,
        comment: 'Phòng đẹp, tiện nghi đầy đủ. Jacuzzi rất thích, bồn tắm lớn.',
        createdAt: '1 tuần trước'
      }
    ]
  };

  // ===== MOCK HOTEL SERVICES DATA =====
  private mockHotelServicesData = [
    { id: 1, name: 'Bữa sáng', price: 100000, description: 'Buffet sáng tại nhà hàng', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
    { id: 2, name: 'Giặt ủi', price: 50000, description: 'Dịch vụ giặt là chuyên nghiệp', image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
    { id: 3, name: 'Spa', price: 300000, description: 'Thư giãn cơ thể toàn diện', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
    { id: 4, name: 'Xe đưa đón', price: 200000, description: 'Đưa đón sân bay 2 chiều', image: 'https://images.unsplash.com/photo-1583301284852-f72f359cd88b?w=600&q=80' },
    { id: 5, name: 'Bữa tối', price: 150000, description: 'Set menu buổi tối cao cấp', image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&q=80' },
    { id: 6, name: 'Trà chiều', price: 90000, description: 'Trà chiều theo phong cách Anh', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80' },
    { id: 7, name: 'Thuê xe đạp', price: 30000, description: 'Xe đạp tham quan khuôn viên', image: 'https://images.unsplash.com/photo-1532274402917-5aadf881bdf8?w=600&q=80' }
  ];

  // ===== SERVICE IMAGE MAP =====
  private serviceImageMap: { [key: string]: string[] } = {
    'food': [
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    ],
    'spa': [
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    ],
    'transport': [
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    ],
    'laundry': [
      'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    ],
    'other': [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    ]
  };

  hotelImages: HotelImage[] = [
    { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', name: 'Phòng ngủ chính' },
    { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', name: 'Phòng tắm' },
    { url: 'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', name: 'Ban công' },
    { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', name: 'Phòng khách' }
  ];

  // ===== COMPUTED PROPERTIES =====
  currentRoom = signal<Room>(this.mockRoomData);

  filteredServices = computed(() => {
    const category = this.selectedCategory();
    let services = category === 'all' ? this.allServices() : this.allServices().filter(service => service.category === category);

    return services.map(service => ({
      ...service,
      image: this.getRandomServiceImage(service.category)
    }));
  });

  // ===== CONSTRUCTOR =====
  constructor() {
    axios.defaults.baseURL = this.baseApiUrl;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.timeout = 10000;

    axios.interceptors.request.use(
      (config) => {
        console.log('🌐 DETAIL - Đang gọi API:', config.url);
        
        const token = this.getAuthToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
          console.log('🔑 DETAIL - Đã thêm Authorization header');
        } else {
          console.warn('⚠️ DETAIL - Không có token để authenticate');
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => {
        console.log('✅ DETAIL - API thành công:', response.config.url);
        console.log('📊 DETAIL - Response data:', response.data);
        return response;
      },
      (error) => {
        console.error('❌ DETAIL - Lỗi API:', error.config?.url);
        if (error.response) {
          console.error('Mã lỗi:', error.response.status);
          console.error('Dữ liệu lỗi:', error.response.data);
          
          if (error.response.status === 401 || error.response.status === 403) {
            console.error('🚫 Token không hợp lệ hoặc hết hạn');
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ===== LIFECYCLE METHODS =====
  ngOnInit() {
    console.log('🚀 ===== DETAIL COMPONENT NGONINIT BẮT ĐẦU =====');
    
    this.loadFavoriteRoomsFromStorage();
    this.loadSelectedServicesFromStorage();
    
    console.log('🧪 === SẮP TEST API HOTEL-SERVICES ===');
    setTimeout(() => {
      this.testHotelServicesDirectly();
    }, 1000);
    
    console.log('🛎️ === SẮP FORCE LOAD SERVICES ===');
    setTimeout(() => {
      console.log('🛎️ ĐANG THỰC THI loadServices()...');
      this.loadServices();
    }, 2000);
    
    this.loadRoomData();
    this.loadUserFromStorage();
    
    console.log('🚀 ===== NGONINIT KẾT THÚC =====');
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  loadUserFromStorage() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.currentUser.set(JSON.parse(storedUser));
      } catch (e) {
        console.error('Lỗi parse user:', e);
        this.currentUser.set(null);
      }
    } else {
      this.currentUser.set(null);
    }
  }


  // ===== FEEDBACK METHODS =====
  private getFeedbackByRoomId(roomId: number) {
    const apiUrl = `http://localhost:8080/api/v1/feedbacks/room/${roomId}`;
    axios.get(apiUrl)
      .then(response => {
        const feedbacks = response.data?.data || [];
        const reviews: Review[] = feedbacks.map((fb: any) => ({
          id: fb.id,
          userName: fb.userName,
          rating: fb.rating,
          comment: fb.comment,
          createdAt: new Date(fb.createdAt).toLocaleDateString('vi-VN')
        }));
        const room = this.currentRoom();
        room.reviews = reviews;
        this.currentRoom.set({...room});
      })
      .catch(error => {
        console.error('❌ Lỗi khi lấy feedback:', error);
      });
  }

  // ===== ROOM DATA METHODS =====
  private loadRoomData() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        const roomId = parseInt(id, 10);
        console.log('🏨 Room ID từ URL:', roomId);
        this.roomId.set(roomId);
        this.loadRoomById(roomId);
      }
    });
  }

  private loadRoomById(id: number) {
    console.log('🔍 Đang tìm thông tin phòng ID:', id);

    const roomFromStorage = this.getRoomFromStorage(id);
    if (roomFromStorage) {
      console.log('💾 Tìm thấy phòng trong localStorage:', roomFromStorage);
      this.setRoomData(roomFromStorage);
      return;
    }

    this.fetchRoomFromApi(id);
    this.getFeedbackByRoomId(id);
  }

  private getRoomFromStorage(roomId: number): Room | null {
    try {
      const storedRoomsById = localStorage.getItem(this.STORAGE_KEYS.ROOMS_BY_ID);
      if (storedRoomsById) {
        const roomsById = JSON.parse(storedRoomsById);
        const room = roomsById[roomId];
        if (room) {
          console.log('✅ Tìm thấy room ID', roomId, 'trong', this.STORAGE_KEYS.ROOMS_BY_ID + ':', room);
          return room;
        }
      }
    } catch (error) {
      console.error('❌ Lỗi khi đọc rooms từ localStorage:', error);
    }
    return null;
  }

  private fetchRoomFromApi(id: number) {
    this.isLoading.set(true);
    this.error.set(null);

    const apiUrl = `${this.getRoomByIdApi}/${id}`;

    axios.get(apiUrl)
      .then((response) => {
        if (response.data && response.data.data) {
          const roomData = this.transformRoomData(response.data.data);
          this.setRoomData(roomData);
          this.saveRoomToStorage(roomData);
        } else {
          this.error.set('Không tìm thấy thông tin phòng');
        }
      })
      .catch((error) => {
        console.error('❌ Lỗi khi gọi API room detail:', error);
        this.error.set('Không thể tải thông tin phòng');
        this.setRoomData(this.mockRoomData);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  private setRoomData(room: Room) {
    console.log('🏨 Đã set room data cho ID:', room.id, room);
    this.currentRoom.set(room);
  }

  private saveRoomToStorage(room: Room) {
    try {
      localStorage.setItem(this.STORAGE_KEYS.SELECTED_ROOM, JSON.stringify(room));

      const storedRoomsById = localStorage.getItem(this.STORAGE_KEYS.ROOMS_BY_ID);
      let roomsById: { [key: number]: Room } = {};
      if (storedRoomsById) {
        roomsById = JSON.parse(storedRoomsById);
      }
      roomsById[room.id] = room;
      localStorage.setItem(this.STORAGE_KEYS.ROOMS_BY_ID, JSON.stringify(roomsById));

    } catch (error) {
      console.error('❌ Lỗi khi lưu room vào localStorage:', error);
    }
  }

  private transformRoomData(apiRoom: any): Room {
    return {
      id: apiRoom.id,
      name: apiRoom.roomName || apiRoom.name,
      capacity: apiRoom.capacity || 2,
      rating: apiRoom.rating || 4.5,
      priceRange: this.formatPriceRange(apiRoom.basePrice),
      price: apiRoom.basePrice,
      description: apiRoom.description,
      image: this.getRandomRoomImage(),
      gallery: this.getRandomRoomImages(5),
      featured: apiRoom.featured || false,
      isFavorite: this.isRoomFavorite(apiRoom.id),
      bedCount: apiRoom.bedCount || 1,
      category: this.mapRoomCategory(apiRoom.roomType),
      roomNumber: apiRoom.roomNumber,
      status: apiRoom.status,
      reviews: this.mockRoomData.reviews,
      amenities: this.mockRoomData.amenities,
      area: this.mockRoomData.area,
      view: this.mockRoomData.view,
      type: apiRoom.roomType,
      detailDescription: this.mockRoomData.detailDescription,
      facilities: this.mockRoomData.facilities,
      policies: this.mockRoomData.policies,
      checkInTime: this.mockRoomData.checkInTime,
      checkOutTime: this.mockRoomData.checkOutTime,
      cancellationPolicy: this.mockRoomData.cancellationPolicy,
      maxOccupancy: this.mockRoomData.maxOccupancy,
      roomSize: this.mockRoomData.roomSize,
      bedType: this.mockRoomData.bedType,
      smokingPolicy: this.mockRoomData.smokingPolicy,
      petPolicy: this.mockRoomData.petPolicy,
      wifiIncluded: this.mockRoomData.wifiIncluded,
      breakfastIncluded: this.mockRoomData.breakfastIncluded,
      airConditioning: this.mockRoomData.airConditioning,
      miniBar: this.mockRoomData.miniBar,
      roomService: this.mockRoomData.roomService,
      laundryService: this.mockRoomData.laundryService,
      conciergeService: this.mockRoomData.conciergeService,
      fitnessCenter: this.mockRoomData.fitnessCenter,
      swimmingPool: this.mockRoomData.swimmingPool,
      spa: this.mockRoomData.spa,
      restaurant: this.mockRoomData.restaurant,
      businessCenter: this.mockRoomData.businessCenter,
      meetingRooms: this.mockRoomData.meetingRooms,
      airport_shuttle: this.mockRoomData.airport_shuttle,
      parking: this.mockRoomData.parking,
      location: this.mockRoomData.location,
      availability: this.mockRoomData.availability,
      pricing: {
        basePrice: apiRoom.basePrice || 0,
        taxes: (apiRoom.basePrice || 0) * 0.1,
        serviceFee: (apiRoom.basePrice || 0) * 0.05,
        totalPrice: (apiRoom.basePrice || 0) * 1.15,
        currency: 'VND',
        pricePerNight: apiRoom.basePrice || 0,
        weekendSurcharge: (apiRoom.basePrice || 0) * 0.2,
        holidaySurcharge: (apiRoom.basePrice || 0) * 0.3
      }
    };
  }

  // ===== SERVICES METHODS - FIXED FOR 403 =====
  private loadServices() {
    console.log('🛎️ ==================== BẮT ĐẦU LOAD SERVICES ====================');
    console.log('🛎️ getServicesApi URL:', this.getServicesApi);
    
    this.servicesLoading.set(true);
    this.servicesError.set(null);

    console.log('🛎️ === KIỂM TRA CACHE ===');
    const cachedServices = this.getServicesFromCache();
    console.log('🛎️ Cached services count:', cachedServices.length);
    
    // Kiểm tra cache có hợp lệ không (phải có name và price)
    const validCache = cachedServices.length > 0 && 
                      cachedServices.every(s => s.name && s.price);
    
    if (validCache) {
      console.log('💾 SỬ DỤNG CACHE SERVICES HỢP LỆ:', cachedServices);
      this.allServices.set(cachedServices);
      this.servicesLoading.set(false);
      return;
    } else if (cachedServices.length > 0) {
      console.log('⚠️ CACHE KHÔNG HỢP LỆ (thiếu name/price), clear và dùng mock');
      this.clearServicesCache();
      return;
    }

    console.log('🛎️ === KHÔNG CÓ CACHE HỢP LỆ, THỬ GỌI API ===');
    
    // Try API, nếu 403 thì dùng mock ngay
    this.fetchServicesFromApi()
      .catch(() => {
        console.log('🛎️ === API FAILED, DÙNG MOCK DATA ===');
        this.forceMockServices();
      });
    
    console.log('🛎️ ==================== KẾT THÚC LOAD SERVICES ====================');
  }

  private fetchServicesFromApi(): Promise<void> {
    const apiUrl = `${this.getServicesApi}?pageSize=100&pageNo=1`;
    
    console.log('🌐 ===== BẮT ĐẦU GỌI HOTEL-SERVICES API =====');
    console.log('🌐 DETAIL - Đang gọi API hotel-services:', apiUrl);

    return axios.get(apiUrl)
      .then((response) => {
        console.log('✅ ===== HOTEL-SERVICES API THÀNH CÔNG =====');
        console.log('✅ DETAIL - Hotel Services API thành công:', apiUrl);
        console.log('📊 DETAIL - Full Response:', response);
        console.log('📊 DETAIL - Response Data:', response.data);
        console.log('📊 DETAIL - Response Status:', response.status);
        
        let servicesData = null;
        
        if (response.data && Array.isArray(response.data)) {
          servicesData = response.data;
          console.log('📊 DETAIL - Services data từ response.data (array):', servicesData);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          servicesData = response.data.data;
          console.log('📊 DETAIL - Services data từ response.data.data:', servicesData);
        } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
          servicesData = response.data.content;
          console.log('📊 DETAIL - Services data từ response.data.content:', servicesData);
        }
        
        if (servicesData && servicesData.length > 0) {
          console.log('🛎️ Tìm thấy services data:', servicesData.length, 'items');
          console.log('🛎️ First service:', servicesData[0]);
          
          const transformedServices = this.transformServicesData(servicesData);
          this.allServices.set(transformedServices);
          this.saveServicesToCache(transformedServices);
          console.log('🛎️ ===== ĐÃ SET SERVICES THÀNH CÔNG =====');
          console.log('🛎️ Transformed services count:', transformedServices.length);
          console.log('🛎️ Final services:', transformedServices);
        } else {
          console.warn('⚠️ ===== RESPONSE STRUCTURE KHÔNG ĐÚNG =====');
          console.warn('⚠️ Expected: response.data.data (array)');
          console.warn('⚠️ Actual response.data:', response.data);
          this.allServices.set([]);
        }
      })
      .catch((error) => {
        console.error('❌ ===== HOTEL-SERVICES API LỖI =====');
        console.error('❌ DETAIL - Lỗi khi gọi API hotel-services:', error);
        console.error('❌ DETAIL - Error response:', error.response);
        console.error('❌ DETAIL - Error status:', error.response?.status);
        console.error('❌ DETAIL - Error data:', error.response?.data);
        
        if (error.response?.status === 403) {
          console.error('🚫 403 FORBIDDEN - SẼ DÙNG MOCK DATA');
          this.servicesError.set('API bị từ chối truy cập. Sử dụng dữ liệu mẫu.');
          
          // Throw để trigger catch trong loadServices
          throw new Error('403 Forbidden');
        } else if (error.response?.status === 401) {
          this.servicesError.set('Token hết hạn. Vui lòng đăng nhập lại.');
          console.error('🚫 401 Unauthorized - Token không hợp lệ cho hotel-services');
          throw error;
        } else {
          this.servicesError.set('Không thể tải danh sách dịch vụ khách sạn');
          throw error;
        }
        
        this.allServices.set([]);
      })
      .finally(() => {
        console.log('🛎️ ===== KẾT THÚC GỌI HOTEL-SERVICES API =====');
        this.servicesLoading.set(false);
      });
  }

  private transformServicesData(apiServices: any[]): Service[] {
    console.log('🔄 Raw API services (hotel-services):', apiServices);

    return apiServices.map(apiService => {
      console.log('🔄 Processing service:', apiService);
      console.log('🔄 Service properties:', Object.keys(apiService));

      const name = apiService.name || apiService.serviceName || apiService.title || 'Unnamed Service';
      const price = apiService.price || apiService.cost || apiService.amount || 0;
      const description = apiService.description || apiService.desc || '';
      const image = apiService.image || apiService.imageUrl || apiService.photo || '';

      let category = 'other';
      
      if (apiService.category || apiService.serviceType || apiService.type) {
        category = this.mapServiceCategory(apiService.category || apiService.serviceType || apiService.type || 'general');
      } else {
        category = this.autoDetectServiceCategory(name);
      }
      
      console.log('🔄 Transformed:', { name, price, category, description });

      return {
        id: apiService.id,
        name: name,
        price: price,
        description: description,
        image: image || this.getRandomServiceImage(category),
        category: category,
        quantity: 0
      };
    });
  }

  private mapServiceCategory(apiCategory: string): string {
    const categoryMap: { [key: string]: string } = {
      'FOOD': 'food',
      'SPA': 'spa',
      'TRANSPORT': 'transport',
      'LAUNDRY': 'laundry',
      'ROOM_SERVICE': 'room-service',
      'MINIBAR': 'minibar',
      'MASSAGE': 'massage',
      'ENTERTAINMENT': 'entertainment',
      'BUSINESS': 'business',
      'OTHER': 'other'
    };

    return categoryMap[apiCategory.toUpperCase()] || 'other';
  }

  private autoDetectServiceCategory(serviceName: string): string {
    const name = serviceName.toLowerCase();
    
    if (name.includes('bữa sáng') || name.includes('buffet') || name.includes('bữa tối') || name.includes('trà chiều')) {
      return 'food';
    }
    if (name.includes('giặt') || name.includes('ủi')) {
      return 'laundry';
    }
    if (name.includes('spa') || name.includes('massage')) {
      return 'spa';
    }
    if (name.includes('xe') || name.includes('đưa đón') || name.includes('thuê xe')) {
      return 'transport';
    }
    
    return 'other';
  }

  private getRandomServiceImage(category: string): string {
    const images = this.serviceImageMap[category] || this.serviceImageMap['other'];
    return images[Math.floor(Math.random() * images.length)];
  }

  private getServicesFromCache(): Service[] {
    try {
      const cached = localStorage.getItem(this.STORAGE_KEYS.SERVICES_CACHE);
      if (cached) {
        const services = JSON.parse(cached);
        console.log('💾 Load services từ cache:', services.length);
        return services;
      }
    } catch (error) {
      console.error('❌ Lỗi khi đọc services từ cache:', error);
    }
    return [];
  }

  private saveServicesToCache(services: Service[]) {
    try {
      localStorage.setItem(this.STORAGE_KEYS.SERVICES_CACHE, JSON.stringify(services));
      console.log('💾 Đã lưu services vào localStorage');
    } catch (error) {
      console.error('❌ Lỗi khi lưu services vào cache:', error);
    }
  }

  // ===== FAVORITES METHODS =====
  private loadFavoriteRoomsFromStorage() {
    try {
      const favoriteRooms = localStorage.getItem(this.STORAGE_KEYS.FAVORITE_ROOMS);
      if (favoriteRooms) {
        const favorites = JSON.parse(favoriteRooms);
        console.log('💾 Đã load favorite rooms:', favorites);
      }
    } catch (error) {
      console.error('❌ Lỗi khi load favorite rooms:', error);
    }
  }

  private isRoomFavorite(roomId: number): boolean {
    try {
      const favoriteRooms = localStorage.getItem(this.STORAGE_KEYS.FAVORITE_ROOMS);
      if (favoriteRooms) {
        const favorites = JSON.parse(favoriteRooms);
        return favorites.includes(roomId);
      }
    } catch (error) {
      console.error('❌ Lỗi khi check favorite room:', error);
    }
    return false;
  }

  // ===== UTILITY METHODS =====
  private formatPriceRange(basePrice: number): string {
    if (!basePrice) return 'Liên hệ';
    const formatted = new Intl.NumberFormat('vi-VN').format(basePrice);
    return `${formatted}₫`;
  }

  private mapRoomCategory(roomType: string): string {
    const categoryMap: { [key: string]: string } = {
      'Standard': 'standard',
      'Deluxe': 'deluxe',
      'Suite': 'suite',
      'Penthouse': 'penthouse'
    };
    return categoryMap[roomType] || 'standard';
  }

  private getRandomRoomImage(): string {
    const roomImages = [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];
    return roomImages[Math.floor(Math.random() * roomImages.length)];
  }

  private getRandomRoomImages(count: number): string[] {
    const images = [];
    for (let i = 0; i < count; i++) {
      images.push(this.getRandomRoomImage());
    }
    return images;
  }




  // ===== EVENT HANDLERS =====
  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  toggleUserMenu() {
    this.userMenuOpen.set(!this.userMenuOpen());
  }

  toggleFavorite() {
    const room = this.currentRoom();
    room.isFavorite = !room.isFavorite;
    this.currentRoom.set({...room});

    try {
      const favoriteRooms = localStorage.getItem(this.STORAGE_KEYS.FAVORITE_ROOMS);
      let favorites: number[] = favoriteRooms ? JSON.parse(favoriteRooms) : [];

      if (room.isFavorite) {
        if (!favorites.includes(room.id)) {
          favorites.push(room.id);
        }
      } else {
        favorites = favorites.filter(id => id !== room.id);
      }

      localStorage.setItem(this.STORAGE_KEYS.FAVORITE_ROOMS, JSON.stringify(favorites));
    } catch (error) {
      console.error('❌ Lỗi khi update favorite:', error);
    }
  }

  shareRoom() {
    const room = this.currentRoom();
    if (navigator.share) {
      navigator.share({
        title: room.name,
        text: room.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      console.log('📋 Link đã được copy vào clipboard');
    }
  }

  // ===== GALLERY METHODS =====
  previousImage() {
    const current = this.currentImageIndex();
    const gallery = this.currentRoom().gallery;
    if (current > 0) {
      this.currentImageIndex.set(current - 1);
    }
  }

  nextImage() {
    const current = this.currentImageIndex();
    const gallery = this.currentRoom().gallery;
    if (current < gallery.length - 1) {
      this.currentImageIndex.set(current + 1);
    }
  }

  openLightbox(index: number) {
    this.lightboxImageIndex.set(index);
    this.lightboxOpen.set(true);
  }

  closeLightbox() {
    this.lightboxOpen.set(false);
  }

  previousLightboxImage() {
    const current = this.lightboxImageIndex();
    const gallery = this.currentRoom().gallery;
    if (current > 0) {
      this.lightboxImageIndex.set(current - 1);
    }
  }

  nextLightboxImage() {
    const current = this.lightboxImageIndex();
    const gallery = this.currentRoom().gallery;
    if (current < gallery.length - 1) {
      this.lightboxImageIndex.set(current + 1);
    }
  }

  // ===== SERVICES MODAL METHODS =====
  openServicesModal() {
    this.servicesModalOpen.set(true);
    this.tempServices.set([...this.selectedServices()]);
  }

  closeServicesModal() {
    this.servicesModalOpen.set(false);
    this.tempServices.set([]);
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
    console.log('🔄 Đã chọn category:', category);
  }

  getFilteredServices() {
    return this.filteredServices();
  }

  // ===== SERVICE QUANTITY METHODS =====
  increaseServiceQuantity(service: Service) {
    const tempServices = this.tempServices();
    const existingService = tempServices.find(s => s.id === service.id);

    if (existingService) {
      existingService.quantity = (existingService.quantity || 0) + 1;
    } else {
      tempServices.push({...service, quantity: 1});
    }

    this.tempServices.set([...tempServices]);
  }

  decreaseServiceQuantity(service: Service) {
    const tempServices = this.tempServices();
    const existingService = tempServices.find(s => s.id === service.id);

    if (existingService && existingService.quantity && existingService.quantity > 0) {
      existingService.quantity -= 1;
      if (existingService.quantity === 0) {
        const index = tempServices.findIndex(s => s.id === service.id);
        tempServices.splice(index, 1);
      }
    }

    this.tempServices.set([...tempServices]);
  }

  getServiceQuantity(service: Service): number {
    const tempService = this.tempServices().find(s => s.id === service.id);
    return tempService?.quantity || 0;
  }

  confirmServices() {
    this.selectedServices.set([...this.tempServices()]);
    this.saveSelectedServicesToStorage();
    this.closeServicesModal();
    console.log('✅ Đã xác nhận services:', this.selectedServices());
  }

  updateServiceQuantity(service: Service, quantity: number) {
    const services = this.selectedServices();
    const existingService = services.find(s => s.id === service.id);

    if (existingService) {
      if (quantity > 0) {
        existingService.quantity = quantity;
      } else {
        const index = services.findIndex(s => s.id === service.id);
        services.splice(index, 1);
      }
    } else if (quantity > 0) {
      services.push({...service, quantity});
    }

    this.selectedServices.set([...services]);
    this.saveSelectedServicesToStorage();
  }

  removeService(service: Service) {
    const services = this.selectedServices().filter(s => s.id !== service.id);
    this.selectedServices.set(services);
  }

  getTotalServicePrice(): number {
    return this.selectedServices().reduce((total, service) => {
      return total + (service.price * (service.quantity || 0));
    }, 0);
  }

  // ===== BOOKING METHODS =====
  openBookingModal() {
    this.bookingModalOpen.set(true);
  }

  closeBookingModal() {
    this.bookingModalOpen.set(false);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  submitBooking() {
    const bookingData = {
      room: this.currentRoom(),
      form: this.bookingForm,
      services: this.selectedServices(),
      totalPrice: this.getTotalServicePrice() + (this.currentRoom().price || 0),
      user: this.currentUser()
    };

    console.log('📝 Booking data:', bookingData);

    try {
      localStorage.setItem(this.STORAGE_KEYS.BOOKING_DATA, JSON.stringify(bookingData));
      console.log('💾 Đã lưu booking data');

      alert('Đặt phòng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');

      this.closeBookingModal();
      this.resetBookingForm();

    } catch (error) {
      console.error('❌ Lỗi khi lưu booking data:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  }

  resetBookingForm() {
    this.bookingForm = {
      checkInDate: '',
      checkOutDate: '',
      checkInTime: '14:00',
      checkOutTime: '12:00',
      guestCount: '2',
      specialRequests: ''
    };
  }

  // ===== MAP DIALOG METHODS =====
  openMapDialog() {
    this.showMapDialog.set(true);
  }

  closeMapDialog() {
    this.showMapDialog.set(false);
  }

  // ===== PRICING METHODS =====
  calculateDetailedPricing() {
    const room = this.currentRoom();
    const services = this.selectedServices();

    const roomPrice = room.price || 0;
    const servicesPrice = this.getTotalServicePrice();
    const subtotal = roomPrice + servicesPrice;

    const taxRate = 0.1;
    const serviceFeeRate = 0.05;

    const taxes = subtotal * taxRate;
    const serviceFee = subtotal * serviceFeeRate;
    const totalPrice = subtotal + taxes + serviceFee;

    return {
      roomPrice,
      servicesPrice,
      subtotal,
      taxes,
      serviceFee,
      totalPrice
    };
  }

  prepareBookingPaymentData(): BookingPaymentData {
    const room = this.currentRoom();
    const services = this.selectedServices();
    const pricing = this.calculateDetailedPricing();

    console.log('🔍 DETAIL - prepareBookingPaymentData called');
    console.log('🔍 DETAIL - this.bookingForm:', this.bookingForm);

    const bookingPaymentData = <BookingPaymentData>{
      roomId: room.id,
      roomInfo: {
        id: room.id,
        name: room.name,
        image: room.image,
        price: room.price || 0,
        capacity: room.capacity,
        checkInTime: room.checkInTime || '14:00',
        checkOutTime: room.checkOutTime || '12:00',
        roomSize: room.roomSize || '',
        bedType: room.bedType || '',
        amenities: room.amenities || []
      },
      selectedServices: services,
      bookingForm: {
        checkInDate: this.bookingForm.checkInDate,
        checkOutDate: this.bookingForm.checkOutDate,
        checkInTime: this.bookingForm.checkInTime,
        checkOutTime: this.bookingForm.checkOutTime,
        guestCount: this.bookingForm.guestCount,
        specialRequests: this.bookingForm.specialRequests
      },
      pricing,
      userInfo: this.currentUser(),
      timestamp: new Date().toISOString()
    };

    console.log('📋 DETAIL - Final bookingPaymentData:', bookingPaymentData);
    return bookingPaymentData;
  }

  proceedToPayment() {
if (!this.bookingForm.checkInDate || !this.bookingForm.checkOutDate) {
  this.showDateWarning.set(true);
  setTimeout(() => {
    this.showDateWarning.set(false);
  }, 5000);
  return;
}

    console.log('🔍 DETAIL - Current bookingForm:', this.bookingForm);

    this.closeBookingModal();

    const bookingPaymentData = this.prepareBookingPaymentData();

    console.log('💾 DETAIL - BookingPaymentData to save:', bookingPaymentData);

    try {
      localStorage.setItem(
        this.STORAGE_KEYS.BOOKING_PAYMENT_DATA,
        JSON.stringify(bookingPaymentData)
      );

      console.log('💾 Đã lưu booking payment data');
      this.router.navigate(['/bookingpayment']);

    } catch (error) {
      console.error('❌ Lỗi khi lưu booking payment data:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  }

  getGrandTotal(): number {
    return this.calculateDetailedPricing().totalPrice;
  }

  getPricingBreakdown() {
    return this.calculateDetailedPricing();
  }

  hasBookingPaymentData(): boolean {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.BOOKING_PAYMENT_DATA);
      return !!data;
    } catch (error) {
      return false;
    }
  }

  getBookingPaymentData(): BookingPaymentData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.BOOKING_PAYMENT_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Lỗi khi lấy booking payment data:', error);
      return null;
    }
  }

  clearBookingPaymentData() {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.BOOKING_PAYMENT_DATA);
      console.log('🗑️ Đã xóa booking payment data');
    } catch (error) {
      console.error('❌ Lỗi khi xóa booking payment data:', error);
    }
  }

  // ===== SELECTED SERVICES STORAGE METHODS =====
  private saveSelectedServicesToStorage() {
    try {
      localStorage.setItem(
        this.STORAGE_KEYS.SELECTED_SERVICES,
        JSON.stringify(this.selectedServices())
      );
      console.log('💾 Đã lưu selected services vào localStorage');
    } catch (error) {
      console.error('❌ Lỗi khi lưu selected services:', error);
    }
  }

  private loadSelectedServicesFromStorage() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEYS.SELECTED_SERVICES);
      if (saved) {
        const services = JSON.parse(saved);
        this.selectedServices.set(services);
        console.log('💾 Đã load selected services từ localStorage:', services);
      }
    } catch (error) {
      console.error('❌ Lỗi khi load selected services:', error);
    }
  }

  clearSelectedServices() {
    this.selectedServices.set([]);
    localStorage.removeItem(this.STORAGE_KEYS.SELECTED_SERVICES);
    console.log('🗑️ Đã xóa selected services');
  }

  // ===== HOST LISTENERS =====
  @HostListener('document:keydown.escape', ['$event'])
  onEscapePressed(event: KeyboardEvent) {
    if (this.lightboxOpen()) {
      this.closeLightbox();
    } else if (this.servicesModalOpen()) {
      this.closeServicesModal();
    } else if (this.bookingModalOpen()) {
      this.closeBookingModal();
    } else if (this.showMapDialog()) {
      this.closeMapDialog();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (this.userMenuOpen() && !target.closest('.user-menu')) {
      this.userMenuOpen.set(false);
    }
  }

  getAvatar(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  }
  closeDateWarning() {  // ← THÊM METHOD NÀY
  this.showDateWarning.set(false);
}
}