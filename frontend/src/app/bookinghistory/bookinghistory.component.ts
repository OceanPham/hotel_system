import {
  Component,
  signal,
  computed,
  OnInit,
  HostListener,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { API_URL } from '../../constants';

interface BookingHistory {
  id: number;
  userId: number;
  userName: string;
  roomId: number;
  roomNumber: string;
  roomName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  bookingType?: string;
  createdAt: string;
  note?: string;
  totalAmount: number;
  mainImageUrl: string;
  feedback?: Feedback;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}
interface Feedback {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
}
@Component({
  selector: 'app-bookinghistory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bookinghistory.component.html',
  styleUrls: ['./bookinghistory.component.css'],
})
export class BookinghistoryComponent implements OnInit {
  // Signals for reactive state management
  bookings = signal<BookingHistory[]>([]);
  currentUser = signal<User | null>(null);
  isLoading = signal<boolean>(true);
  isScrolled = signal<boolean>(false);
  userMenuOpen = signal<boolean>(false);
  mobileMenuOpen = signal<boolean>(false);
  isCancelling = signal<boolean>(false);
  showBookingModal = signal<boolean>(false);
  selectedBooking = signal<BookingHistory | null>(null);

  // Navigation confirmation signals
  showNavigationModal = signal<boolean>(false);
  pendingNavigation = signal<{ type: string; message: string } | null>(null);

  // Rating modal signals
  showRatingModal = signal<boolean>(false);
  selectedRatingBooking = signal<BookingHistory | null>(null);
  selectedRating = signal<number>(0);
  hoverRating = signal<number>(0);
  ratingComment = signal<string>('');
  isSubmittingRating = signal<boolean>(false);

  // Map modal signals
  showMapModal = signal<boolean>(false);
  showMapModalFlag = signal<boolean>(false);

  // Cancel modal signals
  showCancelModal = signal<boolean>(false);
  selectedCancelBooking = signal<BookingHistory | null>(null);
  cancelReason = signal<string>('');

  // Notification system
  notificationMessage = signal<string>('');
  notificationType = signal<
    'success' | 'error' | 'warning' | 'info' | 'confirm'
  >('info');
  showNotification = signal(false);

  // Confirmation system
  confirmationCallback = signal<(() => void) | null>(null);
  confirmationData = signal<any>(null);

  // Computed values
  hasBookings = computed(() => this.bookings().length > 0);
  confirmedBookings = computed(
    () =>
      this.bookings().filter((booking) => booking.status === 'Confirmed').length
  );
  completedBookings = computed(
    () =>
      this.bookings().filter((booking) => booking.status === 'Completed').length
  );
  authService = inject(AuthService);

  // ===== API ENDPOINTS =====
  private baseApiUrl = `${API_URL}/api`;
  private readonly BOOKING_API_URL = `${this.baseApiUrl}/bookings/my`;
  private readonly CANCEL_API_URL = `${this.baseApiUrl}/bookings`; // + /{id}/cancel
  private readonly FEEDBACK_API_URL = `${this.baseApiUrl.replace(
    '/api',
    '/api/v1'
  )}/feedbacks`;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadBookingHistory();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    const scrollTop =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    this.isScrolled.set(scrollTop > 50);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile-container')) {
      this.userMenuOpen.set(false);
    }
    if (!target.closest('.mobile-menu') && !target.closest('.hamburger-menu')) {
      this.mobileMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(): void {
    this.closeBookingModal();
    this.closeRatingModal();
    this.closeMapModal();
    this.closeCancelModal();
    this.cancelNavigation();
    this.hideNotification();
  }

  // Helper methods
  formatBookingId(id: number): string {
    return id.toString().padStart(6, '0');
  }

  getSelectedBookingId(): string {
    const booking = this.selectedBooking();
    if (booking) {
      return this.formatBookingId(booking.id);
    }
    return '';
  }

  getSelectedBookingField(field: keyof BookingHistory): any {
    const booking = this.selectedBooking();
    if (booking) {
      return booking[field];
    }
    return '';
  }

  getNavigationMessage(): string {
    const pending = this.pendingNavigation();
    return pending ? pending.message : '';
  }

  // Data loading methods
  private loadUserData(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.currentUser.set(user);
    }
  }

  private loadBookingHistory(): void {
    this.isLoading.set(true);

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Không tìm thấy token, vui lòng đăng nhập lại');
      this.showNotificationMessage(
        'Không tìm thấy token, vui lòng đăng nhập lại',
        'error'
      );
      this.isLoading.set(false);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<{ status: string; data: BookingHistory[]; total?: number }>(
        this.BOOKING_API_URL,
        { headers }
      )
      .subscribe({
        next: (res) => {
          const data = res.data.map((b) => ({
            ...b,
            roomImage: this.getFullImageUrl(b.roomType),
          }));
          this.bookings.set(data);
          this.isLoading.set(false);
          data.forEach((b) => {
            if (b.status === 'Completed') {
              this.getMyFeedbackForBooking(b.id);
            }
          });
        },

        error: (err) => {
          console.error('Lỗi khi tải lịch sử đặt phòng:', err);
          this.showNotificationMessage(
            'Lỗi khi tải lịch sử đặt phòng',
            'error'
          );
          this.bookings.set([]);
          this.isLoading.set(false);
        },
      });
  }
  logout(): void {
    this.authService.logout(); // gọi hàm đã có trong auth.service.ts
  }
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  calculateNights(checkIn: string, checkOut: string): number {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diff = outDate.getTime() - inDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Utility methods
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'Confirmed':
        return 'Đã xác nhận';
      case 'Completed':
        return 'Hoàn thành';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  }

  trackByBookingId(index: number, booking: BookingHistory): number {
    return booking.id;
  }

  // Navigation methods
  showNavigationConfirmation(type: string, message: string): void {
    this.pendingNavigation.set({ type, message });
    this.showNavigationModal.set(true);
    document.body.style.overflow = 'hidden';
    this.userMenuOpen.set(false);
    this.mobileMenuOpen.set(false);
  }

  confirmNavigation(): void {
    const pending = this.pendingNavigation();
    if (pending) {
      console.log(`Navigating to ${pending.type}...`);

      switch (pending.type) {
        case 'home':
          window.location.href = '/';
          break;
        case 'profile':
          window.location.href = '/profile';
          break;
        case 'rooms':
          window.location.href = '/rooms';
          break;
        case 'services':
          window.location.href = '/services';
          break;
        case 'contact':
          window.location.href = '/contact';
          break;
        case 'logout':
          window.location.href = '/login';
          break;
      }
    }
    this.cancelNavigation();
  }

  cancelNavigation(): void {
    this.showNavigationModal.set(false);
    this.pendingNavigation.set(null);
    document.body.style.overflow = 'auto';
  }

  // UI interaction methods
  toggleUserMenu(): void {
    this.userMenuOpen.update((value) => !value);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((value) => !value);
  }

  // Booking actions
  viewBookingDetails(booking: BookingHistory): void {
    console.log('Viewing booking details for:', booking);
    this.selectedBooking.set(booking);
    this.showBookingModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeBookingModal(): void {
    this.showBookingModal.set(false);
    this.selectedBooking.set(null);
    document.body.style.overflow = 'auto';
  }

  cancelBooking(bookingId: number): void {
    const booking = this.bookings().find((b) => b.id === bookingId);
    if (!booking) return;

    const confirmMessage = `Bạn có chắc chắn muốn hủy đặt phòng "${
      booking.roomName
    }" không?\n\nMã đặt phòng: #${this.formatBookingId(
      bookingId
    )}\nLưu ý: Phí hủy có thể áp dụng theo chính sách khách sạn.`;

    this.showConfirmation(confirmMessage, () => {
      this.performCancelBooking(bookingId);
    });
  }

  private performCancelBooking(bookingId: number): void {
    this.isCancelling.set(true);

    setTimeout(() => {
      const currentBookings = this.bookings();
      const updatedBookings = currentBookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, status: 'Cancelled' as const }
          : booking
      );

      this.bookings.set(updatedBookings);
      this.isCancelling.set(false);

      this.showNotificationMessage(
        'Đặt phòng đã được hủy thành công!\n\nEmail xác nhận đã được gửi đến địa chỉ của bạn.\nBộ phận chăm sóc khách hàng sẽ liên hệ với bạn trong vòng 24h để hoàn tất thủ tục.',
        'success',
        8000
      );
    }, 2000);
  }

  // Cancel booking modal methods
  showCancelConfirmation(booking: BookingHistory): void {
    this.selectedCancelBooking.set(booking);
    this.cancelReason.set('');
    this.showCancelModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
    this.selectedCancelBooking.set(null);
    this.cancelReason.set('');
    document.body.style.overflow = 'auto';
  }

  confirmCancelBooking(): void {
    const booking = this.selectedCancelBooking();
    if (!booking) return;

    const token = localStorage.getItem('token');
    if (!token) {
      this.showNotificationMessage('Bạn chưa đăng nhập.', 'error');
      return;
    }

    this.isCancelling.set(true);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .put(`${this.CANCEL_API_URL}/${booking.id}/cancel`, {}, { headers })
      .subscribe({
        next: () => {
          const updatedBookings = this.bookings().map((b) =>
            b.id === booking.id ? { ...b, status: 'Cancelled' as const } : b
          );
          this.bookings.set(updatedBookings);
          this.isCancelling.set(false);
          this.closeCancelModal();
          this.showNotificationMessage(
            'Đặt phòng đã được hủy thành công!',
            'success'
          );
        },
        error: (err) => {
          console.error('Lỗi khi hủy đặt phòng:', err);
          this.isCancelling.set(false);
          this.showNotificationMessage('Hủy đặt phòng thất bại!', 'error');
        },
      });
  }

  // Rating methods
  rateBooking(bookingId: number): void {
    const booking = this.bookings().find((b) => b.id === bookingId);
    if (!booking) return;

    this.selectedRatingBooking.set(booking);

    if (booking.feedback) {
      this.selectedRating.set(booking.feedback.rating);
      this.ratingComment.set(booking.feedback.comment);
    } else {
      this.selectedRating.set(0);
      this.ratingComment.set('');
    }

    this.showRatingModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeRatingModal(): void {
    this.showRatingModal.set(false);
    this.selectedRatingBooking.set(null);
    this.selectedRating.set(0);
    this.hoverRating.set(0);
    this.ratingComment.set('');
    document.body.style.overflow = 'auto';
  }

  setRating(rating: number): void {
    this.selectedRating.set(rating);
  }

  setHoverRating(rating: number): void {
    this.hoverRating.set(rating);
  }

  getRatingDescription(): string {
    const rating = this.hoverRating() || this.selectedRating();
    switch (rating) {
      case 1:
        return 'Rất tệ';
      case 2:
        return 'Tệ';
      case 3:
        return 'Bình thường';
      case 4:
        return 'Tốt';
      case 5:
        return 'Tuyệt vời';
      default:
        return 'Chọn số sao để đánh giá';
    }
  }

  submitRating(): void {
    const booking = this.selectedRatingBooking();
    const rating = this.selectedRating();
    const comment = this.ratingComment().trim();

    if (!booking || rating === 0) {
      this.showNotificationMessage(
        'Vui lòng chọn số sao và nhập nhận xét!',
        'warning'
      );
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.showNotificationMessage('Bạn chưa đăng nhập.', 'error');
      return;
    }

    this.isSubmittingRating.set(true);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const feedbackData = { bookingId: booking.id, rating, comment };

    const request = booking.feedback
      ? this.http.put(
          `${this.FEEDBACK_API_URL}/${booking.feedback.id}`,
          { ...feedbackData, id: booking.feedback.id },
          { headers }
        )
      : this.http.post(this.FEEDBACK_API_URL, feedbackData, { headers });

    request.subscribe({
      next: () => {
        this.isSubmittingRating.set(false);
        this.closeRatingModal();
        this.showNotificationMessage(
          booking.feedback ? 'Đánh giá đã cập nhật!' : 'Đánh giá đã gửi!',
          'success'
        );

        this.getMyFeedbackForBooking(booking.id); // reload lại feedback
      },
      error: (err) => {
        console.error('Lỗi gửi đánh giá:', err);
        this.isSubmittingRating.set(false);
        this.showNotificationMessage('Gửi đánh giá thất bại!', 'error');
      },
    });
  }

  getMyFeedbackForBooking(bookingId: number): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<{ status: string; data: any }>(
        `${this.FEEDBACK_API_URL}/booking/${bookingId}`,
        { headers }
      )
      .subscribe({
        next: (res) => {
          const feedback = res.data;
          const updated = this.bookings().map((b) =>
            b.id === bookingId ? { ...b, feedback } : b
          );
          this.bookings.set(updated);
        },
        error: (err) => {
          console.error('Lỗi khi tải đánh giá:', err);
        },
      });
  }
  editFeedback(booking: BookingHistory): void {
    this.selectedRatingBooking.set(booking);
    this.selectedRating.set(booking.feedback?.rating || 0);
    this.ratingComment.set(booking.feedback?.comment || '');
    this.showRatingModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  deleteFeedback(feedbackId: number): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.showNotificationMessage('Bạn chưa đăng nhập.', 'error');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) return;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .delete(`${this.FEEDBACK_API_URL}/${feedbackId}`, { headers })
      .subscribe({
        next: () => {
          this.isSubmittingRating.set(false);
          this.closeRatingModal();
          this.showNotificationMessage(
            'Đánh giá đã được xóa thành công.',
            'success'
          );
        },
        error: (err) => {
          console.error('Lỗi khi xóa đánh giá:', err);
          this.isSubmittingRating.set(false);
          this.showNotificationMessage('Xóa đánh giá thất bại!', 'error');
        },
      });
  }

  // Map methods
  openMapModal(): void {
    this.showMapModalFlag.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeMapModal(): void {
    this.showMapModal.set(false);
    this.showMapModalFlag.set(false);
    document.body.style.overflow = 'auto';
  }

  // Map interaction methods
  zoomIn(): void {
    console.log('Zoom in map');
    // Implement zoom in logic
  }

  zoomOut(): void {
    console.log('Zoom out map');
    // Implement zoom out logic
  }

  resetView(): void {
    console.log('Reset map view');
    // Implement reset view logic
  }

  getDirections(): void {
    const hotelLocation = 'Azure Hotel, Đà Nẵng, Vietnam';
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      hotelLocation
    )}`;
    window.open(directionsUrl, '_blank');
  }

  shareLocation(): void {
    const hotelLocation = 'Azure Hotel, Đà Nẵng, Vietnam';
    const shareText = `Vị trí Azure Hotel: ${hotelLocation}`;

    if (navigator.share) {
      navigator
        .share({
          title: 'Vị trí Azure Hotel',
          text: shareText,
          url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            hotelLocation
          )}`,
        })
        .catch((err) => console.log('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          this.showNotificationMessage(
            'Đã sao chép vị trí khách sạn vào clipboard!',
            'success'
          );
        })
        .catch(() => {
          this.showNotificationMessage(
            'Không thể sao chép. Vui lòng thử lại.',
            'error'
          );
        });
    }
  }

  // Refresh booking data
  refreshBookings(): void {
    this.isLoading.set(true);
    this.loadBookingHistory();
  }

  // Image error handling
  randomFallbackImages: string[] = [
    '7cba9c26-1dfd-4500-be4d-4d05a5761ca5.jpg',
    '8ba96b50-96e4-4a91-a1d0-b83b0e008c08.jpg',
    '33f59293-65d6-4f2b-84d2-bce34f9badfb.jpg',
    '70ea674d-4a70-4f79-8bbc-93897b360b2a.jpg',
    'a0ba8419-9a1f-4a9a-aec5-7907e4857b1a.jpg',
  ];

  onImageError(event: any): void {
    setTimeout(() => {
      const fallback =
        this.randomFallbackImages[
          Math.floor(Math.random() * this.randomFallbackImages.length)
        ];
      event.target.src = `${API_URL}/uploads/${fallback}`;
    });
  }

  openExternalMap(): void {
    const hotelLocation = 'Azure Hotel, Đà Nẵng, Vietnam';
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      hotelLocation
    )}`;
    window.open(googleMapsUrl, '_blank');
  }

  // Notification methods
  showNotificationMessage(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 5000
  ) {
    this.notificationMessage.set(message);
    this.notificationType.set(type);
    this.showNotification.set(true);

    setTimeout(() => {
      this.hideNotification();
    }, duration);
  }

  showConfirmation(message: string, callback: () => void, data?: any) {
    this.notificationMessage.set(message);
    this.notificationType.set('confirm');
    this.showNotification.set(true);
    this.confirmationCallback.set(callback);
    this.confirmationData.set(data);
  }

  confirmAction() {
    const callback = this.confirmationCallback();
    if (callback) {
      callback();
    }
    this.hideNotification();
  }

  hideNotification() {
    this.showNotification.set(false);
    setTimeout(() => {
      this.notificationMessage.set('');
      this.notificationType.set('info');
      this.confirmationCallback.set(null);
      this.confirmationData.set(null);
    }, 300);
  }

  getFormattedNotificationMessage(): string {
    return this.notificationMessage().replace(/\n/g, '<br>');
  }
  getFullImageUrl(path: string | null | undefined): string {
    if (!path || typeof path !== 'string') {
      // Trả về một ảnh mặc định duy nhất, không random ở đây
      return `${API_URL}/uploads/default.jpg`;
    }

    if (path.startsWith('http')) {
      return path;
    } else if (path.startsWith('/uploads/')) {
      return `${API_URL}${path}`;
    } else {
      return `${API_URL}/uploads/${path}`;
    }
  }
}
