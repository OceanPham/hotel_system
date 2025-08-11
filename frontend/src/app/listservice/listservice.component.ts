import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { API_URL } from '../../constants';

interface Service {
  id: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}
interface LoggedInUser {
  fullName: string;
}
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}
@Component({
  selector: 'app-listservice',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './listservice.component.html',
  styleUrls: ['./listservice.component.css'],
})
export class ListserviceComponent {
  authService = inject(AuthService);
  private http = inject(HttpClient);

  services = signal<Service[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  newService = signal<Partial<Service> & { imageFile?: File }>({
    name: '',
    price: 0,
    description: '',
  });

  editingService = signal<Partial<Service> & { imageFile?: File }>({});
  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('success');
  toastTitle = signal('');
  toastMessage = signal('');
  currentRoute = signal<string>('/dashboard');
  currentPage = signal(1);
  itemsPerPage = signal(7);
  searchQuery = signal('');
  selectedPriceRange = signal('');
  selectedServiceType = signal('');
  showLogoutModal = signal(false);
  showAddServiceModal = signal(false);
  showEditServiceModal = signal(false);
  showConfirmationModal = signal(false);
  pendingAction: (() => void) | null = null;

  ngOnInit(): void {
    this.fetchServices();
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

  fetchServices() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.http
      .get<{ status: string; data: Service[] }>(
        `${API_URL}/api/v1/hotel-services`
      )
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError((err) => {
          this.errorMessage.set(
            'Không thể tải dữ liệu dịch vụ. Vui lòng thử lại sau.'
          );
          return of({ status: 'error', data: [] });
        })
      )
      .subscribe({
        next: (res) => {
          this.services.set(Array.isArray(res.data) ? res.data : []);
        },
      });
  }

  createService() {
    const service = this.newService();
    this.errorMessage.set('');
    this.successMessage.set('');

    if (
      !service.name ||
      service.price === undefined ||
      service.price === null
    ) {
      this.errorMessage.set('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    const formData = new FormData();

    const dto = {
      name: service.name,
      price: service.price,
      description: service.description || '',
    };

    formData.append(
      'service',
      new Blob([JSON.stringify(dto)], { type: 'application/json' })
    );

    if (service.imageFile instanceof File) {
      formData.append('image', service.imageFile);
    }

    this.isLoading.set(true);
    this.http
      .post(`${API_URL}/api/v1/hotel-services`, formData)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Thêm dịch vụ thành công');
          this.showAddServiceModal.set(false);
          this.fetchServices();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (err) => {
          console.error('Create failed:', err);
          this.errorMessage.set('Thêm dịch vụ thất bại. Vui lòng thử lại.');
        },
      });
  }

  updateService() {
    const service = this.editingService();
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!service.id || !service.name) {
      this.errorMessage.set('Thiếu thông tin để cập nhật.');
      return;
    }

    const formData = new FormData();
    const dto = {
      name: service.name,
      price: service.price ?? 0,
      description: service.description ?? '',
    };
    formData.append(
      'service',
      new Blob([JSON.stringify(dto)], { type: 'application/json' })
    );

    if (service.imageFile instanceof File) {
      formData.append('image', service.imageFile);
    }

    this.isLoading.set(true);
    this.http
      .put(`${API_URL}/api/v1/hotel-services/${service.id}`, formData)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Cập nhật dịch vụ thành công');
          this.showEditServiceModal.set(false);
          this.fetchServices();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (err) => {
          console.error('Update failed:', err);
          this.errorMessage.set('Cập nhật dịch vụ thất bại. Vui lòng thử lại.');
        },
      });
  }

  deleteService(id: number) {
    this.isLoading.set(true);
    this.http
      .delete(`${API_URL}/api/v1/hotel-services/${id}`)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Xóa dịch vụ thành công');
          this.fetchServices();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: () => {
          this.errorMessage.set('Xóa dịch vụ thất bại. Vui lòng thử lại.');
        },
      });
  }

  // File selection handler
  onFileSelected(event: Event, type: 'new' | 'edit') {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    if (type === 'new') {
      this.newService.update((s) => ({ ...s, imageFile: file }));
    } else {
      this.editingService.update((s) => ({ ...s, imageFile: file }));
    }
  }

  // Filtering & Pagination
  filteredServices = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const priceRange = this.selectedPriceRange();
    const serviceType = this.selectedServiceType();

    return this.services().filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(q) ||
        (service.description?.toLowerCase()?.includes(q) ?? false);

      let matchesPrice = true;
      if (priceRange) {
        const price = service.price;
        switch (priceRange) {
          case 'under-100k':
            matchesPrice = price < 100000;
            break;
          case '100k-500k':
            matchesPrice = price >= 100000 && price <= 500000;
            break;
          case '500k-1m':
            matchesPrice = price >= 500000 && price <= 1000000;
            break;
          case 'over-1m':
            matchesPrice = price > 1000000;
            break;
        }
      }

      let matchesType = true;
      if (serviceType) {
        const name = service.name.toLowerCase();
        switch (serviceType) {
          case 'food':
            matchesType = name.includes('ăn') || name.includes('thức');
            break;
          case 'spa':
            matchesType = name.includes('spa') || name.includes('massage');
            break;
          case 'transport':
            matchesType = name.includes('xe') || name.includes('vận chuyển');
            break;
          case 'entertainment':
            matchesType = name.includes('giải trí');
            break;
          case 'other':
            matchesType =
              !name.includes('ăn') &&
              !name.includes('spa') &&
              !name.includes('xe');
            break;
        }
      }

      return matchesSearch && matchesPrice && matchesType;
    });
  });

  paginatedServices = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredServices().slice(start, start + this.itemsPerPage());
  });

  totalPages = computed(() => {
    const total = this.filteredServices().length;
    return Math.max(1, Math.ceil(total / this.itemsPerPage()));
  });

  openAddModal() {
    this.newService.set({
      name: '',
      price: 0,
      description: '',
      imageFile: undefined,
    });
    this.errorMessage.set('');
    this.showAddServiceModal.set(true);
  }

  openEditModal(service: Service) {
    this.editingService.set({ ...service });
    this.errorMessage.set('');
    this.showEditServiceModal.set(true);
  }

  confirmDelete(service: Service) {
    this.pendingAction = () => this.deleteService(service.id);
    this.showConfirmationModal.set(true);
  }

  executePending() {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
      this.showConfirmationModal.set(false);
    }
  }

  cancelConfirmation() {
    this.pendingAction = null;
    this.showConfirmationModal.set(false);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
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

  showUserDropdown = signal(false);

  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.showUserDropdown.set(!this.showUserDropdown());
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

  constructor(private router: Router) {
    // Set initial route based on current URL
    this.currentRoute.set(this.router.url || '/dashboard');
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
    this.selectedPriceRange.set('');
    this.selectedServiceType.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.fetchServices();
    this.showSuccess('Dữ liệu đã được làm mới thành công');
  }
  logout(): void {
    this.authService.logout(); // gọi hàm đã có trong auth.service.ts
  }
}
