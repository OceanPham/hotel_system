import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_URL } from '../../constants';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${API_URL}/api/users`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService
  ) {}

  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password });
  }

  saveAuthData(token: string, user: any) {
    this.storageService.setItem('token', token);
    this.storageService.setItem('username', user.username);
    this.storageService.setItem('role', user.role);
  }

  getToken(): string | null {
    return this.storageService.getItem('token');
  }

  getUsername(): string | null {
    return this.storageService.getItem('username');
  }

  getRole(): string | null {
    return this.storageService.getItem('role');
  }

  logout(): void {
    // Gọi API nếu muốn thông báo logout (không bắt buộc)
    this.http.post('/api/users/logout', {}).subscribe({
      next: () => {
        // Xóa dữ liệu localStorage
        this.storageService.removeItem('token');
        this.storageService.removeItem('username');
        this.storageService.removeItem('role');
        this.router.navigate(['/login']);
      },
      error: () => {
        // Dù lỗi vẫn cứ xóa localStorage
        this.storageService.clear();
        this.router.navigate(['/login']);
      },
    });
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
