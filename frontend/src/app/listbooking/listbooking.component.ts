import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { API_URL } from '../../constants';

// ==== INTERFACES ====

interface RoomImage {
  id: number;
  roomId: number;
  imageUrl: string;
  isMain: boolean;
}

interface Booking {
  id: number;
  roomNumber: string;
  fullName: string;
  checkInDate: Date;
  checkOutDate: Date;
  status: 'Confirmed' | 'Cancelled';
  roomType: 'Standard' | 'Deluxe' | 'Suite';
  totalAmount: number;
  phone?: string;
  email?: string;
  images?: RoomImage[];
  mainImageUrl?: string;
}

interface LoggedInUser {
  fullName: string;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

interface ApiResponse<T> {
  retCode: string;
  retMsg?: string | null;
  data: T;
  total?: number;
}

// ==== SERVICE ====

class BookingService {
  private apiUrl = `${API_URL}/api/bookings`;

  constructor(private http: HttpClient) {}

  getAllBookings(): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(this.apiUrl);
  }

  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

// ==== COMPONENT ====

@Component({
  selector: 'app-listbooking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './listbooking.component.html',
  styleUrls: ['./listbooking.component.css'],
})
export class ListbookingComponent implements OnInit {
  bookings = signal<Booking[]>([]);
  currentPage = signal(1);
  itemsPerPage = signal(6);
  currentBooking = signal<Booking | null>(null);
  showViewModal = signal(false);
  isLoading = signal(false);
  searchQuery = signal('');
  selectedStatus = signal<string | null>(null);
  selectedRoomType = signal<string | null>(null);
  selectedDate = signal('');
  showLogoutModal = signal(false);
  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('success');
  toastTitle = signal('');
  toastMessage = signal('');
  currentRoute = signal<string>('/dashboard');
  showUserDropdown = signal(false);
  userInfo = signal<LoggedInUser>({
    fullName: '',
  });
  authService = inject(AuthService);

  // COMPUTED PROPERTIES
  filteredBookings = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const status = this.selectedStatus();
    const roomType = this.selectedRoomType();
    const date = this.selectedDate();

    return this.bookings().filter((booking) => {
      const matchesQuery =
        !query ||
        booking.fullName.toLowerCase().includes(query) ||
        booking.roomNumber.toLowerCase().includes(query);

      const matchesStatus = !status || booking.status === status;
      const matchesRoomType = !roomType || booking.roomType === roomType;
      const matchesDate = !date || this.matchesSelectedDate(booking, date);

      return matchesQuery && matchesStatus && matchesRoomType && matchesDate;
    });
  });

  paginatedBookings = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredBookings().slice(start, start + this.itemsPerPage());
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredBookings().length / this.itemsPerPage())
  );

  private http = inject(HttpClient);
  private bookingService = new BookingService(this.http);

  constructor(private router: Router) {
    this.currentRoute.set(this.router.url || '/dashboard');
  }

  ngOnInit(): void {
    this.loadBookings();
    if (isBrowser()) {
      const local = localStorage.getItem('userProfile');
      if (local) {
        const parsed = JSON.parse(local);
        this.userInfo.set({
          fullName: parsed.fullName || '',
        });
      }
    }
  }

  matchesSelectedDate(booking: Booking, selectedDateStr: string): boolean {
    const selected = new Date(selectedDateStr);
    const checkIn = new Date(booking.checkInDate);
    return (
      selected.getFullYear() === checkIn.getFullYear() &&
      selected.getMonth() === checkIn.getMonth() &&
      selected.getDate() === checkIn.getDate()
    );
  }

  loadBookings(): void {
    this.isLoading.set(true);

    this.bookingService.getAllBookings().subscribe({
      next: (response) => {
        const data = response.data;
        if (!Array.isArray(data)) {
          console.error('Booking data is not an array:', data);
          this.bookings.set([]);
          this.isLoading.set(false);
          return;
        }

        const promises = data.map(async (booking: any) => {
          let mainImageUrl: string | undefined = undefined;

          if (booking.mainImageUrl) {
            if (booking.mainImageUrl.startsWith('http')) {
              mainImageUrl = booking.mainImageUrl;
            } else if (booking.mainImageUrl.startsWith('/uploads/')) {
              mainImageUrl = `${API_URL}${booking.mainImageUrl}`;
            } else {
              mainImageUrl = `${API_URL}/uploads/${booking.mainImageUrl}`;
            }
          }

          let totalAmount = 0;
          try {
            const result: any = await this.getTotalAmountByBookingId(
              booking.id
            ).toPromise();
            totalAmount = result?.data ?? 0;
          } catch (e) {
            console.warn(
              `Không lấy được tổng tiền cho booking ID ${booking.id}`,
              e
            );
          }

          return {
            ...booking,
            mainImageUrl,
            totalAmount,
          };
        });

        Promise.all(promises).then((bookingsWithData) => {
          this.bookings.set(bookingsWithData as any);
          this.isLoading.set(false);
        });
      },
      error: () => {
        this.isLoading.set(false);
        console.error('Lỗi khi tải danh sách booking');
      },
    });
  }

  getTotalAmountByBookingId(bookingId: number): Observable<number> {
    return this.http.get<any>(
      `${API_URL}/api/v1/payment-invoices/total-by-booking/${bookingId}`
    );
  }

  viewBooking(booking: Booking): void {
    this.currentBooking.set(booking);
    this.showViewModal.set(true);
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
  }

  previousPage(): void {
    if (this.currentPage() > 1) this.currentPage.set(this.currentPage() - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages())
      this.currentPage.set(this.currentPage() + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(current - Math.floor(maxVisible / 2), 1);
    let end = Math.min(start + maxVisible - 1, total);

    if (end - start + 1 < maxVisible) {
      start = Math.max(end - maxVisible + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN').format(new Date(date));
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }

  getStatusClass(status: 'Confirmed' | 'Cancelled'): string {
    return status.toLowerCase();
  }

  getStatusText(status: 'Confirmed' | 'Cancelled'): string {
    return status === 'Confirmed' ? 'Đã xác nhận' : 'Đã hủy';
  }

  getRoomTypeText(roomType: 'Standard' | 'Deluxe' | 'Suite'): string {
    const types = {
      Standard: 'Tiêu chuẩn',
      Deluxe: 'Cao cấp',
      Suite: 'Suite',
    };
    return types[roomType];
  }

  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.showUserDropdown.set(!this.showUserDropdown());
  }
  logout(): void {
    this.authService.logout(); // gọi hàm đã có trong auth.service.ts
  }
  confirmLogout() {
    this.showLogoutModal.set(false);
    this.showSuccess('Đăng xuất thành công');
  }

  showLogoutConfirmation() {
    this.showLogoutModal.set(true);
  }

  showSuccess(msg: string): void {
    this.toastType.set('success');
    this.toastTitle.set('Thành công');
    this.toastMessage.set(msg);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 5000);
  }

  goToProfile(): void {
    this.showUserDropdown.set(false);
    this.router.navigate(['/profile']);
    this.showToastMessage({
      type: 'info',
      title: 'Chuyển hướng',
      message: 'Đang chuyển đến trang profile...',
    });
  }

  showToastMessage(config: {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
  }): void {
    this.toastType.set(config.type);
    this.toastTitle.set(config.title);
    this.toastMessage.set(config.message);
    this.showToast.set(true);

    const duration = config.duration || 4000;
    setTimeout(() => {
      this.closeToast();
    }, duration);
  }

  closeToast(): void {
    this.showToast.set(false);
  }

  onFilterChange(): void {
    this.currentPage.set(1);
  }

  refreshData(): void {
    this.selectedRoomType.set('');
    this.selectedStatus.set('');
    this.selectedDate.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadBookings();

    this.showSuccess('Dữ liệu đã được làm mới thành công');
  }

  clearDate(): void {
    this.selectedDate.set('');
    this.onFilterChange();
  }

  showDeleteConfirm = signal(false);
  pendingDeleteBooking = signal<Booking | null>(null);

  deleteBooking(booking: Booking): void {
    this.pendingDeleteBooking.set(booking);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    const booking = this.pendingDeleteBooking();
    if (booking) {
      this.isLoading.set(true);
      this.bookingService.deleteBooking(booking.id).subscribe({
        next: () => {
          this.bookings.set(this.bookings().filter((b) => b.id !== booking.id));
          this.isLoading.set(false);
          this.showSuccess('Xóa đơn đặt phòng thành công');
          this.showDeleteConfirm.set(false);
          this.pendingDeleteBooking.set(null);
        },
        error: (err) => {
          console.error('Error deleting booking:', err);
          this.isLoading.set(false);
          this.showError('Có lỗi xảy ra khi xóa đơn đặt phòng');
        },
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.pendingDeleteBooking.set(null);
  }

  showError(msg: string): void {
    this.toastType.set('error');
    this.toastTitle.set('Lỗi');
    this.toastMessage.set(msg);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 5000);
  }
}
