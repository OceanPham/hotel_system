import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { API_URL } from '../../constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  rememberMe: boolean = false;
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin.';
      return;
    }

    const payload = {
      username: this.username,
      password: this.password,
    };

    this.http.post<any>(`${API_URL}/api/users/login`, payload).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') {
          const token = res.data.token;
          const user = res.data.user;

          // ✅ Lưu vào localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('username', user.username);
          localStorage.setItem('role', user.role);
          localStorage.setItem('user', JSON.stringify(user));
          // ✅ Điều hướng theo role
          switch (user.role) {
            case 'STAFF':
              this.router.navigate(['/dashboard']);
              break;
            case 'USER':
              this.router.navigate(['/']);
              break;
            case 'ACCOUNTANT':
              this.router.navigate(['/thongke']);
              break;
            default:
              this.router.navigate(['/']);
          }

          this.errorMessage = '';
        } else {
          this.errorMessage = '❌ Đăng nhập thất bại.';
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.errorMessage = '❌ Sai tên đăng nhập hoặc mật khẩu.';
        } else {
          this.errorMessage = '❌ Lỗi máy chủ, vui lòng thử lại sau.';
        }
      },
    });
  }

  navigateToSignUp() {
    this.router.navigate(['/signup']);
  }
}
