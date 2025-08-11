import {Component, OnInit, signal, HostListener, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  address: string;
  avatar: string;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  views: number;
  expanded?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SupportTicket {
  id: number;
  customerName: string;
  email: string;
  subject: string;
  content: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-helps',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './helps.component.html',
  styleUrls: ['./helps.component.css']
})
export class HelpsComponent implements OnInit {
  searchText = '';
  showAddFAQ = false;
  editingFAQ: number | null = null;
  selectedCategory = 'all';
  selectedTicketStatus = 'all';
  authService = inject(AuthService);
  // User dropdown signals
  showUserDropdown = signal(false);
  showLogoutModal = signal(false);
  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('success');
  toastTitle = signal('');
  toastMessage = signal('');

  // Computed properties to avoid template binding issues
  unresolvedTicketsCount = 0;
  pendingTicketsCount = 0;
  resolvedTicketsCount = 0;
  totalFAQCount = 0;

  formErrors = {
    question: '',
    answer: '',
    category: ''
  };

  newFAQ = {
    question: '',
    answer: '',
    category: ''
  };

  editFAQData = {
    question: '',
    answer: '',
    category: ''
  };

  // User profile data
  userProfile = signal<UserProfile>({
    name: 'Salman Faris',
    email: 'salman.faris@lankastay.com',
    phone: '+84 912 345 678',
    role: 'admin',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  });

  faqCategories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'booking', label: 'Đặt phòng' },
    { value: 'payment', label: 'Thanh toán' },
    { value: 'account', label: 'Tài khoản' },
    { value: 'service', label: 'Dịch vụ' },
    { value: 'other', label: 'Khác' }
  ];

  faqItems: FAQItem[] = [
    {
      id: 1,
      question: 'Làm sao để đặt phòng?',
      answer: 'Vào mục "Phòng", chọn phòng và nhấn "Đặt ngay". Điền thông tin và thanh toán để hoàn tất đặt phòng.',
      category: 'booking',
      views: 245,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: 2,
      question: 'Tôi quên mật khẩu?',
      answer: 'Sử dụng tính năng "Quên mật khẩu" ở trang đăng nhập. Hệ thống sẽ gửi link reset về email của bạn.',
      category: 'account',
      views: 189,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18')
    },
    {
      id: 3,
      question: 'Tôi có thể huỷ đơn đặt phòng?',
      answer: 'Có, vào phần "Đơn đặt phòng" để huỷ. Lưu ý chính sách huỷ và phí (nếu có) tùy theo loại phòng.',
      category: 'booking',
      views: 156,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-19')
    },
    {
      id: 4,
      question: 'Các phương thức thanh toán nào được chấp nhận?',
      answer: 'Chúng tôi chấp nhận thẻ tín dụng (Visa, MasterCard), chuyển khoản ngân hàng, và ví điện tử (MoMo, ZaloPay).',
      category: 'payment',
      views: 203,
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-21')
    },
    {
      id: 5,
      question: 'Dịch vụ spa có mở cửa 24/7?',
      answer: 'Dịch vụ spa mở cửa từ 8:00 đến 22:00 hàng ngày. Vui lòng đặt lịch trước để đảm bảo có chỗ.',
      category: 'service',
      views: 134,
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-22')
    },
    {
      id: 6,
      question: 'Làm sao để nâng cấp phòng?',
      answer: 'Liên hệ lễ tân hoặc gọi hotline để kiểm tra tình trạng phòng và nâng cấp (có thể phát sinh phí).',
      category: 'service',
      views: 98,
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-20')
    }
  ];

  supportTickets: SupportTicket[] = [
    {
      id: 1,
      customerName: 'Nguyễn Văn A',
      email: 'nguyen.a@email.com',
      subject: 'Không thể đăng nhập vào tài khoản',
      content: 'Tôi đã thử nhiều lần nhưng không thể đăng nhập. Hệ thống báo sai mật khẩu nhưng tôi chắc chắn nhập đúng.',
      status: 'pending',
      priority: 'high',
      createdAt: new Date('2024-01-22T10:30:00'),
      updatedAt: new Date('2024-01-22T10:30:00')
    },
    {
      id: 2,
      customerName: 'Trần Thị B',
      email: 'tran.b@email.com',
      subject: 'Yêu cầu hoàn tiền',
      content: 'Tôi muốn hủy đặt phòng do có việc đột xuất. Vui lòng hỗ trợ hoàn tiền theo chính sách.',
      status: 'in-progress',
      priority: 'medium',
      createdAt: new Date('2024-01-22T09:15:00'),
      updatedAt: new Date('2024-01-22T11:00:00')
    },
    {
      id: 3,
      customerName: 'Lê Văn C',
      email: 'le.c@email.com',
      subject: 'Phản hồi về chất lượng dịch vụ',
      content: 'Dịch vụ rất tuyệt vời! Nhân viên thân thiện và phòng ốc sạch sẽ. Tôi sẽ quay lại trong tương lai.',
      status: 'resolved',
      priority: 'low',
      createdAt: new Date('2024-01-21T16:45:00'),
      updatedAt: new Date('2024-01-22T08:30:00')
    },
    {
      id: 4,
      customerName: 'Phạm Thị D',
      email: 'pham.d@email.com',
      subject: 'Lỗi thanh toán',
      content: 'Tôi đã thanh toán thành công nhưng hệ thống vẫn hiển thị chưa thanh toán. Vui lòng kiểm tra.',
      status: 'pending',
      priority: 'urgent',
      createdAt: new Date('2024-01-22T14:20:00'),
      updatedAt: new Date('2024-01-22T14:20:00')
    }
  ];

  filteredFAQ: FAQItem[] = [];
  filteredTickets: SupportTicket[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.filteredFAQ = [...this.faqItems];
    this.filteredTickets = [...this.supportTickets];
    this.updateCounts();
  }

  // Listen for clicks outside the dropdown to close it
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const userProfileContainer = target.closest('.user-profile-container');

    if (!userProfileContainer) {
      this.showUserDropdown.set(false);
    }
  }

  // User Dropdown Methods
  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.showUserDropdown.set(!this.showUserDropdown());
  }

  goToProfile(): void {
    this.showUserDropdown.set(false);

    // Navigate to profile page
    this.router.navigate(['/profile']).then(() => {
      this.showSuccessToast('Chuyển đến trang Profile');
    }).catch(() => {
      // If profile route doesn't exist, show error message
      this.showErrorToast('Trang Profile chưa được tạo. Vui lòng tạo route /profile');
    });
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

    // Clear any stored data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('authToken');

    // Show logout message
    this.showSuccessToast('Đăng xuất thành công. Đang chuyển hướng...');

    // Navigate to login page after a short delay
    setTimeout(() => {
      this.router.navigate(['/login']).catch(() => {
        // If login route doesn't exist, navigate to root
        this.router.navigate(['/']);
      });
    }, 1500);
  }

  // Utility methods
  getRoleDisplayName(): string {
    const roleMap: { [key: string]: string } = {
      'admin': 'Quản trị viên',
      'manager': 'Quản lý',
      'user': 'Người dùng',
      'staff': 'Nhân viên'
    };
    return roleMap[this.userProfile().role.toLowerCase()] || 'Người dùng';
  }

  updateCounts(): void {
    this.unresolvedTicketsCount = this.supportTickets.filter(t => t.status !== 'resolved').length;
    this.pendingTicketsCount = this.supportTickets.filter(t => t.status === 'pending').length;
    this.resolvedTicketsCount = this.supportTickets.filter(t => t.status === 'resolved').length;
    this.totalFAQCount = this.faqItems.length;
  }

  // Form validation
  validateForm(): boolean {
    this.formErrors = { question: '', answer: '', category: '' };
    let isValid = true;

    if (!this.newFAQ.question.trim()) {
      this.formErrors.question = 'Vui lòng nhập câu hỏi';
      isValid = false;
    }

    if (!this.newFAQ.answer.trim()) {
      this.formErrors.answer = 'Vui lòng nhập câu trả lời';
      isValid = false;
    }

    if (!this.newFAQ.category) {
      this.formErrors.category = 'Vui lòng chọn danh mục';
      isValid = false;
    }

    return isValid;
  }

  // FAQ Management
  toggleAddFAQ(): void {
    this.showAddFAQ = !this.showAddFAQ;
    if (!this.showAddFAQ) {
      this.resetNewFAQ();
    }
  }

  addFAQ(event: Event): void {
    event.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    const newFAQItem: FAQItem = {
      id: this.faqItems.length + 1,
      question: this.newFAQ.question.trim(),
      answer: this.newFAQ.answer.trim(),
      category: this.newFAQ.category,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.faqItems.unshift(newFAQItem);
    this.filterFAQ(this.selectedCategory);
    this.resetNewFAQ();
    this.showAddFAQ = false;
    this.updateCounts();
  }

  resetNewFAQ(): void {
    this.newFAQ = {
      question: '',
      answer: '',
      category: ''
    };
    this.formErrors = { question: '', answer: '', category: '' };
  }

  cancelAddFAQ(): void {
    this.resetNewFAQ();
    this.showAddFAQ = false;
  }

  editFAQ(id: number): void {
    const faq = this.faqItems.find(f => f.id === id);
    if (faq) {
      this.editingFAQ = id;
      this.editFAQData = {
        question: faq.question,
        answer: faq.answer,
        category: faq.category
      };
    }
  }

  updateFAQ(event: Event, id: number): void {
    event.preventDefault();

    const faq = this.faqItems.find(f => f.id === id);
    if (faq && this.editFAQData.question.trim() && this.editFAQData.answer.trim()) {
      faq.question = this.editFAQData.question.trim();
      faq.answer = this.editFAQData.answer.trim();
      faq.category = this.editFAQData.category;
      faq.updatedAt = new Date();
      this.editingFAQ = null;
      this.filterFAQ(this.selectedCategory);
    }
  }

  cancelEdit(): void {
    this.editingFAQ = null;
    this.editFAQData = { question: '', answer: '', category: '' };
  }

  deleteFAQ(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa FAQ này?')) {
      this.faqItems = this.faqItems.filter(f => f.id !== id);
      this.filterFAQ(this.selectedCategory);
      this.updateCounts();
    }
  }

  toggleFAQ(id: number): void {
    const faq = this.faqItems.find(f => f.id === id);
    if (faq) {
      faq.expanded = !faq.expanded;
      if (faq.expanded) {
        faq.views++;
      }
    }
  }

  filterFAQ(category: string): void {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredFAQ = [...this.faqItems];
    } else {
      this.filteredFAQ = this.faqItems.filter(f => f.category === category);
    }

    if (this.searchText.trim()) {
      this.searchFAQ();
    }
  }

  searchFAQ(): void {
    if (!this.searchText.trim()) {
      this.filterFAQ(this.selectedCategory);
      return;
    }

    const searchTerm = this.searchText.toLowerCase();
    this.filteredFAQ = this.faqItems.filter(f =>
      (this.selectedCategory === 'all' || f.category === this.selectedCategory) &&
      (f.question.toLowerCase().includes(searchTerm) ||
       f.answer.toLowerCase().includes(searchTerm))
    );
  }

  // Support Tickets
  filterTickets(): void {
    if (this.selectedTicketStatus === 'all') {
      this.filteredTickets = [...this.supportTickets];
    } else {
      this.filteredTickets = this.supportTickets.filter(t => t.status === this.selectedTicketStatus);
    }
  }

  updateTicketStatus(id: number, status: SupportTicket['status']): void {
    const ticket = this.supportTickets.find(t => t.id === id);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date();
      this.filterTickets();
      this.updateCounts();
    }
  }

  replyTicket(id: number): void {
    console.log('Reply to ticket:', id);
    alert('Chức năng trả lời ticket sẽ được phát triển trong phiên bản tiếp theo');
  }

  deleteTicket(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa yêu cầu này?')) {
      this.supportTickets = this.supportTickets.filter(t => t.id !== id);
      this.filterTickets();
      this.updateCounts();
    }
  }

  // Utility functions
  getCategoryLabel(category: string): string {
    const cat = this.faqCategories.find(c => c.value === category);
    return cat ? cat.label : category;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Chờ xử lý',
      'in-progress': 'Đang xử lý',
      'resolved': 'Đã giải quyết'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'low': 'Thấp',
      'medium': 'Trung bình',
      'high': 'Cao',
      'urgent': 'Khẩn cấp'
    };
    return labels[priority] || priority;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Quick Actions
  exportFAQ(): void {
    console.log('Exporting FAQ...');
    alert('Chức năng xuất FAQ sẽ được phát triển trong phiên bản tiếp theo');
  }

  importFAQ(): void {
    console.log('Importing FAQ...');
    alert('Chức năng nhập FAQ sẽ được phát triển trong phiên bản tiếp theo');
  }

  generateReport(): void {
    console.log('Generating report...');
    alert('Chức năng tạo báo cáo sẽ được phát triển trong phiên bản tiếp theo');
  }

  backupData(): void {
    console.log('Backing up data...');
    alert('Chức năng sao lưu dữ liệu sẽ được phát triển trong phiên bản tiếp theo');
  }

  // Toast methods
  private showSuccessToast(message: string): void {
    this.showToastMessage('success', 'Thành công', message);
  }

  private showErrorToast(message: string): void {
    this.showToastMessage('error', 'Lỗi', message);
  }

  private showWarningToast(message: string): void {
    this.showToastMessage('warning', 'Cảnh báo', message);
  }

  private showInfoToast(message: string): void {
    this.showToastMessage('info', 'Thông tin', message);
  }

  private showToastMessage(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string): void {
    this.toastType.set(type);
    this.toastTitle.set(title);
    this.toastMessage.set(message);
    this.showToast.set(true);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideToast();
    }, 5000);
  }

  hideToast(): void {
    this.showToast.set(false);
  }

  getToastIcon(): string {
    const type = this.toastType();
    const iconClasses = {
      success: 'success-icon',
      error: 'error-icon',
      warning: 'warning-icon',
      info: 'info-icon'
    };
    return iconClasses[type] || 'info-icon';
  }
  logout(): void {
    this.authService.logout(); // gọi hàm đã có trong auth.service.ts
  }
}
