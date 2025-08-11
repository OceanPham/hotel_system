import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_URL } from '../../constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${API_URL}/api/users`;

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password });
  }

  saveAuthData(token: string, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('username', user.username);
    localStorage.setItem('role', user.role);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  logout(): void {
    // Gọi API nếu muốn thông báo logout (không bắt buộc)
    this.http.post('/api/users/logout', {}).subscribe({
      next: () => {
        // Xóa dữ liệu localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        this.router.navigate(['/login']);
      },
      error: () => {
        // Dù lỗi vẫn cứ xóa localStorage
        localStorage.clear();
        this.router.navigate(['/login']);
      },
    });
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
