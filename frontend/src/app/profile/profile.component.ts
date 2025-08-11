import { Component, signal, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { API_URL } from '../../constants';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  showUserDropdown = signal(false);
  showLogoutModal = signal(false);
  isEditMode = signal(false);

  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('success');
  toastTitle = signal('');
  toastMessage = signal('');

  userProfile = signal<UserProfile>({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    nationality: '',
    role: '',
    status: '',
  });

  authService = inject(AuthService);
  profileForm: FormGroup;
  readonly apiBaseUrl = `${API_URL}/api/users`;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private http: HttpClient
  ) {
    this.profileForm = this.createProfileForm();
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile-container')) {
      this.showUserDropdown.set(false);
    }
  }

  private createProfileForm(): FormGroup {
    const profile = this.userProfile();
    return this.fb.group({
      fullName: [
        profile.fullName,
        [Validators.required, Validators.minLength(2)],
      ],
      email: [profile.email, [Validators.required, Validators.email]],
      phone: [profile.phone, [Validators.pattern(/^[\+]?[0-9\s\-\(\)]+$/)]],
      gender: [profile.gender],
      nationality: [profile.nationality],
    });
  }

  private loadUserProfile(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    const username = localStorage.getItem('username');
    if (!username) return;

    this.http.get<any>(`${this.apiBaseUrl}/${username}`).subscribe({
      next: (res) => {
        if (res?.status === 'SUCCESS') {
          const profile: UserProfile = res.data;
          this.userProfile.set(profile);
          this.profileForm.patchValue(profile);
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('userProfile', JSON.stringify(profile));
          }
        }
      },
      error: () => this.showErrorToast('Không thể tải thông tin người dùng'),
    });
  }

  goBack(): void {
    this.location.back();
  }

  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.showUserDropdown.set(!this.showUserDropdown());
  }

  goToSettings(): void {
    this.showUserDropdown.set(false);
    this.router.navigate(['/settings']);
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
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.showSuccessToast('Đăng xuất thành công. Đang chuyển hướng...');
    setTimeout(
      () =>
        this.router
          .navigate(['/login'])
          .catch(() => this.router.navigate(['/'])),
      1500
    );
  }

  toggleEditMode(): void {
    if (this.isEditMode()) {
      this.cancelEdit();
    } else {
      this.isEditMode.set(true);
    }
  }

  cancelEdit(): void {
    this.isEditMode.set(false);
    this.updateProfileForm();
  }

  private updateProfileForm(): void {
    this.profileForm.patchValue(this.userProfile());
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.showErrorToast('Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    const username = this.userProfile().username;
    const updatedData = {
      ...this.userProfile(),
      ...this.profileForm.value,
    };

    this.http.put(`${this.apiBaseUrl}/${username}`, updatedData).subscribe({
      next: () => {
        this.userProfile.set(updatedData);
        this.isEditMode.set(false);
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('userProfile', JSON.stringify(updatedData));
        }
        this.showSuccessToast('Thông tin cá nhân đã được cập nhật');
      },
      error: () => this.showErrorToast('Lỗi khi cập nhật thông tin cá nhân'),
    });
  }

  getRoleBadgeClass(): string {
    const role = this.userProfile().role.toLowerCase();
    return `profile-role-badge ${role}`;
  }

  getRoleDisplayName(): string {
    const roleMap: { [key: string]: string } = {
      accountant: 'Kế toán',
      user: 'Người dùng',
      staff: 'Nhân viên',
    };
    return roleMap[this.userProfile().role.toLowerCase()] || 'Người dùng';
  }

  private showSuccessToast(message: string): void {
    this.showToastMessage('success', 'Thành công', message);
  }

  private showErrorToast(message: string): void {
    this.showToastMessage('error', 'Lỗi', message);
  }

  private showToastMessage(
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ): void {
    this.toastType.set(type);
    this.toastTitle.set(title);
    this.toastMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => this.hideToast(), 5000);
  }

  hideToast(): void {
    this.showToast.set(false);
  }

  getToastIcon(): string {
    const iconMap = {
      success: 'success-icon',
      error: 'error-icon',
      warning: 'warning-icon',
      info: 'info-icon',
    };
    return iconMap[this.toastType()] || 'info-icon';
  }
}

// 👇 Khai báo UserProfile trực tiếp trong file (Cách 1)
interface UserProfile {
  id?: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  nationality: string;
  role: string;
  status: string;
}
