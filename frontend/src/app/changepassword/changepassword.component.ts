import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { API_URL } from '../../constants';

@Component({
  selector: 'app-changepassword',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './changepassword.component.html',
  styleUrl: './changepassword.component.css',
})
export class ChangePasswordComponent {
  username = '';
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  message = '';
  messageType: 'success' | 'error' | '' = '';

  readonly apiBaseUrl = `${API_URL}/api/users`;

  constructor(private http: HttpClient, private router: Router) {
    // ✅ Lấy username từ localStorage sau khi đăng nhập
    const stored = localStorage.getItem('user');
    if (stored) {
      this.username = JSON.parse(stored).username;
    }
  }

  onSubmit() {
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.showMessage('❌ Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showMessage('❌ Mật khẩu mới không khớp', 'error');
      return;
    }

    const payload = {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
    };

    this.http
      .put(`${this.apiBaseUrl}/${this.username}/change-password`, payload)
      .subscribe({
        next: (res: any) => {
          if (res.status === 'SUCCESS') {
            this.showMessage('✅ Đổi mật khẩu thành công', 'success');
            setTimeout(() => this.router.navigate(['/profile']), 2000);
          } else {
            this.showMessage(
              res.message || '❌ Đổi mật khẩu thất bại',
              'error'
            );
          }
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 400) {
            this.showMessage('❌ Mật khẩu cũ không đúng', 'error');
          } else if (err.status === 404) {
            this.showMessage('❌ Người dùng không tồn tại', 'error');
          } else {
            this.showMessage('❌ Lỗi hệ thống, vui lòng thử lại', 'error');
          }
        },
      });
  }

  private showMessage(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 4000);
  }
}
