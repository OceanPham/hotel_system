import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  signal,
  inject,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../services/auth.service';
Chart.register(...registerables);
import { HostListener } from '@angular/core';
import type { ChartConfiguration, ChartType, TooltipItem } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ThongkeData {
  totalInvoices: number;
  totalRoomCost: number;
  totalServiceCost: number;
  totalRevenue: number;
}

interface LoggedInUser {
  fullName: string;
  role: string;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

interface Notification {
  id: number;
  message: string;
  time: Date;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface MonthlyExpense {
  month: string;
  amount: number;
  date: Date;
}

interface Invoice {
  id: number;
  createdAt: string;
  roomAmount: number;
  serviceAmount: number;
  totalAmount: number;
  customerName?: string;
  roomNumber?: string;
  status?: string;
}

@Component({
  selector: 'app-thongke',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './thongke.component.html',
  styleUrls: ['./thongke.component.css'],
})
export class ThongkeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('thongkeChart') chartRef!: ElementRef<HTMLCanvasElement>;
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private chart: Chart | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // Signals
  currentRoute = signal<string>('/thongke');
  showUserDropdown = signal<boolean>(false);
  showNotifications = signal<boolean>(false);
  showLogoutModal = signal<boolean>(false);
  showExportModal = signal<boolean>(false);
  showSaveModal = signal<boolean>(false);
  showToast = signal<boolean>(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('success');
  toastTitle = signal<string>('');
  toastMessage = signal<string>('');
  isExporting = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isRefreshing = signal<boolean>(false);
  chartType = signal<'bar' | 'line'>('bar');
  selectedTimeFilter = 'month';
  highlightedCard = signal<string>('');
  searchTerm = signal<string>('');

  thongkeData = signal<ThongkeData>({
    totalInvoices: 0,
    totalRoomCost: 0,
    totalServiceCost: 0,
    totalRevenue: 0,
  });

  monthlyExpenses = signal<MonthlyExpense[]>([]);
  todayExpense = signal<number>(0);
  reportName = '';
  reportFormat = 'pdf';
  includeCharts = true;
  autoEmail = false;

  notifications = signal<Notification[]>([
    {
      id: 1,
      message: 'Đang tải dữ liệu thống kê từ hệ thống...',
      time: new Date(),
      read: false,
      type: 'info',
    },
  ]);

  userInfo = signal<LoggedInUser>({
    fullName: '',
    role: ''
  });

  // Trend data
  trendData: Record<string, { current: number; previous: number }> = {
    invoice: { current: 4, previous: 3 },
    room: { current: 11700000, previous: 10000000 },
    service: { current: 1300000, previous: 1100000 },
    revenue: { current: 14370000, previous: 12000000 },
  };

  ngOnInit(): void {
    this.currentRoute.set('/thongke');
    this.reportName = `Bao_cao_hoa_don_${this.getCurrentMonth()}_${this.getCurrentYear()}`;
    this.fetchThongkeDataFromApi();
    console.log('ThongkeComponent initialized');
    if (isBrowser()) {
      const local = localStorage.getItem('user');
      if (local) {
        const parsed = JSON.parse(local);
        this.userInfo.set({
          fullName: parsed.fullName || '',
          role: parsed.role || ''
        });
      }
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) this.chart.destroy();
  }

  fetchThongkeDataFromApi(): void {
    this.http.get<any>('http://localhost:8080/api/v1/payment-invoices').subscribe({
      next: (res) => {
        const data = res.data ?? [];

        const totalInvoices = data.length;
        const totalRoomCost = data.reduce((sum: number, i: any) => sum + (i.roomAmount || 0), 0);
        const totalServiceCost = data.reduce((sum: number, i: any) => sum + (i.serviceAmount || 0), 0);
        const totalRevenue = data.reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0);

        this.thongkeData.set({
          totalInvoices,
          totalRoomCost,
          totalServiceCost,
          totalRevenue,
        });

        // Tính toán chi phí hôm nay
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayExpenseValue = data
          .filter((item: any) => {
            const itemDate = new Date(item.createdAt);
            return itemDate >= todayStart;
          })
          .reduce((sum: number, item: any) => sum + (item.totalAmount || 0), 0);

        this.todayExpense.set(todayExpenseValue);

        const byMonth = new Map<string, number>();
        for (const item of data) {
          const date = new Date(item.createdAt);
          const key = `T${date.getMonth() + 1}`;
          byMonth.set(key, (byMonth.get(key) || 0) + item.totalAmount);
        }

        const monthly: MonthlyExpense[] = Array.from(byMonth.entries()).map(([month, amount]) => ({
          month,
          amount,
          date: new Date(`2025-${month.substring(1)}-01`),
        }));

        this.monthlyExpenses.set(monthly.sort((a, b) => a.date.getTime() - b.date.getTime()));
        this.updateChart();

        // Gọi lấy dữ liệu kỳ trước sau khi có dữ liệu hiện tại
        this.fetchPreviousPeriodData();

        // Cập nhật notifications
        this.notifications.set([{
          id: 2,
          message: `Đã tải thành công ${totalInvoices} hóa đơn từ hệ thống`,
          time: new Date(),
          read: false,
          type: 'success',
        }]);
      },
      error: () => {
        this.showToastMessage({
          type: 'error',
          title: 'Lỗi API',
          message: 'Không thể tải dữ liệu thống kê từ hệ thống!',
        });
      },
    });
  }

  // THÊM METHOD MỚI - Lấy dữ liệu kỳ trước
  fetchPreviousPeriodData(): void {
    // Tính toán ngày của kỳ trước (ví dụ: tháng trước)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    this.http.get<any>(`http://localhost:8080/api/v1/payment-invoices?month=${lastMonth.getMonth() + 1}&year=${lastMonth.getFullYear()}`).subscribe({
      next: (res) => {
        const previousData = res.data ?? [];
        const prevTotalInvoices = previousData.length;
        const prevTotalRoomCost = previousData.reduce((sum: number, i: any) => sum + (i.roomAmount || 0), 0);
        const prevTotalServiceCost = previousData.reduce((sum: number, i: any) => sum + (i.serviceAmount || 0), 0);
        const prevTotalRevenue = previousData.reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0);

        // Cập nhật trend data với dữ liệu thực của kỳ trước
        const currentData = this.thongkeData();
        this.trendData = {
          invoice: { current: currentData.totalInvoices, previous: prevTotalInvoices },
          room: { current: currentData.totalRoomCost, previous: prevTotalRoomCost },
          service: { current: currentData.totalServiceCost, previous: prevTotalServiceCost },
          revenue: { current: currentData.totalRevenue, previous: prevTotalRevenue },
        };

        console.log('Updated trend data:', this.trendData);
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu kỳ trước:', err);
        // Giữ nguyên trend data mặc định nếu lỗi
      }
    });
  }

  updateChart(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const data = this.thongkeData();
    const ctx = this.chartRef?.nativeElement?.getContext('2d');
    if (!ctx) return;

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: this.chartType(),
      data: {
        labels: ['Số hóa đơn', 'Chi phí phòng', 'Chi phí dịch vụ', 'Tổng doanh thu'],
        datasets: [
          {
            label: 'Thống kê',
            data: [
              data.totalInvoices,
              data.totalRoomCost,
              data.totalServiceCost,
              data.totalRevenue,
            ],
            backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#E91E63'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }

  initChart(): void {
    this.updateChart();
  }

  // Navigation methods
  isActiveRoute(route: string): boolean {
    return this.currentRoute() === route;
  }

  setActiveRoute(route: string): void {
    this.currentRoute.set(route);
  }

  // User dropdown methods
  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.showUserDropdown.set(!this.showUserDropdown());
    if (this.showNotifications()) {
      this.showNotifications.set(false);
    }
  }

  goToProfile(): void {
    this.showUserDropdown.set(false);
    this.showToastMessage({
      type: 'info',
      title: 'Chuyển hướng',
      message: 'Đang chuyển đến trang hồ sơ cá nhân...'
    });
  }

  changeTheme(): void {
    this.showUserDropdown.set(false);
    this.showToastMessage({
      type: 'info',
      title: 'Thay đổi giao diện',
      message: 'Tính năng đang được phát triển...'
    });
  }
  logout(): void {
    this.authService.logout(); // gọi hàm đã có trong auth.service.ts
  }
  showLogoutConfirmation(): void {
    this.showUserDropdown.set(false);
    this.showLogoutModal.set(true);
  }

  confirmLogout(): void {
    this.showLogoutModal.set(false);
    this.showToastMessage({
      type: 'success',
      title: 'Đăng xuất thành công',
      message: 'Bạn đã đăng xuất khỏi hệ thống'
    });

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500);
  }

  cancelLogout(): void {
    this.showLogoutModal.set(false);
  }

  // Notification methods
  toggleNotifications(): void {
    this.showNotifications.set(!this.showNotifications());
    if (this.showUserDropdown()) {
      this.showUserDropdown.set(false);
    }
  }

  closeNotifications(): void {
    this.showNotifications.set(false);
  }

  markAsRead(notificationId: number): void {
    const notifications = this.notifications();
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notifications.set(updated);
  }

  clearAllNotifications(): void {
    this.notifications.set([]);
    this.showNotifications.set(false);
    this.showToastMessage({
      type: 'success',
      title: 'Đã xóa',
      message: 'Đã xóa tất cả thông báo'
    });
  }

  closeNotificationsIfClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isInside = target.closest('.notification-btn, .notifications-dropdown');
    if (!isInside) {
      this.showNotifications.set(false);
    }
  }

  // Search methods
  onSearchChange(): void {
    const keyword = this.searchTerm().trim();
    console.log('Searching for:', keyword);
    if (keyword) {
      this.showToastMessage({
        type: 'info',
        title: 'Tìm kiếm',
        message: `Đang tìm kiếm với từ khóa: "${keyword}"`,
      });
    }
  }


  // Export methods
  showExportConfirmation(): void {
    this.showExportModal.set(true);
  }

  cancelExport(): void {
    this.showExportModal.set(false);
  }

  confirmExport(): void {
    this.showExportModal.set(false);
    this.isExporting.set(true);

    this.showToastMessage({
      type: 'info',
      title: 'Đang xuất PDF',
      message: 'Hệ thống đang tạo file PDF hóa đơn...',
    });

    this.generatePDFReport();
  }

  async generatePDFReport(): Promise<void> {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BAO CAO HOA DON NGUOI DUNG', pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString('vi-VN');
      pdf.text(`Ngay xuat: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 15;

      // Thông tin tổng quan
      const data = this.thongkeData();
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('THONG TIN TONG QUAN', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const summaryData = [
        ['Tong so hoa don:', data.totalInvoices.toString()],
        ['Tong tien phong:', this.formatCurrencyForPDF(data.totalRoomCost)],
        ['Tong tien dich vu:', this.formatCurrencyForPDF(data.totalServiceCost)],
        ['Tong doanh thu:', this.formatCurrencyForPDF(data.totalRevenue)]
      ];

      summaryData.forEach(([label, value]) => {
        pdf.text(label, 25, yPosition);
        pdf.text(value, 80, yPosition);
        yPosition += 7;
      });

      yPosition += 15;

      // Lấy danh sách hóa đơn từ API thay vì biểu đồ
      await this.addInvoiceListToPDF(pdf, yPosition, pageWidth, pageHeight);

      // Footer
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Bao cao duoc tao tu dong boi he thong quan ly khach san',
        pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Lưu file
      const fileName = this.reportName || `Bao_cao_hoa_don_${currentDate.replace(/\//g, '_')}.pdf`;
      pdf.save(fileName);

      this.isExporting.set(false);
      this.showToastMessage({
        type: 'success',
        title: 'Xuất PDF thành công',
        message: `File "${fileName}" đã được tải xuống!`,
      });

      if (this.autoEmail) {
        setTimeout(() => {
          this.showToastMessage({
            type: 'info',
            title: 'Gửi email',
            message: 'Tính năng gửi email đang được phát triển...',
          });
        }, 1000);
      }

    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      this.isExporting.set(false);
      this.showToastMessage({
        type: 'error',
        title: 'Lỗi xuất PDF',
        message: 'Có lỗi xảy ra khi tạo file PDF. Vui lòng thử lại!',
      });
    }
  }

  async addInvoiceListToPDF(pdf: jsPDF, startY: number, pageWidth: number, pageHeight: number): Promise<void> {
    try {
      // Lấy danh sách hóa đơn từ API
      const invoiceResponse = await this.http.get<any>('http://localhost:8080/api/v1/payment-invoices').toPromise();
      const invoices: Invoice[] = invoiceResponse?.data || [];

      let yPosition = startY;

      // Tiêu đề danh sách hóa đơn
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DANH SACH HOA DON CHI TIET', 20, yPosition);
      yPosition += 15;

      // Header bảng
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');

      const tableHeaders = [
        { text: 'STT', x: 20, width: 15 },
        { text: 'Ma HD', x: 35, width: 25 },
        { text: 'Ngay tao', x: 60, width: 30 },
        { text: 'Tien phong', x: 90, width: 30 },
        { text: 'Tien DV', x: 120, width: 30 },
        { text: 'Tong tien', x: 150, width: 30 }
      ];

      // Vẽ header
      tableHeaders.forEach(header => {
        pdf.text(header.text, header.x, yPosition);
      });

      // Vẽ đường kẻ dưới header
      pdf.line(20, yPosition + 2, 180, yPosition + 2);
      yPosition += 10;

      // Vẽ dữ liệu hóa đơn
      pdf.setFont('helvetica', 'normal');

      for (let i = 0; i < invoices.length; i++) {
        const invoice = invoices[i];

        // Kiểm tra nếu cần trang mới
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;

          // Vẽ lại header cho trang mới
          pdf.setFont('helvetica', 'bold');
          tableHeaders.forEach(header => {
            pdf.text(header.text, header.x, yPosition);
          });
          pdf.line(20, yPosition + 2, 180, yPosition + 2);
          yPosition += 10;
          pdf.setFont('helvetica', 'normal');
        }

        // Dữ liệu từng dòng
        const rowData = [
          { text: (i + 1).toString(), x: 20 },
          { text: invoice.id?.toString() || 'N/A', x: 35 },
          { text: this.formatDateForPDF(invoice.createdAt), x: 60 },
          { text: this.formatCurrencyForPDF(invoice.roomAmount || 0), x: 90 },
          { text: this.formatCurrencyForPDF(invoice.serviceAmount || 0), x: 120 },
          { text: this.formatCurrencyForPDF(invoice.totalAmount || 0), x: 150 }
        ];

        rowData.forEach(cell => {
          pdf.text(cell.text, cell.x, yPosition);
        });

        yPosition += 8;
      }

      // Vẽ đường kẻ cuối bảng
      pdf.line(20, yPosition, 180, yPosition);
      yPosition += 10;

      // Tổng kết
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Tong so hoa don: ${invoices.length}`, 20, yPosition);
      yPosition += 7;

      const totalRevenue = invoices.reduce((sum: number, inv: Invoice) => sum + (inv.totalAmount || 0), 0);
      pdf.text(`Tong doanh thu: ${this.formatCurrencyForPDF(totalRevenue)}`, 20, yPosition);

    } catch (error) {
      console.error('Lỗi khi thêm danh sách hóa đơn:', error);

      // Thêm thông báo lỗi vào PDF
      pdf.setFont('helvetica', 'normal');
      pdf.text('Khong the tai danh sach hoa don tu he thong', 20, startY);
    }
  }

  // Method hỗ trợ format ngày cho PDF
  formatDateForPDF(dateString: string): string {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return 'N/A';
    }
  }

  // Format currency cho PDF (không dấu)
  formatCurrencyForPDF(amount: number): string {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + ' ty VND';
    } else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(0) + ' tr VND';
    } else {
      return new Intl.NumberFormat('en-US').format(amount) + ' VND';
    }
  }

  // Save methods
  cancelSave(): void {
    this.showSaveModal.set(false);
  }

  confirmSave(): void {
    this.showSaveModal.set(false);
    this.isSaving.set(true);

    this.showToastMessage({
      type: 'info',
      title: 'Đang lưu',
      message: `Đang lưu báo cáo "${this.reportName}"...`,
    });

    setTimeout(() => {
      this.isSaving.set(false);
      this.showToastMessage({
        type: 'success',
        title: 'Lưu thành công',
        message: `Báo cáo "${this.reportName}" đã được lưu dưới định dạng ${this.reportFormat.toUpperCase()}`,
      });

      if (this.autoEmail) {
        setTimeout(() => {
          this.showToastMessage({
            type: 'info',
            title: 'Email đã gửi',
            message: 'Báo cáo đã được gửi đến email của bạn',
          });
        }, 1000);
      }
    }, 2500);
  }

  // Filter methods
  onTimeFilterChange(): void {
    console.log('Time filter changed to:', this.selectedTimeFilter);
    this.refreshChart();
  }

  getTimeRangeText(): string {
    switch (this.selectedTimeFilter) {
      case 'today': return 'hôm nay';
      case 'week': return 'tuần này';
      case 'month': return '5 tháng gần đây';
      case 'quarter': return 'quý này';
      case 'year': return 'năm này';
      default: return '5 tháng gần đây';
    }
  }

  // Card methods
  highlightCard(cardType: string): void {
    this.highlightedCard.set(cardType);
    setTimeout(() => this.highlightedCard.set(''), 2000);
  }

  showCardDetails(cardType: string): void {
    console.log('Showing details for:', cardType);
  }

  hideCardDetails(): void {
    console.log('Hiding card details');
  }

  getTrendDirection(type: string): number {
    const data = this.trendData[type];
    if (!data) return 0;
    return data.current - data.previous;
  }

  getTrendPercentage(type: string): number {
    const data = this.trendData[type];
    if (!data || data.previous === 0) return 0;
    return Math.round(((data.current - data.previous) / data.previous) * 100);
  }

  getTrendIcon(type: string): string {
    const direction = this.getTrendDirection(type);
    return direction > 0 ? '↗️' : direction < 0 ? '↘️' : '➡️';
  }

  // Chart methods
  changeChartType(type: 'bar' | 'line'): void {
    this.chartType.set(type);
    this.refreshChart();
  }

  refreshChart(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      if (this.chart) {
        this.chart.destroy();
      }
      this.createChart();
      this.isRefreshing.set(false);
    }, 300);
  }

  createChart(): void {
    if (!this.chartRef?.nativeElement) {
      console.log('Chart element not found');
      return;
    }

    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.log('Canvas context not found');
      return;
    }

    const expenses = this.monthlyExpenses();

    const config: ChartConfiguration = {
      type: this.chartType(),
      data: {
        labels: expenses.map(item => item.month),
        datasets: [{
          label: 'Chi phí (tỷ đồng)',
          data: expenses.map(item => item.amount / 1000000000),
          backgroundColor: this.chartType() === 'bar' ?
            ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'] :
            'rgba(99, 102, 241, 0.2)',
          borderColor: '#4f46e5',
          borderWidth: 2,
          borderRadius: this.chartType() === 'bar' ? 8 : 0,
          borderSkipped: false,
          fill: this.chartType() === 'line',
          tension: this.chartType() === 'line' ? 0.4 : 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Chi phí: ${context.parsed.y.toFixed(1)} tỷ đ`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#f1f5f9'
            },
            ticks: {
              callback: function(value) {
                return value + ' tỷ';
              },
              color: '#64748b',
              font: {
                size: 12
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#64748b',
              font: {
                size: 12,
                weight: 500
              }
            }
          }
        },
        elements: {
          bar: {
            borderRadius: 8
          },
          point: {
            radius: this.chartType() === 'line' ? 6 : 0,
            hoverRadius: 8,
            backgroundColor: '#4f46e5',
            borderColor: '#ffffff',
            borderWidth: 2
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    };

    try {
      this.chart = new Chart(ctx, config);
      console.log('Chart created successfully');
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }

  // Utility methods
  formatCurrency(amount: number): string {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + ' tỷ đ';
    } else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(0) + ' triệu đ';
    } else {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `${diffMins} phút trước`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} giờ trước`;
    } else {
      return `${Math.floor(diffMins / 1440)} ngày trước`;
    }
  }

  getCurrentMonth(): number {
    return new Date().getMonth() + 1;
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getTotalExpense(): number {
    return this.monthlyExpenses().reduce((sum, item) => sum + item.amount, 0);
  }

  getAverageExpense(): number {
    const expenses = this.monthlyExpenses();
    return expenses.length > 0 ? this.getTotalExpense() / expenses.length : 0;
  }

  maxExpense(): number {
    const expenses = this.monthlyExpenses();
    return expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;
  }

  maxExpenseDate(): string {
    const expenses = this.monthlyExpenses();
    if (expenses.length === 0) return '';
    const max = this.maxExpense();
    const item = expenses.find(e => e.amount === max);
    return item ? item.month : '';
  }

  minExpense(): number {
    const expenses = this.monthlyExpenses();
    return expenses.length > 0 ? Math.min(...expenses.map(e => e.amount)) : 0;
  }

  minExpenseDate(): string {
    const expenses = this.monthlyExpenses();
    if (expenses.length === 0) return '';
    const min = this.minExpense();
    const item = expenses.find(e => e.amount === min);
    return item ? item.month : '';
  }

  averageGrowth(): number {
    const expenses = this.monthlyExpenses();
    if (expenses.length < 2) return 0;

    let totalGrowth = 0;
    for (let i = 1; i < expenses.length; i++) {
      const prev = expenses[i - 1].amount;
      if (prev === 0) continue;
      const growth = ((expenses[i].amount - prev) / prev) * 100;
      totalGrowth += growth;
    }

    return Math.round(totalGrowth / (expenses.length - 1));
  }

  // Toast methods
  showToastMessage(config: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string; }): void {
    this.toastType.set(config.type);
    this.toastTitle.set(config.title);
    this.toastMessage.set(config.message);
    this.showToast.set(true);

    setTimeout(() => {
      this.closeToast();
    }, 4000);
  }

  closeToast(): void {
    this.showToast.set(false);
  }

  getToastIcon(): string {
    const type = this.toastType();
    const icons = {
      success: 'toast-success-icon',
      error: 'toast-error-icon',
      warning: 'toast-warning-icon',
      info: 'toast-info-icon'
    };
    return icons[type] || icons.info;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.showUserDropdown()) {
      this.showUserDropdown.set(false);
    }
    if (this.showNotifications()) {
      this.showNotifications.set(false);
    }
  }
}
