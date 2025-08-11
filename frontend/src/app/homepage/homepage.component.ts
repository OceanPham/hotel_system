import { Component, signal, computed, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import axios from 'axios';

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
  image?: string; // Có thể bỏ nếu không dùng
  images?: RoomImage[];
  imagess?: string[];
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
  // Thêm các field cho detail page
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
  reviews?: {
    totalReviews: number;
    averageRating: number;
    ratingBreakdown?: {
      cleanliness: number;
      comfort: number;
      location: number;
      service: number;
      value: number;
    };
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

interface User {
  id: number;
  username: string;
  fullName: string;  // ✅ Thêm dòng này
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  gender?: string;
  nationality?: string;
  status?: string;
}


interface ApiResponse {
  content?: any[];
  data?: any[];
  rooms?: any[];
  result?: any[];
  items?: any[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  total?: number;
  count?: number;
}
interface RoomImage {
  id?: number;
  roomId?: number;
  imageUrl: string;
  file?: File;
  isMain?: boolean;
}
@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomePageComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  // ===== URL CỦA CÁC API ENDPOINTS =====
  private baseApiUrl = 'http://localhost:8080/api/v1';
  private getAllRoomsApi = 'http://localhost:8080/api/v1/rooms';
  private searchRoomsApi = 'http://localhost:8080/api/v1/rooms/search';
  private getRoomByIdApi = 'http://localhost:8080/api/v1/rooms';

// ===== LOCAL STORAGE KEYS =====
  private readonly STORAGE_KEYS = {
    ROOMS_DATA: 'hotel_rooms_data',
    ROOMS_BY_ID: 'hotel_rooms_by_id',
    SELECTED_ROOM: 'hotel_selected_room',
    USER_DATA: 'hotel_user_data',
    SEARCH_FILTERS: 'hotel_search_filters',
    FAVORITE_ROOMS: 'hotel_favorite_rooms'
  };

  // Form signals
  roomType = signal('');
  checkInDate = signal('');
  checkOutDate = signal('');
  guestCount = signal('2');

  // Filter signals
  priceFilter = signal('');
  capacityFilter = signal('');
  ratingFilter = signal('');
  categoryFilter = signal('');

  // Data signals
  allRooms = signal<Room[]>([]);
  isLoading = signal(false);
  isSearching = signal(false);
  error = signal<string | null>(null);

  // Navigation signals
  currentFeaturedSlide = signal(0);
  currentPage = signal(1);
  itemsPerPage = signal(6);
  mobileMenuOpen = signal(false);
  showScrollTop = signal(false);
  userMenuOpen = signal(false);

  // Dialog signals
  showLogoutDialog = signal(false);
  showMapDialog = signal(false);
  showProfileDialog = signal(false);
  showBookingHistoryDialog = signal(false);

  // User data
  currentUser = signal<User | null>(null);

  // Computed signals
  featuredRooms = computed(() => {
    return this.allRooms().filter(room => room.featured);
  });

  filteredRooms = computed(() => {
    let filtered = [...this.allRooms()];

    if (this.roomType()) {
      filtered = filtered.filter(room => room.category === this.roomType());
    }

    if (this.guestCount() && this.guestCount() !== '1') {
      const guestNum = parseInt(this.guestCount());
      if (guestNum > 1) {
        filtered = filtered.filter(room => room.capacity >= guestNum);
      }
    }

    if (this.priceFilter()) {
      filtered = filtered.filter(room => {
        const price = this.extractPriceFromRoom(room);

        switch (this.priceFilter()) {
          case 'low':
            return price < 1000000;
          case 'medium':
            return price >= 1000000 && price <= 2000000;
          case 'high':
            return price > 2000000;
          default:
            return true;
        }
      });
    }

    if (this.capacityFilter()) {
      filtered = filtered.filter(room => room.capacity >= parseInt(this.capacityFilter()));
    }

    if (this.ratingFilter()) {
      filtered = filtered.filter(room => room.rating >= parseInt(this.ratingFilter()));
    }

    if (this.categoryFilter()) {
      filtered = filtered.filter(room => room.category === this.categoryFilter());
    }

    return filtered;
  });

  totalFilteredRooms = computed(() => this.filteredRooms().length);

  totalPages = computed(() =>
    Math.ceil(this.filteredRooms().length / this.itemsPerPage())
  );

  paginatedRooms = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredRooms().slice(start, end);
  });

  startItem = computed(() =>
    this.filteredRooms().length === 0 ? 0 : (this.currentPage() - 1) * this.itemsPerPage() + 1
  );

  endItem = computed(() =>
    Math.min(this.currentPage() * this.itemsPerPage(), this.filteredRooms().length)
  );

  maxFeaturedSlides = computed(() => Math.max(0, this.featuredRooms().length - 3));

  constructor(router: Router) {
    this.router = router;
    axios.defaults.baseURL = this.baseApiUrl;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.timeout = 10000;

    axios.interceptors.request.use(
      (config) => {
        console.log('🌐 Đang gọi API:', config.url);
        console.log('📝 Với parameters:', config.params);
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => {
        console.log('✅ API thành công:', response.config.url);
        console.log('📊 Response data structure:', response.data);
        return response;
      },
      (error) => {
        console.error('❌ Lỗi API:', error.config?.url);
        if (error.response) {
          console.error('Mã lỗi:', error.response.status);
          console.error('Dữ liệu lỗi:', error.response.data);
        } else if (error.request) {
          console.error('Không nhận được phản hồi:', error.request);
        } else {
          console.error('Lỗi:', error.message);
        }
        return Promise.reject(error);
      }
    );

    // ⚠️ Tránh lỗi SSR khi không có window/localStorage
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('currentUser');
      if (user) {
        try {
          this.currentUser.set(JSON.parse(user));
        } catch (e) {
          console.error('Lỗi đọc user từ localStorage:', e);
        }
      }
    }
  }

  ngOnInit() {
    this.setDefaultDates();
    this.loadUserFromStorage(); // ✅ Load user thật
    this.loadSearchFiltersFromStorage();
    this.loadFavoriteRoomsFromStorage();
    this.loadAllRooms();
  }
  loadUserFromStorage() {
    if (typeof window !== 'undefined') {
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
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.showScrollTop.set(window.pageYOffset > 300);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile-container')) {
      this.userMenuOpen.set(false);
    }
    if (!target.closest('.mobile-menu') && !target.closest('.hamburger-menu')) {
      this.mobileMenuOpen.set(false);
    }
  }
  logout(): void {
    this.authService.logout(); // gọi hàm đã có trong auth.service.ts
  }
  // ===== RANDOM IMAGE METHODS =====

  /**
   * 🖼️ GET RANDOM ROOM IMAGE
   */
  private getRandomRoomImage(): string {
    const randomImages = [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559508551-44bff1de756b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];

    const randomIndex = Math.floor(Math.random() * randomImages.length);
    return randomImages[randomIndex];
  }

  /**
   * 🖼️ GET MULTIPLE RANDOM IMAGES FOR ROOM GALLERY
   */
  private getRandomRoomImages(count: number = 5): string[] {
    const images = [];
    for (let i = 0; i < count; i++) {
      images.push(this.getRandomRoomImage());
    }
    return images;
  }

  // ===== UTILITY METHODS =====

  private extractPriceFromRoom(room: Room): number {
    if (room.pricing?.basePrice) {
      return room.pricing.basePrice;
    }

    if (room.price) {
      return room.price;
    }

    if (room.minPrice) {
      return room.minPrice;
    }

    if (room.maxPrice) {
      return room.maxPrice;
    }

    if (room.priceRange) {
      const priceStr = room.priceRange.replace(/[,.₫\s]/g, '');
      const prices = priceStr.split('-').map(p => parseInt(p)).filter(p => !isNaN(p));
      if (prices.length > 0) {
        return Math.min(...prices);
      }
    }

    return 0;
  }

  formatPrice(room: Room): string {
    const price = this.extractPriceFromRoom(room);
    if (price > 0) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price);
    }

    return room.priceRange || 'Liên hệ';
  }

  getRoomDescription(room: Room): string {
    if (room.description) {
      return room.description;
    }

    let description = `Phòng ${room.name} `;

    if (room.area) {
      description += `với diện tích ${room.area}m², `;
    }

    if (room.view) {
      description += `hướng ${room.view}, `;
    }

    description += `phù hợp cho ${room.capacity} khách`;

    if (room.amenities && room.amenities.length > 0) {
      description += `. Tiện ích: ${room.amenities.join(', ')}`;
    }

    return description;
  }

  /**
   * 🏠 NAVIGATE ĐẾN DETAIL ROOM VỚI FULL DATA
   */
  navigateToRoomDetail(room: Room, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('🏠 Chuyển đến detail room:', room);
    console.log('💰 Giá phòng:', this.formatPrice(room));
    console.log('📝 Mô tả:', this.getRoomDescription(room));

    // Lưu room data đầy đủ vào localStorage
    this.saveSelectedRoomToStorage(room);
    this.saveRoomByIdToStorage(room);

    // Navigate với room ID
    this.router.navigate(['/detailroom', room.id]);

    console.log('✅ Đã navigate đến /detailroom/' + room.id);
  }

  /**
   * 🔄 TRANSFORM API DATA TO ROOM OBJECT VỚI FULL DETAILS
   */
  private transformApiDataToRoom(apiData: any): Room {
    console.log('🔄 Transforming API data:', apiData);
    let roomImages: RoomImage[] = [];

    // Nếu API trả về mảng images
    if (Array.isArray(apiData.images)) {
      roomImages = apiData.images.map((img: any) => ({
        id: img.id,
        roomId: img.roomId || apiData.id,
        imageUrl: img.imageUrl || img.url || img.path,
        isMain: img.isMain || false
      }));
    }
    // Hoặc nếu API trả về 1 ảnh duy nhất
    else if (apiData.imageUrl || apiData.image) {
      roomImages = [{
        id: apiData.imageId,
        roomId: apiData.id,
        imageUrl: apiData.imageUrl || apiData.image,
        isMain: true
      }];
    }
    const room: Room = {
      id: apiData.id || apiData.roomId || 0,
      name: apiData.name || apiData.roomName || apiData.title || 'Phòng không tên',
      capacity: apiData.capacity || apiData.maxGuests || apiData.guests || 2,
      rating: apiData.rating || apiData.score || apiData.stars || 4.0,

      // PRICING INFORMATION
      price: apiData.price || apiData.basePrice || apiData.dailyRate,
      minPrice: apiData.minPrice || apiData.priceFrom,
      maxPrice: apiData.maxPrice || apiData.priceTo,
      priceRange: apiData.priceRange || this.generatePriceRange(apiData),

      // DESCRIPTIONS
      description: apiData.description || apiData.details || apiData.summary || apiData.overview,
      detailDescription: apiData.detailDescription || apiData.longDescription || this.generateDetailDescription(apiData),

      // IMAGES
      image: this.getFirstImageUrl(roomImages), // Giữ lại cho tương thích (nếu cần)
      images: roomImages.length > 0 ? roomImages : undefined,

      // BASIC INFO
      featured: apiData.featured || apiData.isHighlighted || false,
      isFavorite: false,
      bedCount: apiData.bedCount || apiData.beds || 1,
      category: apiData.category || apiData.type || apiData.roomType || 'standard',
      roomNumber: apiData.roomNumber || apiData.number,
      status: apiData.status || apiData.availability || 'available',

      // DETAILED INFORMATION
      amenities: apiData.amenities || apiData.facilities || apiData.features || this.generateAmenities(apiData),
      area: apiData.area || apiData.size || apiData.squareMeters || this.generateArea(apiData),
      view: apiData.view || apiData.viewType || this.generateView(apiData),
      type: apiData.type || apiData.roomType,

      // EXTENDED DETAILS FOR DETAIL PAGE
      facilities: apiData.facilities || this.generateFacilities(apiData),
      policies: apiData.policies || this.generatePolicies(),
      checkInTime: apiData.checkInTime || '14:00',
      checkOutTime: apiData.checkOutTime || '12:00',
      cancellationPolicy: apiData.cancellationPolicy || 'Miễn phí hủy trước 24 giờ',
      maxOccupancy: apiData.maxOccupancy || apiData.capacity || 2,
      roomSize: apiData.roomSize || `${apiData.area || this.generateArea(apiData)}m²`,
      bedType: apiData.bedType || this.generateBedType(apiData),
      smokingPolicy: apiData.smokingPolicy || 'Không hút thuốc',
      petPolicy: apiData.petPolicy || 'Không cho phép thú cưng',

      // SERVICES (Boolean)
      wifiIncluded: apiData.wifiIncluded !== false,
      breakfastIncluded: apiData.breakfastIncluded || false,
      airConditioning: apiData.airConditioning !== false,
      miniBar: apiData.miniBar !== false,
      roomService: apiData.roomService !== false,
      laundryService: apiData.laundryService !== false,
      conciergeService: apiData.conciergeService || false,
      fitnessCenter: apiData.fitnessCenter !== false,
      swimmingPool: apiData.swimmingPool !== false,
      spa: apiData.spa || false,
      restaurant: apiData.restaurant !== false,
      businessCenter: apiData.businessCenter || false,
      meetingRooms: apiData.meetingRooms || false,
      airport_shuttle: apiData.airport_shuttle || false,
      parking: apiData.parking !== false,

      // LOCATION INFO
      location: {
        floor: apiData.floor || Math.floor(Math.random() * 20) + 1,
        building: apiData.building || 'Tòa nhà chính',
        nearbyAttractions: apiData.nearbyAttractions || this.generateNearbyAttractions()
      },

      // AVAILABILITY
      availability: {
        available: apiData.available !== false,
        nextAvailableDate: apiData.nextAvailableDate,
        bookedDates: apiData.bookedDates || []
      },

      // REVIEWS
      reviews: {
        totalReviews: apiData.totalReviews || Math.floor(Math.random() * 200) + 50,
        averageRating: apiData.averageRating || apiData.rating || 4.0,
        ratingBreakdown: {
          cleanliness: apiData.cleanlinessRating || 4.5,
          comfort: apiData.comfortRating || 4.3,
          location: apiData.locationRating || 4.6,
          service: apiData.serviceRating || 4.4,
          value: apiData.valueRating || 4.2
        }
      },

      // DETAILED PRICING
      pricing: {
        basePrice: apiData.basePrice || apiData.price || 2000000,
        taxes: apiData.taxes || Math.round((apiData.price || 2000000) * 0.1),
        serviceFee: apiData.serviceFee || Math.round((apiData.price || 2000000) * 0.05),
        totalPrice: apiData.totalPrice || Math.round((apiData.price || 2000000) * 1.15),
        currency: 'VND',
        pricePerNight: apiData.pricePerNight || apiData.price || 2000000,
        weekendSurcharge: apiData.weekendSurcharge || Math.round((apiData.price || 2000000) * 0.2),
        holidaySurcharge: apiData.holidaySurcharge || Math.round((apiData.price || 2000000) * 0.3)
      }
    };

    console.log('✅ Transformed room với full details:', room);
    return room;
  }
  private getFirstImageUrl(images: RoomImage[]): string {
    if (!images || images.length === 0) {
      return this.getRandomRoomImage(); // Fallback nếu không có ảnh
    }
    const firstImage = images[0];
    if (firstImage.imageUrl.startsWith('http')) {
      return firstImage.imageUrl;
    }
    return `http://localhost:8080${firstImage.imageUrl.startsWith('/') ? '' : '/'}${firstImage.imageUrl}`;
  }
  /**
   * 🏗️ GENERATE METHODS FOR MISSING DATA
   */
  private generateDetailDescription(apiData: any): string {
    const roomType = apiData.category || apiData.type || 'deluxe';
    const descriptions = {
      'standard': 'Phòng Standard được thiết kế hiện đại với đầy đủ tiện nghi cơ bản. Không gian thoải mái, sạch sẽ và an toàn, phù hợp cho khách du lịch và công tác.',
      'deluxe': 'Phòng Deluxe sang trọng với thiết kế tinh tế và tầm nhìn tuyệt đẹp. Trang bị đầy đủ tiện nghi cao cấp và dịch vụ chăm sóc khách hàng chu đáo.',
      'suite': 'Suite rộng rãi với không gian sinh hoạt riêng biệt, phòng khách và phòng ngủ được thiết kế sang trọng. Lý tưởng cho kỳ nghỉ dài ngày hoặc gia đình.',
      'penthouse': 'Penthouse đẳng cấp cao nhất với tầm nhìn panorama tuyệt đẹp. Thiết kế xa hoa, dịch vụ butler riêng và các tiện ích VIP độc quyền.'
    };

    return descriptions[roomType as keyof typeof descriptions] || descriptions['deluxe'];
  }

  private generateAmenities(apiData: any): string[] {
    const baseAmenities = ['WiFi miễn phí', 'Điều hòa không khí', 'TV màn hình phẳng'];
    const category = apiData.category || apiData.type || 'deluxe';

    if (category === 'penthouse') {
      return [...baseAmenities, 'Jacuzzi riêng', 'Butler service', 'Minibar premium', 'Ban công rộng', 'Máy pha cà phê Nespresso'];
    } else if (category === 'suite') {
      return [...baseAmenities, 'Phòng khách riêng', 'Bếp nhỏ', 'Máy giặt', 'Ban công', 'Minibar'];
    } else if (category === 'deluxe') {
      return [...baseAmenities, 'Minibar', 'Két sắt', 'Máy pha cà phê', 'Ban công/Sân hiên'];
    }

    return [...baseAmenities, 'Tủ lạnh mini', 'Két sắt'];
  }

  private generateFacilities(apiData: any): string[] {
    return [
      'Hồ bơi ngoài trời',
      'Trung tâm thể dục',
      'Spa & Wellness',
      'Nhà hàng',
      'Bar/Lounge',
      'Dịch vụ phòng 24/7',
      'Trung tâm business',
      'Phòng họp',
      'Dịch vụ giặt là',
      'Đưa đón sân bay',
      'Bãi đậu xe',
      'Concierge'
    ];
  }

  private generatePolicies(): string[] {
    return [
      'Check-in: 14:00 - 00:00',
      'Check-out: 06:00 - 12:00',
      'Miễn phí hủy phòng trước 24 giờ',
      'Không hút thuốc trong phòng',
      'Không cho phép thú cưng',
      'Trẻ em dưới 12 tuổi được miễn phí',
      'Yêu cầu đặt cọc bằng thẻ tín dụng',
      'Xuất trình CMND/Passport khi check-in'
    ];
  }

  private generateArea(apiData: any): number {
    const category = apiData.category || apiData.type || 'deluxe';
    const areas = {
      'standard': Math.floor(Math.random() * 10) + 25, // 25-35m²
      'deluxe': Math.floor(Math.random() * 15) + 35,   // 35-50m²
      'suite': Math.floor(Math.random() * 25) + 50,    // 50-75m²
      'penthouse': Math.floor(Math.random() * 50) + 80 // 80-130m²
    };

    return areas[category as keyof typeof areas] || areas['deluxe'];
  }

  private generateView(apiData: any): string {
    const views = ['Hướng biển', 'Hướng thành phố', 'Hướng vườn', 'Hướng núi', 'Hướng hồ bơi'];
    return views[Math.floor(Math.random() * views.length)];
  }

  private generateBedType(apiData: any): string {
    const bedTypes = ['Giường đôi King', 'Giường đôi Queen', '2 Giường đơn', 'Giường sofa'];
    return bedTypes[Math.floor(Math.random() * bedTypes.length)];
  }

  private generateNearbyAttractions(): string[] {
    const attractions = [
      'Bãi biển Nha Trang - 500m',
      'Trung tâm mua sắm - 1km',
      'Chợ đêm - 800m',
      'Vinpearland - 2km',
      'Tháp Ponagar - 3km',
      'Sân bay Cam Ranh - 35km'
    ];

    return attractions.slice(0, Math.floor(Math.random() * 3) + 3);
  }

  private generatePriceRange(apiData: any): string {
    const price = apiData.price || apiData.basePrice || apiData.dailyRate;
    const minPrice = apiData.minPrice || apiData.priceFrom;
    const maxPrice = apiData.maxPrice || apiData.priceTo;

    if (minPrice && maxPrice) {
      return `${minPrice.toLocaleString('vi-VN')} - ${maxPrice.toLocaleString('vi-VN')}`;
    }

    if (price) {
      const min = Math.round(price * 0.9);
      const max = Math.round(price * 1.1);
      return `${min.toLocaleString('vi-VN')} - ${max.toLocaleString('vi-VN')}`;
    }

    return 'Liên hệ';
  }

  private extractRoomsFromResponse(responseData: any): Room[] {
    console.log('📊 Extracting rooms from response:', responseData);

    let roomsArray: any[] = [];

    if (Array.isArray(responseData)) {
      roomsArray = responseData;
    } else if (responseData.content && Array.isArray(responseData.content)) {
      roomsArray = responseData.content;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      roomsArray = responseData.data;
    } else if (responseData.rooms && Array.isArray(responseData.rooms)) {
      roomsArray = responseData.rooms;
    } else if (responseData.result && Array.isArray(responseData.result)) {
      roomsArray = responseData.result;
    } else if (responseData.items && Array.isArray(responseData.items)) {
      roomsArray = responseData.items;
    } else {
      console.warn('⚠️ Không tìm thấy mảng rooms trong response');
      return [];
    }

    console.log(`🔍 Tìm thấy ${roomsArray.length} phòng trong response`);

    const transformedRooms = roomsArray.map((roomData, index) => {
      console.log(`🔄 Đang transform phòng ${index + 1}:`, roomData);
      return this.transformApiDataToRoom(roomData);
    });

    console.log('✅ Hoàn thành transform, có', transformedRooms.length, 'phòng với full details');

    return transformedRooms;
  }

  // ===== LOCAL STORAGE METHODS VỚI FULL DATA =====
  private saveToLocalStorage<T>(key: string, data: T): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`💾 Đã lưu ${key} vào localStorage`);
    } catch (error) {
      console.error(`❌ Lỗi lưu ${key} vào localStorage:`, error);
    }
  }

  private getFromLocalStorage<T>(key: string): T | null {
    if (!this.isBrowser()) return null;

    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsedData = JSON.parse(data);
        console.log(`📂 Đã load ${key} từ localStorage`);
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error(`❌ Lỗi load ${key} từ localStorage:`, error);
      return null;
    }
  }


  private saveRoomsToStorage(rooms: Room[]): void {
    this.saveToLocalStorage(this.STORAGE_KEYS.ROOMS_DATA, {
      rooms,
      timestamp: Date.now(),
      total: rooms.length
    });
    this.saveRoomsByIdToStorage(rooms);
  }

  private saveRoomsByIdToStorage(rooms: Room[]): void {
    const roomsById: { [key: number]: Room } = {};
    rooms.forEach(room => {
      roomsById[room.id] = room;
    });

    this.saveToLocalStorage(this.STORAGE_KEYS.ROOMS_BY_ID, {
      roomsById,
      timestamp: Date.now(),
      total: rooms.length
    });

    console.log('🗂️ Đã lưu rooms theo ID:', Object.keys(roomsById));
  }

  private saveRoomByIdToStorage(room: Room): void {
    const existingData = this.getFromLocalStorage<any>(this.STORAGE_KEYS.ROOMS_BY_ID);
    const roomsById = existingData?.roomsById || {};

    roomsById[room.id] = room;

    this.saveToLocalStorage(this.STORAGE_KEYS.ROOMS_BY_ID, {
      roomsById,
      timestamp: Date.now(),
      total: Object.keys(roomsById).length
    });

    console.log('🏠 Đã lưu room ID', room.id, 'với full data');
  }

  saveSelectedRoomToStorage(room: Room): void {
    this.saveToLocalStorage(this.STORAGE_KEYS.SELECTED_ROOM, {
      room,
      timestamp: Date.now(),
      fromPage: 'homepage'
    });
    console.log('✅ Đã lưu thông tin phòng để chuyển sang detail page:', room);
  }

  public static getRoomById(roomId: number): Room | null {
    try {
      const data = localStorage.getItem('hotel_rooms_by_id');
      if (data) {
        const parsedData = JSON.parse(data);
        const room = parsedData.roomsById?.[roomId];
        if (room) {
          console.log('✅ Tìm thấy room ID', roomId, 'trong localStorage:', room);
          return room;
        }
      }
      console.warn('⚠️ Không tìm thấy room ID', roomId, 'trong localStorage');
      return null;
    } catch (error) {
      console.error('❌ Lỗi load room by ID:', error);
      return null;
    }
  }
  private saveSearchFiltersToStorage(): void {
    const filters = {
      roomType: this.roomType(),
      checkInDate: this.checkInDate(),
      checkOutDate: this.checkOutDate(),
      guestCount: this.guestCount(),
      priceFilter: this.priceFilter(),
      capacityFilter: this.capacityFilter(),
      ratingFilter: this.ratingFilter(),
      categoryFilter: this.categoryFilter()
    };
    this.saveToLocalStorage(this.STORAGE_KEYS.SEARCH_FILTERS, filters);
  }

  private saveFavoriteRoomsToStorage(): void {
    const favoriteRoomIds = this.allRooms()
      .filter(room => room.isFavorite)
      .map(room => room.id);
    this.saveToLocalStorage(this.STORAGE_KEYS.FAVORITE_ROOMS, favoriteRoomIds);
  }

  private saveUserDataToStorage(): void {
    this.saveToLocalStorage(this.STORAGE_KEYS.USER_DATA, this.currentUser());
  }

  private loadUserDataFromStorage(): void {
    const userData = this.getFromLocalStorage<User>(this.STORAGE_KEYS.USER_DATA);
    if (userData) {
      this.currentUser.set(userData);
    }
  }


  private loadSearchFiltersFromStorage(): void {
    const filters = this.getFromLocalStorage<any>(this.STORAGE_KEYS.SEARCH_FILTERS);
    if (filters) {
      this.roomType.set(filters.roomType || '');
      this.checkInDate.set(filters.checkInDate || '');
      this.checkOutDate.set(filters.checkOutDate || '');
      this.guestCount.set(filters.guestCount || '2');
      this.priceFilter.set(filters.priceFilter || '');
      this.capacityFilter.set(filters.capacityFilter || '');
      this.ratingFilter.set(filters.ratingFilter || '');
      this.categoryFilter.set(filters.categoryFilter || '');
    }
  }
  private loadFavoriteRoomsFromStorage(): void {
    const favoriteRoomIds = this.getFromLocalStorage<number[]>(this.STORAGE_KEYS.FAVORITE_ROOMS);
    if (favoriteRoomIds && Array.isArray(favoriteRoomIds)) {
      console.log('📂 Đã load danh sách phòng yêu thích:', favoriteRoomIds);
    }
  }

  private applyFavoriteStatusFromStorage(rooms: Room[]): Room[] {
    const favoriteRoomIds = this.getFromLocalStorage<number[]>(this.STORAGE_KEYS.FAVORITE_ROOMS);
    if (favoriteRoomIds && Array.isArray(favoriteRoomIds)) {
      return rooms.map(room => ({
        ...room,
        isFavorite: favoriteRoomIds.includes(room.id)
      }));
    }
    return rooms;
  }
  // ===== API METHODS =====

  async loadAllRooms() {
    this.isLoading.set(true);
    this.error.set(null);

    console.log('📋 Đang gọi API lấy toàn bộ phòng...');

    try {
      console.log('🔄 THỬ CÁCH 1: Gọi API không có parameters...');
      const response1 = await axios.get('/rooms');

      console.log('✅ CÁCH 1 - Response nhận được:', response1.data);
      console.log('🔍 CÁCH 1 - Response structure:', JSON.stringify(response1.data, null, 2));

      let roomsData = this.extractRoomsFromResponse(response1.data);

      if (roomsData && roomsData.length > 0) {
        roomsData = this.applyFavoriteStatusFromStorage(roomsData);
        roomsData = this.addFeaturedRoomsIfNeeded(roomsData);

        this.allRooms.set(roomsData);
        this.saveRoomsToStorage(roomsData);

        console.log('✅ CÁCH 1 - Đã load thành công', roomsData.length, 'phòng với full details');
        console.log('💰 Phòng đầu tiên - giá:', this.formatPrice(roomsData[0]));
        console.log('📝 Phòng đầu tiên - mô tả:', this.getRoomDescription(roomsData[0]));

        this.isLoading.set(false);
        return;
      }

      console.log('⚠️ CÁCH 1 - Không có dữ liệu rooms, thử cách 2...');

    } catch (error1: any) {
      console.log('❌ CÁCH 1 - Lỗi:', error1.message);
      console.log('🔄 Thử cách 2...');
    }

    try {
      console.log('🔄 THỬ CÁCH 2: Gọi API với pagination...');
      const response2 = await axios.get('/rooms', {
        params: {
          page: 0,
          size: 100,
          sort: 'id'
        }
      });

      console.log('✅ CÁCH 2 - Response nhận được:', response2.data);

      let roomsData = this.extractRoomsFromResponse(response2.data);

      if (roomsData && roomsData.length > 0) {
        roomsData = this.applyFavoriteStatusFromStorage(roomsData);
        roomsData = this.addFeaturedRoomsIfNeeded(roomsData);

        this.allRooms.set(roomsData);
        this.saveRoomsToStorage(roomsData);

        console.log('✅ CÁCH 2 - Đã load thành công', roomsData.length, 'phòng');
        this.isLoading.set(false);
        return;
      }

      console.log('⚠️ CÁCH 2 - Không có dữ liệu, thử cách 3...');

    } catch (error2: any) {
      console.log('❌ CÁCH 2 - Lỗi:', error2.message);
    }

    try {
      console.log('🔄 THỬ CÁCH 3: Gọi API với endpoint khác...');
      const response3 = await axios.get('/api/rooms');

      console.log('✅ CÁCH 3 - Response nhận được:', response3.data);

      let roomsData = this.extractRoomsFromResponse(response3.data);

      if (roomsData && roomsData.length > 0) {
        roomsData = this.applyFavoriteStatusFromStorage(roomsData);
        roomsData = this.addFeaturedRoomsIfNeeded(roomsData);

        this.allRooms.set(roomsData);
        this.saveRoomsToStorage(roomsData);

        console.log('✅ CÁCH 3 - Đã load thành công', roomsData.length, 'phòng');
        this.isLoading.set(false);
        return;
      }

    } catch (error3: any) {
      console.log('❌ CÁCH 3 - Lỗi:', error3.message);
    }

    console.log('⚠️ Tất cả API đều thất bại, sử dụng dữ liệu mẫu...');
    this.loadFallbackData();
    this.isLoading.set(false);
  }

  /**
   * 📊 GENERATE SAMPLE DATA VỚI FULL DETAILS CHO DETAIL PAGE
   */
  private generateSampleRooms(): Room[] {
    return [
      {
        id: 1,
        name: 'Phòng Deluxe Hướng Biển',
        capacity: 2,
        rating: 4.8,
        price: 2500000,
        minPrice: 2200000,
        maxPrice: 2800000,
        priceRange: '2,200,000 - 2,800,000',
        description: 'Phòng deluxe sang trọng với view biển tuyệt đẹp, trang bị đầy đủ tiện nghi hiện đại.',
        detailDescription: 'Phòng Deluxe hướng biển mang đến trải nghiệm nghỉ dưỡng tuyệt vời với tầm nhìn panorama ra biển xanh. Thiết kế hiện đại kết hợp với nội thất cao cấp, phòng được trang bị đầy đủ tiện nghi để đảm bảo sự thoải mái tối đa cho khách hàng. Ban công riêng là nơi lý tưởng để thưởng thức cà phê buổi sáng và ngắm hoàng hôn tuyệt đẹp.',
        image: this.getRandomRoomImage(),
        imagess: this.getRandomRoomImages(6),
        featured: true,
        isFavorite: false,
        bedCount: 1,
        category: 'deluxe',
        amenities: ['WiFi miễn phí', 'Điều hòa', 'TV màn hình phẳng', 'Ban công hướng biển', 'Minibar', 'Két sắt', 'Máy pha cà phê'],
        facilities: ['Hồ bơi ngoài trời', 'Spa', 'Nhà hàng', 'Room service 24/7', 'Gym', 'Business center'],
        policies: ['Check-in: 14:00', 'Check-out: 12:00', 'Miễn phí hủy trước 24h', 'Không hút thuốc', 'Trẻ em miễn phí'],
        area: 35,
        view: 'Hướng biển',
        type: 'Deluxe Ocean View',
        checkInTime: '14:00',
        checkOutTime: '12:00',
        cancellationPolicy: 'Miễn phí hủy phòng trước 24 giờ',
        maxOccupancy: 2,
        roomSize: '35m²',
        bedType: 'Giường đôi King',
        smokingPolicy: 'Không hút thuốc',
        petPolicy: 'Không cho phép thú cưng',
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
          floor: 12,
          building: 'Tòa nhà chính',
          nearbyAttractions: ['Bãi biển Nha Trang - 100m', 'Trung tâm mua sắm - 500m', 'Chợ đêm - 800m']
        },
        availability: {
          available: true,
          nextAvailableDate: undefined,
          bookedDates: []
        },
        reviews: {
          totalReviews: 156,
          averageRating: 4.8,
          ratingBreakdown: {
            cleanliness: 4.9,
            comfort: 4.7,
            location: 4.8,
            service: 4.8,
            value: 4.6
          }
        },
        pricing: {
          basePrice: 2500000,
          taxes: 250000,
          serviceFee: 125000,
          totalPrice: 2875000,
          currency: 'VND',
          pricePerNight: 2500000,
          weekendSurcharge: 500000,
          holidaySurcharge: 750000
        }
      },
      {
        id: 2,
        name: 'Suite Penthouse VIP',
        capacity: 4,
        rating: 4.9,
        price: 5500000,
        minPrice: 5000000,
        maxPrice: 6500000,
        priceRange: '5,000,000 - 6,500,000',
        description: 'Suite penthouse cao cấp nhất với không gian rộng rãi và dịch vụ VIP.',
        detailDescription: 'Suite Penthouse VIP là đỉnh cao của sự xa hoa và tinh tế. Với diện tích rộng rãi, thiết kế nội thất đẳng cấp quốc tế và tầm nhìn 360 độ tuyệt đẹp. Phòng có jacuzzi riêng, phòng khách rộng rãi và dịch vụ butler cá nhân 24/7. Đây là lựa chọn hoàn hảo cho những khách hàng VIP và các dịp đặc biệt.',
        image: this.getRandomRoomImage(),
        imagess: this.getRandomRoomImages(8),
        featured: true,
        isFavorite: false,
        bedCount: 2,
        category: 'penthouse',
        amenities: ['Jacuzzi riêng', 'Butler service 24/7', 'Phòng khách riêng', 'Bếp mini', 'Xe đưa đón sân bay', 'Champagne miễn phí'],
        facilities: ['Helipad', 'Private elevator', 'Personal chef', 'Spa riêng', 'Private pool', 'Limousine service'],
        policies: ['VIP check-in riêng', 'Late check-out miễn phí', 'Hủy linh hoạt', 'Cho phép pet (có phí)', 'Dịch vụ đặc biệt'],
        area: 85,
        view: 'Panorama 360°',
        type: 'Presidential Penthouse',
        checkInTime: 'Linh hoạt',
        checkOutTime: 'Linh hoạt',
        cancellationPolicy: 'Miễn phí hủy phòng trước 48 giờ',
        maxOccupancy: 4,
        roomSize: '85m²',
        bedType: '2 Giường đôi King',
        smokingPolicy: 'Có khu vực hút thuốc riêng',
        petPolicy: 'Cho phép thú cưng (có phí)',
        wifiIncluded: true,
        breakfastIncluded: true,
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
        meetingRooms: true,
        airport_shuttle: true,
        parking: true,
        location: {
          floor: 25,
          building: 'Penthouse Tower',
          nearbyAttractions: ['Toàn cảnh thành phố', 'Helipad riêng', 'Sky garden']
        },
        availability: {
          available: true,
          nextAvailableDate: undefined,
          bookedDates: []
        },
        reviews: {
          totalReviews: 89,
          averageRating: 4.9,
          ratingBreakdown: {
            cleanliness: 5.0,
            comfort: 4.9,
            location: 4.8,
            service: 5.0,
            value: 4.7
          }
        },
        pricing: {
          basePrice: 5500000,
          taxes: 550000,
          serviceFee: 275000,
          totalPrice: 6325000,
          currency: 'VND',
          pricePerNight: 5500000,
          weekendSurcharge: 1100000,
          holidaySurcharge: 1650000
        }
      },
      {
        id: 3,
        name: 'Phòng Suite Gia Đình',
        capacity: 6,
        rating: 4.7,
        price: 3800000,
        minPrice: 3500000,
        maxPrice: 4200000,
        priceRange: '3,500,000 - 4,200,000',
        description: 'Phòng suite gia đình rộng rãi với 2 phòng ngủ riêng biệt.',
        detailDescription: 'Suite Gia Đình được thiết kế đặc biệt cho các gia đình có trẻ em với 2 phòng ngủ riêng biệt, phòng khách rộng rãi và khu vực vui chơi an toàn cho trẻ. Phòng được trang bị đầy đủ tiện ích gia đình như bếp nhỏ, máy giặt và các vật dụng chăm sóc trẻ em. Tầm nhìn ra vườn xanh mát mang lại không gian yên tĩnh và thư giãn.',
        image: this.getRandomRoomImage(),
        imagess: this.getRandomRoomImages(7),
        featured: true,
        isFavorite: false,
        bedCount: 3,
        category: 'suite',
        amenities: ['2 phòng ngủ riêng', 'Khu vực vui chơi trẻ em', 'Bếp nhỏ', 'Máy giặt', 'Baby crib', 'Tủ lạnh lớn'],
        facilities: ['Kids club', 'Playground', 'Baby sitting', 'Family restaurant', 'Children pool', 'Game room'],
        policies: ['Family friendly', 'Baby crib miễn phí', 'Trẻ em ăn miễn phí', 'Flexible cancellation', 'Early check-in'],
        area: 65,
        view: 'Hướng vườn',
        type: 'Family Suite',
        checkInTime: '13:00',
        checkOutTime: '12:00',
        cancellationPolicy: 'Miễn phí hủy phòng trước 24 giờ',
        maxOccupancy: 6,
        roomSize: '65m²',
        bedType: '1 King + 2 Single + Sofa bed',
        smokingPolicy: 'Nghiêm cấm hút thuốc',
        petPolicy: 'Không cho phép thú cưng',
        wifiIncluded: true,
        breakfastIncluded: true,
        airConditioning: true,
        miniBar: true,
        roomService: true,
        laundryService: true,
        conciergeService: true,
        fitnessCenter: true,
        swimmingPool: true,
        spa: false,
        restaurant: true,
        businessCenter: false,
        meetingRooms: false,
        airport_shuttle: true,
        parking: true,
        location: {
          floor: 8,
          building: 'Family Wing',
          nearbyAttractions: ['Công viên trẻ em - 200m', 'Trường học quốc tế - 1km', 'Bãi biển gia đình - 300m']
        },
        availability: {
          available: true,
          nextAvailableDate: undefined,
          bookedDates: []
        },
        reviews: {
          totalReviews: 203,
          averageRating: 4.7,
          ratingBreakdown: {
            cleanliness: 4.8,
            comfort: 4.7,
            location: 4.6,
            service: 4.8,
            value: 4.6
          }
        },
        pricing: {
          basePrice: 3800000,
          taxes: 380000,
          serviceFee: 190000,
          totalPrice: 4370000,
          currency: 'VND',
          pricePerNight: 3800000,
          weekendSurcharge: 760000,
          holidaySurcharge: 1140000
        }
      },
      {
        id: 4,
        name: 'Phòng Executive Hướng Thành Phố',
        capacity: 2,
        rating: 4.6,
        price: 3100000,
        minPrice: 2800000,
        maxPrice: 3500000,
        priceRange: '2,800,000 - 3,500,000',
        description: 'Phòng executive hiện đại với view thành phố và khu vực làm việc riêng.',
        detailDescription: 'Phòng Executive được thiết kế dành riêng cho các khách hàng doanh nhân với khu vực làm việc rộng rãi, WiFi tốc độ cao và tầm nhìn tuyệt đẹp ra thành phố. Phòng có thiết kế hiện đại, tối giản với đầy đủ tiện ích công nghệ để hỗ trợ công việc. Đặc biệt, khách hàng được sử dụng miễn phí Executive Lounge với các dịch vụ cao cấp.',
        image: this.getRandomRoomImage(),
        imagess: this.getRandomRoomImages(6),
        featured: true,
        isFavorite: false,
        bedCount: 1,
        category: 'deluxe',
        amenities: ['Bàn làm việc lớn', 'WiFi tốc độ cao', 'Máy pha cà phê Nespresso', 'Két sắt laptop', 'Dịch vụ phòng 24h'],
        facilities: ['Executive lounge', 'Business center', 'Meeting rooms', 'Printer access', 'Fax service', 'Secretary service'],
        policies: ['Late check-out miễn phí', 'Express laundry', 'Priority reservation', 'Business support', 'Flexible booking'],
        area: 40,
        view: 'Hướng thành phố',
        type: 'Executive City View',
        checkInTime: '14:00',
        checkOutTime: '14:00',
        cancellationPolicy: 'Miễn phí hủy phòng trước 6 giờ',
        maxOccupancy: 2,
        roomSize: '40m²',
        bedType: 'Giường đôi Queen',
        smokingPolicy: 'Không hút thuốc',
        petPolicy: 'Không cho phép thú cưng',
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
        meetingRooms: true,
        airport_shuttle: true,
        parking: true,
        location: {
          floor: 15,
          building: 'Business Tower',
          nearbyAttractions: ['Trung tâm tài chính - 500m', 'Trung tâm hội nghị - 1km', 'Sân bay - 30km']
        },
        availability: {
          available: true,
          nextAvailableDate: undefined,
          bookedDates: []
        },
        reviews: {
          totalReviews: 134,
          averageRating: 4.6,
          ratingBreakdown: {
            cleanliness: 4.7,
            comfort: 4.5,
            location: 4.8,
            service: 4.6,
            value: 4.4
          }
        },
        pricing: {
          basePrice: 3100000,
          taxes: 310000,
          serviceFee: 155000,
          totalPrice: 3565000,
          currency: 'VND',
          pricePerNight: 3100000,
          weekendSurcharge: 620000,
          holidaySurcharge: 930000
        }
      },
      {
        id: 5,
        name: 'Phòng Deluxe Garden View',
        capacity: 3,
        rating: 4.5,
        price: 2400000,
        minPrice: 2200000,
        maxPrice: 2800000,
        priceRange: '2,200,000 - 2,800,000',
        description: 'Phòng deluxe yên tĩnh hướng vườn với không gian xanh mát.',
        detailDescription: 'Phòng Deluxe Garden View mang đến không gian yên tĩnh và thư giãn với tầm nhìn ra khu vườn nhiệt đới xanh mát. Thiết kế phòng hài hòa với thiên nhiên, sử dụng tông màu earth tone và vật liệu tự nhiên. Ban công riêng là nơi lý tưởng để thưởng thức trà chiều và cảm nhận không khí trong lành của vườn cây.',
        image: this.getRandomRoomImage(),
        imagess: this.getRandomRoomImages(5),
        featured: true,
        isFavorite: false,
        bedCount: 2,
        category: 'deluxe',
        amenities: ['Ban công hướng vườn', 'Máy pha cà phê', 'Minibar', 'Dép đi trong phòng', 'Áo choàng tắm', 'Essential oils'],
        facilities: ['Garden spa', 'Yoga deck', 'Nature walk', 'Herbal garden', 'Meditation area', 'Bird watching'],
        policies: ['Eco-friendly', 'Nature respect', 'Quiet hours', 'Garden access', 'Green practices'],
        area: 38,
        view: 'Hướng vườn',
        type: 'Deluxe Garden View',
        checkInTime: '14:00',
        checkOutTime: '12:00',
        cancellationPolicy: 'Miễn phí hủy phòng trước 24 giờ',
        maxOccupancy: 3,
        roomSize: '38m²',
        bedType: '1 King + 1 Single',
        smokingPolicy: 'Không hút thuốc',
        petPolicy: 'Không cho phép thú cưng',
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
        businessCenter: false,
        meetingRooms: false,
        airport_shuttle: true,
        parking: true,
        location: {
          floor: 6,
          building: 'Garden Wing',
          nearbyAttractions: ['Vườn nhiệt đới - 0m', 'Đường đi bộ - 100m', 'Khu spa ngoài trời - 200m']
        },
        availability: {
          available: true,
          nextAvailableDate: undefined,
          bookedDates: []
        },
        reviews: {
          totalReviews: 167,
          averageRating: 4.5,
          ratingBreakdown: {
            cleanliness: 4.6,
            comfort: 4.4,
            location: 4.3,
            service: 4.6,
            value: 4.5
          }
        },
        pricing: {
          basePrice: 2400000,
          taxes: 240000,
          serviceFee: 120000,
          totalPrice: 2760000,
          currency: 'VND',
          pricePerNight: 2400000,
          weekendSurcharge: 480000,
          holidaySurcharge: 720000
        }
      },
      {
        id: 6,
        name: 'Suite Honeymoon Romance',
        capacity: 2,
        rating: 4.9,
        price: 4800000,
        minPrice: 4500000,
        maxPrice: 5500000,
        priceRange: '4,500,000 - 5,500,000',
        description: 'Suite honeymoon lãng mạn với thiết kế ấm cúng và jacuzzi riêng.',
        detailDescription: 'Suite Honeymoon Romance được thiết kế đặc biệt cho các cặp đôi với không gian lãng mạn và riêng tư tuyệt đối. Phòng có jacuzzi hướng biển, giường tròn sang trọng và hệ thống ánh sáng mood lighting. Dịch vụ trang trí hoa hồng, champagne chào mừng và dinner riêng tư trên ban công tạo nên những kỷ niệm khó quên.',
        image: this.getRandomRoomImage(),
        imagess: this.getRandomRoomImages(6),
        featured: true,
        isFavorite: false,
        bedCount: 1,
        category: 'suite',
        amenities: ['Jacuzzi hướng biển', 'Giường tròn', 'Trang trí hoa hồng', 'Champagne miễn phí', 'Massage couple', 'Dinner riêng tư'],
        facilities: ['Private beach access', 'Couple spa', 'Romantic dining', 'Sunset cruise', 'Photography service', 'Wedding planning'],
        policies: ['Honeymoon package', 'Late check-out', 'Romance services', 'Privacy guarantee', 'Special occasions'],
        area: 50,
        view: 'Hướng biển',
        type: 'Honeymoon Suite',
        checkInTime: '12:00',
        checkOutTime: '15:00',
        cancellationPolicy: 'Miễn phí hủy phòng trước 48 giờ',
        maxOccupancy: 2,
        roomSize: '50m²',
        bedType: 'Giường tròn King',
        smokingPolicy: 'Không hút thuốc',
        petPolicy: 'Không cho phép thú cưng',
        wifiIncluded: true,
        breakfastIncluded: true,
        airConditioning: true,
        miniBar: true,
        roomService: true,
        laundryService: true,
        conciergeService: true,
        fitnessCenter: true,
        swimmingPool: true,
        spa: true,
        restaurant: true,
        businessCenter: false,
        meetingRooms: false,
        airport_shuttle: true,
        parking: true,
        location: {
          floor: 18,
          building: 'Romance Tower',
          nearbyAttractions: ['Bãi biển riêng - 50m', 'Sunset point - 100m', 'Couple spa - 200m']
        },
        availability: {
          available: true,
          nextAvailableDate: undefined,
          bookedDates: []
        },
        reviews: {
          totalReviews: 112,
          averageRating: 4.9,
          ratingBreakdown: {
            cleanliness: 4.9,
            comfort: 4.8,
            location: 4.9,
            service: 5.0,
            value: 4.7
          }
        },
        pricing: {
          basePrice: 4800000,
          taxes: 480000,
          serviceFee: 240000,
          totalPrice: 5520000,
          currency: 'VND',
          pricePerNight: 4800000,
          weekendSurcharge: 960000,
          holidaySurcharge: 1440000
        }
      },
      {
        id: 7,
        name: 'Phòng Presidential Suite',
        capacity: 8,
        rating: 5.0,
        price: 9000000,
        minPrice: 8000000,
        maxPrice: 10000000,
        priceRange: '8,000,000 - 10,000,000',
        description: 'Suite presidential đẳng cấp nhất với không gian sống xa hoa.',
        detailDescription: 'Presidential Suite là đỉnh cao của sự xa hoa và đẳng cấp với diện tích lên đến 120m². Phòng có phòng ăn riêng cho 12 người, phòng khách rộng rãi, thư viện riêng và grand piano. Dịch vụ butler 24/7, chef riêng và limousine đưa đón. Đây là lựa chọn duy nhất cho các nguyên thủ quốc gia, CEO và những khách hàng đặc biệt nhất.',
        image: this.getRandomRoomImage(),
        imagess: this.getRandomRoomImages(10),
        featured: true,
        isFavorite: false,
        bedCount: 4,
        category: 'penthouse',
        amenities: ['Butler 24/7', 'Chef riêng', 'Phòng ăn 12 chỗ', 'Grand Piano', 'Thư viện', 'Limousine', 'Helicopter transfer'],
        facilities: ['Private helipad', 'Presidential floor', 'State dining room', 'Private cinema', 'Wine cellar', 'Security team'],
        policies: ['Presidential protocol', 'Security clearance', 'Diplomatic immunity', 'State services', 'Protocol team'],
        area: 120,
        view: 'Panorama 360°',
        type: 'Presidential Suite',
        checkInTime: 'Anytime',
        checkOutTime: 'Flexible',
        cancellationPolicy: 'Flexible cancellation with diplomatic protocol',
        maxOccupancy: 8,
        roomSize: '120m²',
        bedType: '2 King + 2 Queen',
        smokingPolicy: 'Designated smoking area',
        petPolicy: 'Diplomatic pets allowed',
        wifiIncluded: true,
        breakfastIncluded: true,
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
        meetingRooms: true,
        airport_shuttle: true,
        parking: true,
        location: {
          floor: 30,
          building: 'Presidential Tower',
          nearbyAttractions: ['Government quarter - 1km', 'Embassy row - 2km', 'International airport - VIP access']
        },
        availability: {
          available: true,
          nextAvailableDate: undefined,
          bookedDates: []
        },
        reviews: {
          totalReviews: 23,
          averageRating: 5.0,
          ratingBreakdown: {
            cleanliness: 5.0,
            comfort: 5.0,
            location: 5.0,
            service: 5.0,
            value: 4.8
          }
        },
        pricing: {
          basePrice: 9000000,
          taxes: 900000,
          serviceFee: 450000,
          totalPrice: 10350000,
          currency: 'VND',
          pricePerNight: 9000000,
          weekendSurcharge: 1800000,
          holidaySurcharge: 2700000
        }
      },
      {
        id: 8,
        name: 'Phòng Standard Plus',
        capacity: 2,
        rating: 4.3,
        price: 1900000,
        minPrice: 1800000,
        maxPrice: 2200000,
        priceRange: '1,800,000 - 2,200,000',
        description: 'Phòng standard plus với thiết kế hiện đại và tiện nghi đầy đủ.',
        detailDescription: 'Phòng Standard Plus mang đến sự thoải mái và tiện nghi với mức giá hợp lý. Thiết kế hiện đại, sạch sẽ với đầy đủ tiện ích cơ bản cần thiết. Phòng có tầm nhìn ra thành phố và được trang bị các thiết bị hiện đại. Đây là lựa chọn lý tưởng cho khách du lịch và công tác ngắn ngày.',
        image: this.getRandomRoomImage(),
        imagess: this.getRandomRoomImages(4),
        featured: false,
        isFavorite: false,
        bedCount: 1,
        category: 'standard',
        amenities: ['WiFi miễn phí', 'Điều hòa', 'TV LCD', 'Tủ lạnh mini', 'Phòng tắm riêng', 'Két sắt'],
        facilities: ['Reception 24/7', 'Luggage storage', 'Tourist information', 'Taxi service', 'Breakfast room', 'Vending machines'],
        policies: ['Standard policy', 'ID required', 'No smoking', 'No pets', 'Standard cancellation'],
        area: 28,
        view: 'Hướng thành phố',
        type: 'Standard Plus',
        checkInTime: '14:00',
        checkOutTime: '12:00',
        cancellationPolicy: 'Miễn phí hủy phòng trước 24 giờ',
        maxOccupancy: 2,
        roomSize: '28m²',
        bedType: 'Giường đôi Queen',
        smokingPolicy: 'Không hút thuốc',
        petPolicy: 'Không cho phép thú cưng',
        wifiIncluded: true,
        breakfastIncluded: false,
        airConditioning: true,
        miniBar: false,
        roomService: false,
        laundryService: true,
        conciergeService: false,
        fitnessCenter: true,
        swimmingPool: true,
        spa: false,
        restaurant: true,
        businessCenter: false,
        meetingRooms: false,
        airport_shuttle: false,
        parking: true,
        location: {
          floor: 5,
          building: 'Main Building',
          nearbyAttractions: ['City center - 1km', 'Bus station - 500m', 'Shopping street - 800m']
        },
        availability: {
          available: true,
          nextAvailableDate: undefined,
          bookedDates: []
        },
        reviews: {
          totalReviews: 89,
          averageRating: 4.3,
          ratingBreakdown: {
            cleanliness: 4.4,
            comfort: 4.2,
            location: 4.4,
            service: 4.3,
            value: 4.5
          }
        },
        pricing: {
          basePrice: 1900000,
          taxes: 190000,
          serviceFee: 95000,
          totalPrice: 2185000,
          currency: 'VND',
          pricePerNight: 1900000,
          weekendSurcharge: 380000,
          holidaySurcharge: 570000
        }
      }
    ];
  }

  private loadFallbackData(): void {
    console.log('🔄 Load dữ liệu mẫu với full details cho detail page...');

    let sampleRooms = this.generateSampleRooms();
    sampleRooms = this.applyFavoriteStatusFromStorage(sampleRooms);
    sampleRooms = this.addFeaturedRoomsIfNeeded(sampleRooms);

    this.allRooms.set(sampleRooms);
    this.saveRoomsToStorage(sampleRooms);

    console.log('✅ Đã load', sampleRooms.length, 'phòng mẫu với full details');
    console.log('⭐ Featured rooms:', sampleRooms.filter(r => r.featured).length);
    console.log('💰 Giá phòng đầu tiên:', this.formatPrice(sampleRooms[0]));
    console.log('📝 Mô tả phòng đầu tiên:', this.getRoomDescription(sampleRooms[0]));
    console.log('🗂️ Room IDs available:', sampleRooms.map(r => r.id));
  }

  private addFeaturedRoomsIfNeeded(rooms: Room[]): Room[] {
    const featuredCount = rooms.filter(room => room.featured).length;

    if (featuredCount < 5) {
      console.log('⭐ Cần thêm featured rooms, hiện tại chỉ có:', featuredCount);

      const nonFeaturedRooms = rooms
        .filter(room => !room.featured)
        .sort((a, b) => b.rating - a.rating);

      const needMore = 5 - featuredCount;

      for (let i = 0; i < Math.min(needMore, nonFeaturedRooms.length); i++) {
        nonFeaturedRooms[i].featured = true;
      }

      console.log('✅ Đã thêm', Math.min(needMore, nonFeaturedRooms.length), 'phòng vào featured');
    }

    return rooms;
  }

  // ===== PAGINATION METHODS =====

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.changePage(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.changePage(this.currentPage() + 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.changePage(page);
    }
  }

  changePage(page: number, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.saveSearchFiltersToStorage();

      // Scroll đến phần rooms thay vì header
      setTimeout(() => {
        const roomsSection = document.querySelector('.all-rooms-section');
        if (roomsSection) {
          roomsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);

      console.log('📄 Chuyển sang trang:', page);
    }
  }

  getPageNumbers(): number[] {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      }
    }

    return pages;
  }

  getVisiblePages(): number[] {
    return this.getPageNumbers();
  }

  // ===== SLIDER NAVIGATION METHODS =====

  previousFeaturedSlide(): void {
    if (this.currentFeaturedSlide() > 0) {
      this.currentFeaturedSlide.set(this.currentFeaturedSlide() - 1);
    }
  }

  nextFeaturedSlide(): void {
    if (this.currentFeaturedSlide() < this.maxFeaturedSlides()) {
      this.currentFeaturedSlide.set(this.currentFeaturedSlide() + 1);
    }
  }

  // ===== UTILITY METHODS =====

  getCategoryName(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'standard': 'Tiêu chuẩn',
      'deluxe': 'Deluxe',
      'suite': 'Suite',
      'penthouse': 'Penthouse',
      'executive': 'Executive'
    };

    return categoryMap[category] || category;
  }

  getStars(rating: number): number[] {
    const fullStars = Math.floor(rating);
    return Array(fullStars).fill(0);
  }

  // ===== SEARCH AND FILTER METHODS =====

  searchRooms(): void {
    console.log('🔍 Tìm kiếm phòng với điều kiện:');
    console.log('- Loại phòng:', this.roomType());
    console.log('- Ngày vào:', this.checkInDate());
    console.log('- Ngày ra:', this.checkOutDate());
    console.log('- Số khách:', this.guestCount());

    this.isSearching.set(true);
    this.currentPage.set(1);
    this.saveSearchFiltersToStorage();

    setTimeout(() => {
      this.isSearching.set(false);

      const resultsSection = document.querySelector('.all-rooms-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }

      console.log('✅ Tìm thấy', this.filteredRooms().length, 'phòng phù hợp');
    }, 1000);
  }

  resetFilters(): void {
    console.log('🔄 Đặt lại tất cả bộ lọc');

    this.roomType.set('');
    this.priceFilter.set('');
    this.capacityFilter.set('');
    this.ratingFilter.set('');
    this.categoryFilter.set('');
    this.currentPage.set(1);

    this.saveSearchFiltersToStorage();

    console.log('✅ Đã đặt lại bộ lọc');
  }

  // ===== FAVORITE METHODS =====

  toggleFavorite(room: Room): void {
    room.isFavorite = !room.isFavorite;

    const updatedRooms = this.allRooms().map(r =>
      r.id === room.id ? { ...r, isFavorite: room.isFavorite } : r
    );
    this.allRooms.set(updatedRooms);

    this.saveFavoriteRoomsToStorage();

    console.log(room.isFavorite ? '💖 Đã thêm vào yêu thích:' : '💔 Đã bỏ khỏi yêu thích:', room.name);
  }

  // ===== DATE UTILITY =====

  private setDefaultDates(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    if (!this.checkInDate()) {
      this.checkInDate.set(formatDate(today));
    }

    if (!this.checkOutDate()) {
      this.checkOutDate.set(formatDate(tomorrow));
    }
  }

  // ===== MENU TOGGLE METHODS =====

  toggleMobileMenu(): void {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
    console.log('📱 Mobile menu:', this.mobileMenuOpen() ? 'Mở' : 'Đóng');
  }

  toggleUserMenu(): void {
    this.userMenuOpen.set(!this.userMenuOpen());
    console.log('👤 User menu:', this.userMenuOpen() ? 'Mở' : 'Đóng');
  }

  // ===== SCROLL TO TOP =====

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  getRoomMainImage(room: Room): string | null {
    // Nếu có ảnh chính (isMain) thì ưu tiên hiển thị
    const mainImage = room.images?.find(img => img.isMain);
    if (mainImage && mainImage.imageUrl) {
      // Xử lý cả đường dẫn tương đối và tuyệt đối
      if (mainImage.imageUrl.startsWith('http')) {
        return mainImage.imageUrl;
      }
      return `http://localhost:8080${mainImage.imageUrl.startsWith('/') ? '' : '/'}${mainImage.imageUrl}`;
    }

    // Nếu không có ảnh chính nhưng có ảnh khác thì lấy ảnh đầu tiên
    if (room.images && room.images.length > 0 && room.images[0].imageUrl) {
      const firstImage = room.images[0];
      if (firstImage.imageUrl.startsWith('http')) {
        return firstImage.imageUrl;
      }
      return `http://localhost:8080${firstImage.imageUrl.startsWith('/') ? '' : '/'}${firstImage.imageUrl}`;
    }

    // Trường hợp không có ảnh nào (có thể trả về ảnh mặc định hoặc null)
    return null;
  }
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

}
