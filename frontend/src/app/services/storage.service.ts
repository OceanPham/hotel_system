import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Kiểm tra xem localStorage có khả dụng không
   */
  isLocalStorageAvailable(): boolean {
    return (
      isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined'
    );
  }

  /**
   * Lấy giá trị từ localStorage
   */
  getItem(key: string): string | null {
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage không khả dụng');
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Lỗi khi đọc localStorage key ${key}:`, error);
      return null;
    }
  }

  /**
   * Lưu giá trị vào localStorage
   */
  setItem(key: string, value: string): boolean {
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage không khả dụng');
      return false;
    }
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Lỗi khi lưu localStorage key ${key}:`, error);
      return false;
    }
  }

  /**
   * Xóa một key khỏi localStorage
   */
  removeItem(key: string): boolean {
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage không khả dụng');
      return false;
    }
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Lỗi khi xóa localStorage key ${key}:`, error);
      return false;
    }
  }

  /**
   * Xóa tất cả localStorage
   */
  clear(): boolean {
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage không khả dụng');
      return false;
    }
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa localStorage:', error);
      return false;
    }
  }

  /**
   * Lấy và parse JSON từ localStorage
   */
  getJSON(key: string): any {
    const item = this.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch (error) {
      console.error(`Lỗi khi parse JSON từ localStorage key ${key}:`, error);
      return null;
    }
  }

  /**
   * Lưu object dưới dạng JSON vào localStorage
   */
  setJSON(key: string, value: any): boolean {
    try {
      const jsonString = JSON.stringify(value);
      return this.setItem(key, jsonString);
    } catch (error) {
      console.error(
        `Lỗi khi stringify JSON cho localStorage key ${key}:`,
        error
      );
      return false;
    }
  }
}
