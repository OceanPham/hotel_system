import {
  Component,
  signal,
  computed,
  OnInit,
  HostListener,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  address: string;
  avatar: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
}

interface NotificationOption {
  key: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface SystemSettings {
  theme: string;
  language: string;
  timezone: string;
  itemsPerPage: number;
  collapsedSidebar: boolean;
  animations: boolean;
}

interface SettingTab {
  key: string;
  label: string;
  iconClass: string;
}

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.css',
})
export class SettingComponent implements OnInit {
  authService = inject(AuthService);
  searchQuery = '';
  activeTab = signal('profile');
  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('success');
  toastTitle = signal('');
  toastMessage = signal('');

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  // User dropdown signals
  showUserDropdown = signal(false);
  showLogoutModal = signal(false);

  settingTabs: SettingTab[] = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      iconClass: 'icon profile-icon',
    },
    { key: 'security', label: 'Bảo mật', iconClass: 'icon security-icon' },
    {
      key: 'notifications',
      label: 'Thông báo',
      iconClass: 'icon notification-tab-icon',
    },
    { key: 'system', label: 'Hệ thống', iconClass: 'icon system-icon' },
  ];

  themeOptions = [
    { key: 'light', name: 'Sáng', class: 'light' },
    { key: 'dark', name: 'Tối', class: 'dark' },
    { key: 'auto', name: 'Tự động', class: 'auto' },
  ];

  userProfile = signal<UserProfile>({
    name: 'Salman Faris',
    email: 'salman.faris@lankastay.com',
    phone: '+84 912 345 678',
    role: 'admin',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  });

  securitySettings = signal<SecuritySettings>({
    twoFactorEnabled: false,
    loginNotifications: true,
  });

  systemSettings = signal<SystemSettings>({
    theme: 'light',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    itemsPerPage: 10,
    collapsedSidebar: false,
    animations: true,
  });

  emailNotificationOptions: NotificationOption[] = [
    {
      key: 'newBooking',
      title: 'Đặt phòng mới',
      description: 'Nhận thông báo khi có đặt phòng mới',
      enabled: true,
    },
    {
      key: 'paymentReceived',
      title: 'Thanh toán thành công',
      description: 'Thông báo khi nhận được thanh toán từ khách hàng',
      enabled: true,
    },
    {
      key: 'bookingCancellation',
      title: 'Hủy đặt phòng',
      description: 'Thông báo khi khách hàng hủy đặt phòng',
      enabled: true,
    },
    {
      key: 'systemUpdates',
      title: 'Cập nhật hệ thống',
      description: 'Nhận thông báo về các cập nhật và bảo trì hệ thống',
      enabled: false,
    },
  ];

  pushNotificationOptions: NotificationOption[] = [
    {
      key: 'urgentBooking',
      title: 'Đặt phòng khẩn cấp',
      description: 'Thông báo ngay lập tức cho đặt phòng cần xử lý gấp',
      enabled: true,
    },
    {
      key: 'checkInReminder',
      title: 'Nhắc nhở check-in',
      description: 'Nhắc nhở trước 30 phút khi khách check-in',
      enabled: true,
    },
    {
      key: 'maintenanceAlert',
      title: 'Cảnh báo bảo trì',
      description: 'Thông báo khi phòng cần bảo trì hoặc sửa chữa',
      enabled: false,
    },
  ];

  profileForm: FormGroup;
  securityForm: FormGroup;
  systemForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.profileForm = this.createProfileForm();
    this.securityForm = this.createSecurityForm();
    this.systemForm = this.createSystemForm();
  }

  ngOnInit() {
    console.log('SettingComponent initialized');
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
    console.log('Toggle dropdown clicked', this.showUserDropdown());
    this.showUserDropdown.set(!this.showUserDropdown());
  }

  goToProfile(): void {
    console.log('Go to profile clicked');
    this.showUserDropdown.set(false);

    // Navigate to profile page
    this.router
      .navigate(['/profile'])
      .then(() => {
        this.showSuccessToast('Chuyển đến trang Profile');
      })
      .catch(() => {
        // If profile route doesn't exist, show error message
        this.showErrorToast(
          'Trang Profile chưa được tạo. Vui lòng tạo route /profile'
        );
      });
  }
  logout(): void {
    this.authService.logout(); // gọi hàm đã có trong auth.service.ts
  }
  showLogoutConfirmation(): void {
    console.log('Logout clicked');
    this.showUserDropdown.set(false);
    this.showLogoutModal.set(true);
  }

  cancelLogout(): void {
    this.showLogoutModal.set(false);
  }

  confirmLogout(): void {
    console.log('Confirm logout');
    this.showLogoutModal.set(false);

    // Clear any stored data
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('authToken');
    }

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

  private createProfileForm(): FormGroup {
    const profile = this.userProfile();
    return this.fb.group({
      name: [profile.name, [Validators.required, Validators.minLength(2)]],
      email: [profile.email, [Validators.required, Validators.email]],
      phone: [profile.phone, [Validators.pattern(/^[\+]?[0-9\s\-\(\)]+$/)]],
      role: [profile.role, Validators.required],
      address: [profile.address],
    });
  }

  private createSecurityForm(): FormGroup {
    return this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.passwordValidator,
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private createSystemForm(): FormGroup {
    const settings = this.systemSettings();
    return this.fb.group({
      theme: [settings.theme, Validators.required],
      language: [settings.language, Validators.required],
      timezone: [settings.timezone, Validators.required],
      itemsPerPage: [
        settings.itemsPerPage,
        [Validators.required, Validators.min(5), Validators.max(100)],
      ],
    });
  }

  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[#?!@$%^&*-]/.test(value);

    const valid = hasNumber && hasUpper && hasLower && hasSpecial;
    return valid ? null : { passwordStrength: true };
  }

  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) return null;

    return newPassword.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  passwordStrength = computed(() => {
    const password = this.securityForm?.get('newPassword')?.value || '';
    let strength = 0;

    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[#?!@$%^&*-]/.test(password)) strength += 15;

    return Math.min(strength, 100);
  });

  getPasswordStrengthText(): string {
    const strength = this.passwordStrength();
    if (strength < 30) return 'Yếu';
    if (strength < 60) return 'Trung bình';
    if (strength < 80) return 'Mạnh';
    return 'Rất mạnh';
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  triggerAvatarUpload(): void {
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    input?.click();
  }

  onAvatarChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const currentProfile = this.userProfile();
        this.userProfile.set({
          ...currentProfile,
          avatar: e.target?.result as string,
        });
        this.showSuccessToast('Ảnh đại diện đã được cập nhật');
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      const formData = this.profileForm.value;
      const currentProfile = this.userProfile();

      this.userProfile.set({
        ...currentProfile,
        ...formData,
      });

      // Save to localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('userProfile', JSON.stringify(this.userProfile()));
      }

      this.showSuccessToast('Thông tin cá nhân đã được lưu thành công');
    }
  }

  resetProfileForm(): void {
    const profile = this.userProfile();
    this.profileForm.patchValue({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
      address: profile.address,
    });
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword.set(!this.showCurrentPassword());
        break;
      case 'new':
        this.showNewPassword.set(!this.showNewPassword());
        break;
      case 'confirm':
        this.showConfirmPassword.set(!this.showConfirmPassword());
        break;
    }
  }

  changePassword(): void {
    if (this.securityForm.valid) {
      // Simulate password change
      this.showSuccessToast('Mật khẩu đã được thay đổi thành công');
      this.securityForm.reset();
    }
  }

  resetSecurityForm(): void {
    this.securityForm.reset();
  }

  toggleTwoFactor(event: any): void {
    const settings = this.securitySettings();
    this.securitySettings.set({
      ...settings,
      twoFactorEnabled: event.target.checked,
    });

    if (event.target.checked) {
      this.showInfoToast('Xác thực hai yếu tố đã được bật');
    } else {
      this.showInfoToast('Xác thực hai yếu tố đã được tắt');
    }
  }

  toggleLoginNotifications(event: any): void {
    const settings = this.securitySettings();
    this.securitySettings.set({
      ...settings,
      loginNotifications: event.target.checked,
    });
  }

  toggleEmailNotification(key: string, event: any): void {
    const option = this.emailNotificationOptions.find((opt) => opt.key === key);
    if (option) {
      option.enabled = event.target.checked;
    }
  }

  togglePushNotification(key: string, event: any): void {
    const option = this.pushNotificationOptions.find((opt) => opt.key === key);
    if (option) {
      option.enabled = event.target.checked;
    }
  }

  saveNotificationSettings(): void {
    this.showSuccessToast('Cài đặt thông báo đã được lưu');
  }

  resetNotificationSettings(): void {
    // Reset to default values
    this.emailNotificationOptions.forEach((option) => {
      option.enabled = [
        'newBooking',
        'paymentReceived',
        'bookingCancellation',
      ].includes(option.key);
    });

    this.pushNotificationOptions.forEach((option) => {
      option.enabled = ['urgentBooking', 'checkInReminder'].includes(
        option.key
      );
    });

    this.showInfoToast('Cài đặt thông báo đã được đặt lại về mặc định');
  }

  saveSystemSettings(): void {
    if (this.systemForm.valid) {
      const formData = this.systemForm.value;
      const currentSettings = this.systemSettings();

      this.systemSettings.set({
        ...currentSettings,
        ...formData,
      });

      this.showSuccessToast('Cài đặt hệ thống đã được lưu');
    }
  }

  resetSystemForm(): void {
    const defaultSettings: SystemSettings = {
      theme: 'light',
      language: 'vi',
      timezone: 'Asia/Ho_Chi_Minh',
      itemsPerPage: 10,
      collapsedSidebar: false,
      animations: true,
    };

    this.systemSettings.set(defaultSettings);
    this.systemForm.patchValue(defaultSettings);
    this.showInfoToast('Cài đặt hệ thống đã được khôi phục về mặc định');
  }

  toggleSidebarCollapse(event: any): void {
    const settings = this.systemSettings();
    this.systemSettings.set({
      ...settings,
      collapsedSidebar: event.target.checked,
    });
  }

  toggleAnimations(event: any): void {
    const settings = this.systemSettings();
    this.systemSettings.set({
      ...settings,
      animations: event.target.checked,
    });
  }

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

  private showToastMessage(
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ): void {
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
      info: 'info-icon',
    };
    return iconClasses[type] || 'info-icon';
  }
}
