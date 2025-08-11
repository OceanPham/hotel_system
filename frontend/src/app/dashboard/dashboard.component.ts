import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  signal,
  OnDestroy,
  HostListener,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { API_URL } from '../../constants';

interface DashboardData {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  totalServices: number;
  popularServiceCount: number;
  totalInvoices: number;
  totalRevenue: number;
}

interface Service {
  id: number;
  name: string;
  usage: number;
  percentage: number;
  type: string;
  emoji: string;
}

interface Activity {
  id: number;
  text: string;
  time: string;
  emoji: string;
}

interface Invoice {
  id: number;
  totalAmount: number;
  createdAt: string;
  status: string;
  fullName: string; // 👈 Trực tiếp từ DTO
  roomNumber: string; // 👈 Trực tiếp từ DTO
}

interface LoggedInUser {
  fullName: string;
}
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private chart: any = null;

  selectedPeriod = signal<string>('today');
  currentRoute = signal<string>('/dashboard');
  showUserDropdown = signal<boolean>(false);
  showLogoutModal = signal<boolean>(false);
  showToast = signal<boolean>(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('success');
  toastTitle = signal<string>('');
  toastMessage = signal<string>('');

  dashboardData = signal<DashboardData>({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    totalServices: 0,
    popularServiceCount: 0,
    totalInvoices: 0,
    totalRevenue: 0,
  });

  dashboardDataForChart = signal<DashboardData>({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    totalServices: 0,
    popularServiceCount: 0,
    totalInvoices: 0,
    totalRevenue: 0,
  });
  invoices = signal<Invoice[]>([]);

  services = signal<Service[]>([
    {
      id: 1,
      name: 'Ăn nhanh',
      usage: 12,
      percentage: 85,
      type: 'food',
      emoji: '🍽️',
    },
    {
      id: 2,
      name: 'Dọn phòng',
      usage: 9,
      percentage: 75,
      type: 'cleaning',
      emoji: '🧹',
    },
    {
      id: 3,
      name: 'Giặt ủi',
      usage: 6,
      percentage: 50,
      type: 'laundry',
      emoji: '👕',
    },
    {
      id: 4,
      name: 'Spa & Massage',
      usage: 4,
      percentage: 35,
      type: 'spa',
      emoji: '💆',
    },
  ]);

  activities = signal<Activity[]>([
    {
      id: 1,
      text: 'Khách hàng check-in phòng 203',
      time: '3 phút trước',
      emoji: '👤',
    },
    {
      id: 2,
      text: 'Đặt dịch vụ ăn nhanh - phòng 107',
      time: '12 phút trước',
      emoji: '🛎️',
    },
    {
      id: 3,
      text: 'Hoàn thành dọn phòng 305',
      time: '25 phút trước',
      emoji: '🧹',
    },
    {
      id: 4,
      text: 'Khách hàng check-out phòng 152',
      time: '45 phút trước',
      emoji: '📤',
    },
    {
      id: 5,
      text: 'Thanh toán hóa đơn #HD-2024-156',
      time: '1 giờ trước',
      emoji: '💳',
    },
  ]);

  constructor(private router: Router) {
    this.currentRoute.set(this.router.url || '/dashboard');
  }

  ngOnInit(): void {
    this.fetchDashboardCounts();
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

  userInfo = signal<LoggedInUser>({
    fullName: '',
  });
  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  private fetchDashboardCounts(): void {
    const rooms$ = this.http.get<any>(`${API_URL}/api/v1/rooms`);
    const services$ = this.http.get<any>(`${API_URL}/api/v1/hotel-services`);
    const includeds$ = this.http.get<any>(`${API_URL}/api/v1/includeds`);
    const invoices$ = this.http.get<any>(
      `${API_URL}/api/v1/payment-invoices/with-booking`
    );
    const bookings$ = this.http.get<any>(`${API_URL}/api/bookings`);

    rooms$.subscribe((res) => {
      const rooms = res.data ?? [];
      const totalRooms = rooms.filter(
        (r: any) => r.status !== 'Inactive'
      ).length;
      const occupiedRooms = rooms.filter(
        (r: any) => r.status === 'Booked'
      ).length;
      const availableRooms = rooms.filter(
        (r: any) => r.status === 'Vacant'
      ).length;
      this.dashboardData.update((data) => ({
        ...data,
        totalRooms,
        occupiedRooms,
        availableRooms,
      }));
    });

    services$.subscribe((res) => {
      const totalServices = res.data?.length ?? 0;
      this.dashboardData.update((data) => ({
        ...data,
        totalServices,
      }));
    });

    includeds$.subscribe((res) => {
      const includeds = res.data ?? [];
      const usageMap = new Map<number, number>();
      includeds.forEach((i: any) => {
        usageMap.set(i.serviceId, (usageMap.get(i.serviceId) ?? 0) + 1);
      });
      const mostUsedCount = Math.max(...Array.from(usageMap.values()), 0);
      this.dashboardData.update((data) => ({
        ...data,
        popularServiceCount: mostUsedCount,
      }));
    });

    invoices$.subscribe((res) => {
      const invoices = res.data ?? [];
      this.invoices.set(invoices);

      const totalRevenue = invoices.reduce(
        (sum: number, inv: any) => sum + inv.totalAmount,
        0
      );
      this.dashboardData.update((data) => ({
        ...data,
        totalInvoices: invoices.length,
        totalRevenue,
      }));
    });

    bookings$.subscribe((res) => {
      const bookings = res.data ?? [];
      const activeRoomIds = new Set<number>();
      bookings.forEach((booking: any) => {
        if (booking.status === 'Confirmed') {
          activeRoomIds.add(booking.roomId);
        }
      });
      const occupiedRooms = activeRoomIds.size;
      this.dashboardData.update((data) => ({
        ...data,
        occupiedRooms,
        availableRooms: data.totalRooms - occupiedRooms,
      }));

      // Khởi tạo dữ liệu cho biểu đồ
      setTimeout(() => {
        this.dashboardDataForChart.set(this.dashboardData());
        this.createPieChart();
      }, 200);
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.showUserDropdown()) {
      this.showUserDropdown.set(false);
    }
  }

  // UI Methods
  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.showUserDropdown.set(!this.showUserDropdown());
  }
  logout(): void {
    this.authService.logout(); // gọi hàm đã có trong auth.service.ts
  }

  showLogoutConfirmation(): void {
    this.showUserDropdown.set(false);
    this.showLogoutModal.set(true);
  }

  cancelLogout(): void {
    this.showLogoutModal.set(false);
  }

  confirmLogout(): void {
    this.showLogoutModal.set(false);
    this.showToastMessage({
      type: 'success',
      title: 'Đăng xuất thành công',
      message: 'Bạn đã đăng xuất khỏi hệ thống',
    });
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500);
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
    setTimeout(() => {
      this.closeToast();
    }, config.duration || 4000);
  }

  closeToast(): void {
    this.showToast.set(false);
  }

  getToastIcon(): string {
    const icons = {
      success: 'toast-success-icon',
      error: 'toast-error-icon',
      warning: 'toast-warning-icon',
      info: 'toast-info-icon',
    };
    return icons[this.toastType()] || icons.info;
  }

  setSelectedPeriod(period: string): void {
    this.selectedPeriod.set(period);
    this.updateChart();
  }

  updateChart(): void {
    const periodData = this.getDataForPeriod(this.selectedPeriod());
    this.dashboardDataForChart.set(periodData);
    setTimeout(() => {
      this.createPieChart();
    }, 100);
  }

  getDataForPeriod(period: string): DashboardData {
    const base = this.dashboardData();
    switch (period) {
      case 'today':
        return {
          ...base,
          occupiedRooms: 8,
          availableRooms: base.totalRooms - 8,
        };
      case 'week':
        return {
          ...base,
          occupiedRooms: 9,
          availableRooms: base.totalRooms - 9,
        };
      case 'month':
        return {
          ...base,
          occupiedRooms: 10,
          availableRooms: base.totalRooms - 10,
        };
      default:
        return base;
    }
  }

  getOccupancyPercentage(): number {
    const data = this.dashboardDataForChart();
    if (data.totalRooms === 0) return 0;
    return Math.round((data.occupiedRooms / data.totalRooms) * 100);
  }

  getAvailabilityPercentage(): number {
    const data = this.dashboardDataForChart();
    if (data.totalRooms === 0) return 0;
    return Math.round((data.availableRooms / data.totalRooms) * 100);
  }

  createPieChart(): void {
    const canvas = this.pieChartRef?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const data = this.dashboardDataForChart();
    const chartData = [
      { label: 'Phòng đã đặt', value: data.occupiedRooms, color: '#4f46e5' },
      { label: 'Phòng trống', value: data.availableRooms, color: '#94a3b8' },
    ];

    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = Math.min(centerX, centerY) - 30;
    const innerRadius = outerRadius * 0.6;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (total === 0) {
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Không có dữ liệu', centerX, centerY);
      return;
    }

    let currentAngle = -Math.PI / 2;
    chartData.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(currentAngle) * innerRadius,
        centerY + Math.sin(currentAngle) * innerRadius
      );
      ctx.arc(
        centerX,
        centerY,
        outerRadius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.lineTo(
        centerX + Math.cos(currentAngle + sliceAngle) * innerRadius,
        centerY + Math.sin(currentAngle + sliceAngle) * innerRadius
      );
      ctx.arc(
        centerX,
        centerY,
        innerRadius,
        currentAngle + sliceAngle,
        currentAngle,
        true
      );
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      currentAngle += sliceAngle;
    });

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.getOccupancyPercentage()}%`, centerX, centerY - 5);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText('Lấp đầy', centerX, centerY + 15);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  getPageTitle(): string {
    switch (this.currentRoute()) {
      case '/dashboard':
        return 'Dashboard';
      case '/listroom':
        return 'Quản lý Phòng';
      case '/listbooking':
        return 'Đơn đặt phòng';
      case '/listservice':
        return 'Dịch vụ';
      case '/message':
        return 'Tin nhắn';
      case '/help':
        return 'Trợ giúp';
      case '/setting':
        return 'Cài đặt';
      default:
        return 'Dashboard';
    }
  }

  isActiveRoute(route: string): boolean {
    return (
      this.currentRoute() === route ||
      (route === '/dashboard' && this.currentRoute() === '/')
    );
  }

  setActiveRoute(route: string): void {
    this.currentRoute.set(route);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.setActiveRoute(route);
  }

  viewAllServices(): void {
    this.navigateTo('/listservice');
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getPageIcon(): string {
    const map = {
      '/dashboard': '📊',
      '/listroom': '🏨',
      '/listbooking': '📋',
      '/listservice': '🛎️',
      '/message': '💬',
      '/help': '❓',
      '/setting': '⚙️',
    } as const;

    type RouteKey = keyof typeof map;

    const route = this.currentRoute() as RouteKey;
    return map[route] ?? '📊';
  }
  private mapStatus(status: string): 'paid' | 'pending' | 'cancelled' {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'paid';
      case 'unpaid':
        return 'pending'; // Hoặc 'cancelled' nếu bạn muốn
      default:
        return 'pending';
    }
  }
  exportInvoices(): void {
    try {
      const headers = [
        'Mã hóa đơn',
        'Tên khách hàng',
        'Số phòng',
        'Số tiền',
        'Ngày tạo',
        'Trạng thái',
      ];

      const rows = this.invoices().map((invoice) => [
        invoice.id,
        invoice.fullName ?? 'Không rõ', // ✅ Trực tiếp từ DTO
        invoice.roomNumber ?? 'Không rõ', // ✅ Trực tiếp từ DTO
        this.formatCurrency(invoice.totalAmount),
        new Date(invoice.createdAt).toLocaleDateString('vi-VN'),
        this.getStatusText(this.mapStatus(invoice.status)), // ✅ status có thể là "Paid"/"Unpaid"
      ]);

      const content = [headers, ...rows]
        .map((row) => row.map((c) => `"${c}"`).join(','))
        .join('\n');

      this.downloadCSV('\uFEFF' + content, 'tong-so-hoa-don.csv');

      this.showToastMessage({
        type: 'success',
        title: 'Xuất thành công',
        message: 'Đã xuất tổng số hóa đơn!',
      });
    } catch (error) {
      console.error(error);
      this.showToastMessage({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể xuất hóa đơn!',
      });
    }
  }

  exportDashboard(): void {
    try {
      const data = this.dashboardData();
      const headers = ['Chỉ số', 'Giá trị', 'Ghi chú'];
      const rows = [
        ['Tổng số phòng', data.totalRooms.toString(), 'Số lượng phòng hiện có'],
        ['Phòng đang sử dụng', data.occupiedRooms.toString(), 'Phòng đã đặt'],
        ['Phòng trống', data.availableRooms.toString(), 'Phòng chưa sử dụng'],
        ['Tổng dịch vụ', data.totalServices.toString(), 'Dịch vụ cung cấp'],
        ['Tổng hóa đơn', data.totalInvoices.toString(), 'Hóa đơn đã xuất'],
        ['Doanh thu', this.formatCurrency(data.totalRevenue), 'Tổng thu nhập'],
        [
          'Tỷ lệ lấp đầy',
          `${this.getOccupancyPercentage()}%`,
          'Biểu đồ hiện tại',
        ],
        ['Ngày xuất', new Date().toLocaleString('vi-VN'), 'Thời gian hệ thống'],
      ];
      const content = [headers, ...rows]
        .map((row) => row.map((c) => `"${c}"`).join(','))
        .join('\n');
      this.downloadCSV('\uFEFF' + content, 'dashboard.csv');
      this.showToastMessage({
        type: 'success',
        title: 'Xuất thành công',
        message: 'Đã xuất file thống kê!',
      });
    } catch {
      this.showToastMessage({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể xuất thống kê!',
      });
    }
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.click();
    URL.revokeObjectURL(url);
  }

  getStatusText(status: 'paid' | 'pending' | 'cancelled'): string {
    const map = {
      paid: 'Đã thanh toán',
      pending: 'Đang xử lý',
      cancelled: 'Đã hủy',
    };
    return map[status] || 'Không xác định';
  }
}
