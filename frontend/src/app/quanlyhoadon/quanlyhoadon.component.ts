import {Component, Directive, OnInit, signal, HostListener, OnDestroy, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
interface LoggedInUser {
  fullName: string;
}
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}
interface InvoiceStats {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
}

interface Invoice {
  idcode: number;
  bookingId?: number;
  createdAt: string | Date;
  totalAmount: number;
  paymentMethod?: string;
  status: string;
  fullName: string;
  roomNumber: string;
}


interface Notification {
  id: number;
  message: string;
  time: Date;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

@Component({
  selector: 'app-quanlyhoadon',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './quanlyhoadon.component.html',
  styleUrls: ['./quanlyhoadon.component.css']
})
export class QuanlyhoadonComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  constructor(private http: HttpClient, private router: Router) {}


  currentRoute = signal<string>('/quanlyhoadon');
  showUserDropdown = signal<boolean>(false);
  showNotifications = signal<boolean>(false);
  showAddModal = signal<boolean>(false);
  showEditModal = signal<boolean>(false);
  showViewModal = signal<boolean>(false);
  showFilterModal = signal<boolean>(false);
  showConfirmDialog = signal<boolean>(false);
  showToast = signal<boolean>(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('success');
  toastTitle = signal<string>('');
  toastMessage = signal<string>('');
  highlightedCard = signal<string>('');
  selectedInvoice = signal<number | null>(null);

  confirmDialogTitle = signal<string>('');
  confirmDialogMessage = signal<string>('');
  pendingAction = signal<(() => void) | null>(null);

  searchTerm = '';
  filteredInvoices = signal<Invoice[]>([]);

  filterOptions = {
    status: '',
    dateFrom: '',
    dateTo: '',
    minAmount: null as number | null,
    maxAmount: null as number | null,
    room: ''
  };


  invoiceStats = signal<InvoiceStats>({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0
  });

  invoices = signal<Invoice[]>([]);

  notifications = signal<Notification[]>([{
    id: 1,
    message: 'Có 2 hóa đơn quá hạn cần xử lý',
    time: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    type: 'warning'
  }]);
  fetchInvoices(): void {
    this.http.get<any>('http://localhost:8080/api/v1/payment-invoices/with-booking').subscribe({
      next: (res) => {
        const rawData = res.data ?? [];

        // 🔁 Mapping lại dữ liệu để phù hợp với giao diện Invoice
        const mappedInvoices: Invoice[] = rawData.map((item: any) => ({
          idcode: item.id, // 🔄 đổi từ id sang idcode
          bookingId: item.bookingId,
          createdAt: item.createdAt,
          totalAmount: item.totalAmount,
          paymentMethod: item.paymentMethod,
          status: this.mapStatus(item.status), // chuẩn hóa status nếu cần
          fullName: item.fullName || 'Không rõ', // 👈 tạm để nếu backend chưa có
          roomNumber: item.roomNumber || 'Không rõ' // 👈 tạm để nếu backend chưa có
        }));

        this.invoices.set(mappedInvoices);
        this.updateFilteredInvoices();

        const stats = {
          total: mappedInvoices.length,
          paid: mappedInvoices.filter(i => i.status === 'paid').length,
          pending: mappedInvoices.filter(i => i.status === 'pending').length,
          overdue: mappedInvoices.filter(i => this.isOverdue(i)).length
        };
        this.invoiceStats.set(stats);
      },
      error: (err) => {
        console.error('Lỗi khi lấy hóa đơn:', err);
        this.showToastMessage({
          type: 'error',
          title: 'Lỗi',
          message: 'Không thể tải danh sách hóa đơn!'
        });
      }
    });
  }

// Helper để chuẩn hóa status
  mapStatus(rawStatus: string): 'paid' | 'pending' | 'overdue' {
    switch (rawStatus.toLowerCase()) {
      case 'paid': return 'paid';
      case 'unpaid': return 'pending'; // 🔁 chuyển về giá trị đang xử lý trong UI
      default: return 'overdue';
    }
  }


  isOverdue(invoice: Invoice): boolean {
    const created = new Date(invoice.createdAt);
    const today = new Date();
    return invoice.status === 'Unpaid' && created < today;
  }

  showToastMessage({ type, title, message }: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string }): void {
    this.toastType.set(type);
    this.toastTitle.set(title);
    this.toastMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }

  ngOnDestroy(): void {}


// Form data
  newInvoice: Partial<Invoice> = {};
  editingInvoice: Partial<Invoice> = {};
  viewingInvoice: Invoice | null = null;



  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.showUserDropdown()) {
      this.showUserDropdown.set(false);
    }
    if (this.showNotifications()) {
      this.showNotifications.set(false);
    }
  }

  ngOnInit(): void {
    this.currentRoute.set('/quanlyhoadon');
    this.initializeInvoiceForm();
    this.updateFilteredInvoices();
    this.fetchInvoices(); // ⚠️ Thêm dòng này để load dữ liệu từ API
    console.log('QuanlyHoadonComponent initialized');

    if (isBrowser()) {
      const local = localStorage.getItem('user'); // 🔄 sửa từ 'userProfile' thành 'user'
      if (local) {
        const parsed = JSON.parse(local);
        this.userInfo.set({
          fullName: parsed.fullName || ''
        });
      }
    }
  }

  userInfo = signal<LoggedInUser>({
    fullName: ''
  });

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
    this.showConfirmation(
      'Chuyển trang',
      'Bạn có muốn chuyển đến trang hồ sơ cá nhân không?',
      () => {
        this.router.navigate(['/profile']);
        this.showToastMessage({
          type: 'success',
          title: 'Chuyển hướng',
          message: 'Đang chuyển đến trang hồ sơ cá nhân...'
        });
      }
    );
  }

  changeTheme(): void {
    this.showUserDropdown.set(false);
    this.showToastMessage({
      type: 'info',
      title: 'Thay đổi giao diện',
      message: 'Tính năng đang được phát triển...'
    });
  }

  showLogoutConfirmation(): void {
    this.showUserDropdown.set(false);
    this.showConfirmation(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?',
      () => {
        this.showToastMessage({
          type: 'success',
          title: 'Đăng xuất thành công',
          message: 'Bạn đã đăng xuất khỏi hệ thống'
        });
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      }
    );
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

  // Search functionality
  onSearchChange(): void {
    this.updateFilteredInvoices();
  }

  updateFilteredInvoices(): void {
    let filtered = this.invoices();

    // Apply search filter
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(invoice =>
        invoice.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        invoice.idcode.toString().toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        invoice.roomNumber.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply advanced filters
    if (this.filterOptions.status) {
      filtered = filtered.filter(invoice => invoice.status === this.filterOptions.status);
    }

    if (this.filterOptions.room) {
      filtered = filtered.filter(invoice =>
        invoice.roomNumber.toLowerCase().includes(this.filterOptions.room.toLowerCase())
      );
    }

    if (this.filterOptions.minAmount !== null) {
      filtered = filtered.filter(invoice => invoice.totalAmount >= this.filterOptions.minAmount!);
    }

    if (this.filterOptions.maxAmount !== null) {
      filtered = filtered.filter(invoice => invoice.totalAmount <= this.filterOptions.maxAmount!);
    }

    if (this.filterOptions.dateFrom) {
      const fromDate = new Date(this.filterOptions.dateFrom);
      filtered = filtered.filter(invoice => new Date(invoice.createdAt) >= fromDate);
    }

    if (this.filterOptions.dateTo) {
      const toDate = new Date(this.filterOptions.dateTo);
      filtered = filtered.filter(invoice => new Date(invoice.createdAt) <= toDate);
    }

    this.filteredInvoices.set(filtered);
  }

  // Card interaction methods
  highlightCard(cardType: string): void {
    this.highlightedCard.set(cardType);
    setTimeout(() => {
      this.highlightedCard.set('');
    }, 2000);
  }

  // Utility methods
  initializeInvoiceForm(): void {
    this.newInvoice = {
      idcode: this.generateInvoiceCode(),
      fullName: '',
      roomNumber: '',
      totalAmount: 0,
      status: 'pending',

    };
  }

  getEmptyInvoice(): Partial<Invoice> {
    return {
      idcode: this.generateInvoiceCode(),
      fullName: '',
      roomNumber: '',
      totalAmount: 0,
      status: 'pending',
    };
  }

  // Invoice management methods
  showAddInvoiceModal(): void {
    this.newInvoice = this.getEmptyInvoice();
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  showEditInvoiceModal(invoice: Invoice): void {
    this.editingInvoice = { ...invoice };
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingInvoice = {};
  }

  showViewInvoiceModal(invoice: Invoice): void {
    this.viewingInvoice = invoice;
    this.showViewModal.set(true);
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
    this.viewingInvoice = null;
  }

  addInvoice(): void {
    this.showConfirmation(
      'Xác nhận tạo hóa đơn',
      'Bạn có chắc chắn muốn tạo hóa đơn mới này không?',
      () => {
        this.executeAddInvoice();
      }
    );
  }

  executeAddInvoice(): void {
    if (!this.newInvoice.fullName?.trim() || !this.newInvoice.roomNumber?.trim() || !this.newInvoice.totalAmount) {
      this.showToastMessage({
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
      return;
    }

    const newId = Math.max(...this.invoices().map(i => i.idcode)) + 1;
    const invoice: Invoice = {
      idcode: this.newInvoice.idcode!,
      fullName: this.newInvoice.fullName!,
      roomNumber: this.newInvoice.roomNumber!,
      totalAmount: this.newInvoice.totalAmount!,
      status: this.newInvoice.status as 'paid' | 'pending' | 'overdue',
      createdAt: new Date()
    };

    const updatedInvoices = [...this.invoices(), invoice];
    this.invoices.set(updatedInvoices);
    this.updateFilteredInvoices();
    this.updateStats();

    this.showAddModal.set(false);
    this.showToastMessage({
      type: 'success',
      title: 'Thành công',
      message: `Đã tạo hóa đơn ${invoice.idcode} thành công`
    });
  }

  updateInvoice(): void {
    this.showConfirmation(
      'Xác nhận cập nhật',
      'Bạn có chắc chắn muốn cập nhật thông tin hóa đơn này không?',
      () => {
        this.executeUpdateInvoice();
      }
    );
  }

  executeUpdateInvoice(): void {
    if (!this.editingInvoice.fullName?.trim() || !this.editingInvoice.roomNumber?.trim() || !this.editingInvoice.totalAmount) {
      this.showToastMessage({
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
      return;
    }

    const updatedInvoices = this.invoices().map(invoice =>
      invoice.idcode === this.editingInvoice.idcode ? { ...invoice, ...this.editingInvoice } as Invoice : invoice
    );

    this.invoices.set(updatedInvoices);
    this.updateFilteredInvoices();
    this.updateStats();

    this.closeEditModal();
    this.showToastMessage({
      type: 'success',
      title: 'Cập nhật thành công',
      message: `Đã cập nhật hóa đơn ${this.editingInvoice.idcode} thành công`
    });
  }

  viewInvoice(invoice: Invoice): void {
    this.showViewInvoiceModal(invoice);
  }

  editInvoice(invoice: Invoice): void {
    this.showEditInvoiceModal(invoice);
  }

  deleteInvoice(invoice: Invoice): void {
    this.showConfirmation(
      'Xác nhận xóa hóa đơn',
      `Bạn có chắc chắn muốn xóa hóa đơn ${invoice.idcode}? Thao tác này không thể hoàn tác.`,
      () => {
        const updatedInvoices = this.invoices().filter(i => i.idcode !== invoice.idcode);
        this.invoices.set(updatedInvoices);
        this.updateFilteredInvoices();
        this.updateStats();

        this.showToastMessage({
          type: 'success',
          title: 'Đã xóa',
          message: `Đã xóa hóa đơn ${invoice.idcode} thành công`
        });
      }
    );
  }

  filterInvoices(): void {
    this.showFilterModal.set(true);
  }

  closeFilterModal(): void {
    this.showFilterModal.set(false);
  }

  applyFilters(): void {
    this.updateFilteredInvoices();
    this.closeFilterModal();
    this.showToastMessage({
      type: 'success',
      title: 'Lọc thành công',
      message: 'Đã áp dụng bộ lọc cho danh sách hóa đơn'
    });
  }

  clearFilters(): void {
    this.filterOptions = {
      status: '',
      dateFrom: '',
      dateTo: '',
      minAmount: null,
      maxAmount: null,
      room: ''
    };
    this.updateFilteredInvoices();
    this.showToastMessage({
      type: 'info',
      title: 'Đã xóa bộ lọc',
      message: 'Tất cả bộ lọc đã được xóa'
    });
  }

  exportInvoices(): void {
    this.showConfirmation(
      'Xuất file Excel',
      'Bạn có muốn xuất danh sách hóa đơn ra file Excel không?',
      () => {
        this.executeExportExcel();
      }
    );
  }

  executeExportExcel(): void {
    this.showToastMessage({
      type: 'info',
      title: 'Đang xuất Excel',
      message: 'Đang tạo file Excel, vui lòng đợi...'
    });

    // Simulate export process
    setTimeout(() => {
      // Create CSV content
      const csvContent = this.generateCSV();
      this.downloadCSV(csvContent, 'danh-sach-hoa-don.csv');

      this.showToastMessage({
        type: 'success',
        title: 'Xuất thành công',
        message: 'Đã xuất danh sách hóa đơn ra file Excel'
      });
    }, 2000);
  }

  generateCSV(): string {
    const headers = ['Mã hóa đơn', 'Tên khách hàng', 'Phòng', 'Số tiền', 'Trạng thái', 'Ngày tạo'];
    const rows = this.filteredInvoices().map(invoice => [
      invoice.idcode,
      invoice.fullName,
      invoice.roomNumber,
      invoice.totalAmount.toString(),
      this.getStatusText(invoice.status),
      this.formatDate(invoice.createdAt)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  downloadCSV(content: string, filename: string): void {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'overdue': return 'status-overdue';
      default: return 'status-pending';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'pending': return 'Chờ thanh toán';
      case 'overdue': return 'Quá hạn';
      default: return 'Chờ thanh toán';
    }
  }

  getToastIcon(): string {
    switch (this.toastType()) {
      case 'success': return 'toast-icon-success';
      case 'error': return 'toast-icon-error';
      case 'warning': return 'toast-icon-warning';
      case 'info': return 'toast-icon-info';
      default: return 'toast-icon-info';
    }
  }


  // Confirmation Dialog Methods
  showConfirmation(title: string, message: string, action: () => void): void {
    this.confirmDialogTitle.set(title);
    this.confirmDialogMessage.set(message);
    this.pendingAction.set(action);
    this.showConfirmDialog.set(true);
  }

  confirmAction(): void {
    const action = this.pendingAction();
    if (action) {
      action();
    }
    this.closeConfirmDialog();
  }

  closeConfirmDialog(): void {
    this.showConfirmDialog.set(false);
    this.confirmDialogTitle.set('');
    this.confirmDialogMessage.set('');
    this.pendingAction.set(null);
  }

  // Additional utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('vi-VN');
  }

  generateInvoiceCode(): number {
    return Number(Date.now().toString().slice(-6)); // mất tiền tố 'HD'
  }

  updateStats(): void {
    const invoices = this.invoices();
    const stats = {
      total: invoices.length,
      paid: invoices.filter(i => i.status === 'paid').length,
      pending: invoices.filter(i => i.status === 'pending').length,
      overdue: invoices.filter(i => i.status === 'overdue').length
    };
    this.invoiceStats.set(stats);
  }
  closeNotificationsIfClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isInside = target.closest('.notification-btn, .notifications-dropdown');
    if (!isInside) {
      this.showNotifications.set(false);
    }
  }
  logout(): void {
    this.authService.logout(); // gọi hàm đã có trong auth.service.ts
  }
}
