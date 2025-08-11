import {
  Component,
  signal,
  computed,
  HostListener,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {
  API_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from '../../constants';
interface RoomImage {
  id?: number;
  roomId?: number;
  imageUrl: string;
  file?: File;
  isMain?: boolean;
}

interface Room {
  id: number;
  roomNumber: string;
  roomName: string;
  roomType: 'Standard' | 'Deluxe' | 'Suite';
  basePrice: number;
  status: 'Vacant' | 'Booked' | 'Inactive';
  description: string;
  images: RoomImage[];
}

interface ConfirmationData {
  type: 'add' | 'edit' | 'delete';
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}
interface LoggedInUser {
  fullName: string;
  avatar: string;
}
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

@Component({
  selector: 'app-listroom',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './listroom.component.html',
  styleUrl: './listroom.component.css',
})
export class ListroomComponent implements OnInit {
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private apiBase = `${API_URL}/api/v1/rooms`;

  searchQuery = signal('');
  selectedRoomType = signal('');
  selectedStatus = signal('');
  currentPage = signal(1);
  itemsPerPage = signal(7);

  showAddRoomModal = signal(false);
  showEditRoomModal = signal(false);
  showConfirmationModal = signal(false);
  showLogoutModal = signal(false);
  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('success');
  toastTitle = signal('');
  toastMessage = signal('');
  currentRoute = signal<string>('/dashboard');
  rooms = signal<Room[]>([]);
  newRoom = signal<Room>({
    id: 0,
    roomName: '',
    roomNumber: '',
    roomType: 'Standard',
    basePrice: 0,
    status: 'Vacant',
    description: '',
    images: [],
  });
  editingRoom = signal<Room | null>(null);
  confirmationData = signal<ConfirmationData | null>(null);
  pendingAction: (() => void) | null = null;

  ngOnInit(): void {
    this.fetchRooms();

    if (isBrowser()) {
      const local = localStorage.getItem('userProfile');
      if (local) {
        const parsed = JSON.parse(local);
        this.userInfo.set({
          fullName: parsed.fullName || '',
          avatar: parsed.avatar || '',
        });
      }
    }
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
  userInfo = signal<LoggedInUser>({
    fullName: '',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
  });

  fetchRooms(): void {
    let params = new HttpParams();
    if (this.searchQuery()) params = params.set('roomName', this.searchQuery());
    if (this.selectedStatus())
      params = params.set('status', this.selectedStatus());
    if (this.selectedRoomType())
      params = params.set('roomType', this.selectedRoomType());

    this.http.get<any>(this.apiBase, { params }).subscribe({
      next: (res) => {
        if (res.status === 'Success') {
          this.rooms.set(res.data || []);
        } else {
          this.showError(res.retMsg || 'Lỗi tải phòng');
        }
      },
      error: () => this.showError('Không thể kết nối đến máy chủ'),
    });
  }

  addNewRoom(): void {
    this.newRoom.set({
      id: 0,
      roomName: '',
      roomNumber: '',
      roomType: 'Standard',
      basePrice: 0,
      status: 'Vacant',
      description: '',
      images: [],
    });
    this.showAddRoomModal.set(true);
  }

  addImageField(isEdit = false): void {
    const room = isEdit ? this.editingRoom() : this.newRoom();
    if (!room) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const imageUrl = URL.createObjectURL(file);
      const images = [...room.images];
      images.push({ imageUrl, file, isMain: images.length === 0 });
      const updatedRoom = { ...room, images };
      isEdit
        ? this.editingRoom.set(updatedRoom)
        : this.newRoom.set(updatedRoom);
    };
    input.click();
  }

  removeImageField(index: number, isEdit = false): void {
    const room = isEdit ? this.editingRoom() : this.newRoom();
    if (!room) return;
    const images = [...room.images];
    images.splice(index, 1);
    if (!images.some((img) => img.isMain) && images.length > 0) {
      images[0].isMain = true;
    }
    const updatedRoom = { ...room, images };
    isEdit ? this.editingRoom.set(updatedRoom) : this.newRoom.set(updatedRoom);
  }

  setMainImage(index: number, isEdit = false): void {
    const room = isEdit ? this.editingRoom() : this.newRoom();
    if (!room) return;
    const images = room.images.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    const updatedRoom = { ...room, images };
    isEdit ? this.editingRoom.set(updatedRoom) : this.newRoom.set(updatedRoom);
  }

  handleFileInput(event: Event, index: number, isEdit = false): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;
      const room = isEdit ? this.editingRoom() : this.newRoom();
      if (!room || !room.images[index]) return;
      room.images[index].imageUrl = imageUrl;
      room.images[index].file = file;
      isEdit
        ? this.editingRoom.set({ ...room })
        : this.newRoom.set({ ...room });
    };
    reader.readAsDataURL(file);
  }

  showAddConfirmation(): void {
    const nr = this.newRoom();

    console.log('data submit', nr);
    if (!nr.roomName || !nr.roomNumber) {
      this.showError('Vui lòng nhập đủ thông tin phòng');
      return;
    }
    const duplicate = this.rooms().some(
      (r) =>
        r.roomNumber === nr.roomNumber ||
        r.roomName.toLowerCase() === nr.roomName.toLowerCase()
    );
    if (duplicate) {
      this.showError('Phòng đã tồn tại');
      return;
    }

    this.confirmationData.set({
      type: 'add',
      title: 'Xác nhận thêm phòng',
      message: `Thêm "${nr.roomName}" với giá ${nr.basePrice}`,
      confirmText: 'Thêm',
      cancelText: 'Hủy',
    });
    this.pendingAction = () => {
      this.createRoomAPI(nr);
      this.showAddRoomModal.set(false);
    };
    this.showConfirmationModal.set(true);
  }

  async createRoomAPI(room: Room): Promise<void> {
    try {
      const uploadedUrls: { imageUrl: string; isMain?: boolean }[] = [];
      for (const img of room.images) {
        if (img.file) {
          const url = await this.uploadToCloudinary(img.file, 'hotel-rooms');
          if (!url) {
            this.showError('Upload ảnh thất bại');
            return;
          }
          uploadedUrls.push({ imageUrl: url, isMain: img.isMain });
        } else if (img.imageUrl) {
          uploadedUrls.push({ imageUrl: img.imageUrl, isMain: img.isMain });
        }
      }

      const payload = {
        roomNumber: room.roomNumber,
        roomName: room.roomName,
        roomType: this.toRoomType(room.roomType),
        basePrice: room.basePrice,
        status: this.toRoomStatus(room.status),
        description: room.description,
        images: uploadedUrls,
      };

      this.http
        .post<any>(this.apiBase, payload, {
          headers: { 'Content-Type': 'application/json' },
        })
        .subscribe({
          next: (res) => {
            res.status === 'Success'
              ? this.showSuccess(res.retMsg || 'Đã tạo phòng')
              : this.showError(res.retMsg || 'Tạo phòng thất bại');
            this.fetchRooms();
          },
          error: () => this.showError('Không thể kết nối'),
        });
    } catch (e) {
      this.showError('Có lỗi khi tạo phòng');
    }
  }

  showEditRoom(room: Room): void {
    this.editingRoom.set({ ...room });
    this.showEditRoomModal.set(true);
  }

  showEditConfirmation(): void {
    const er = this.editingRoom();
    if (!er) return;

    const duplicate = this.rooms().some(
      (r) =>
        r.id !== er.id &&
        (r.roomNumber.toLowerCase() === er.roomNumber.toLowerCase() ||
          r.roomName.toLowerCase() === er.roomName.toLowerCase())
    );
    if (duplicate) {
      this.showError('Phòng đã tồn tại');
      return;
    }

    this.confirmationData.set({
      type: 'edit',
      title: 'Xác nhận cập nhật',
      message: `Cập nhật "${er.roomName}"`,
      confirmText: 'Cập nhật',
      cancelText: 'Hủy',
    });
    this.pendingAction = () => {
      this.updateRoomAPI(er.id, er);
      this.showEditRoomModal.set(false);
    };
    this.showConfirmationModal.set(true);
  }

  async updateRoomAPI(id: number, room: Room): Promise<void> {
    try {
      const uploadedUrls: {
        id?: number;
        imageUrl: string;
        isMain?: boolean;
      }[] = [];
      for (const img of room.images) {
        if (img.file) {
          const url = await this.uploadToCloudinary(img.file, 'hotel-rooms');
          if (!url) {
            this.showError('Upload ảnh thất bại');
            return;
          }
          uploadedUrls.push({ imageUrl: url, isMain: img.isMain });
        } else if (img.imageUrl) {
          uploadedUrls.push({
            id: img.id,
            imageUrl: img.imageUrl,
            isMain: img.isMain,
          });
        }
      }

      const payload = {
        id: room.id,
        roomNumber: room.roomNumber,
        roomName: room.roomName,
        roomType: this.toRoomType(room.roomType),
        basePrice: room.basePrice,
        status: this.toRoomStatus(room.status),
        description: room.description,
        images: uploadedUrls,
      };

      this.http
        .put<any>(`${this.apiBase}/${id}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        })
        .subscribe({
          next: (res) => {
            res.status === 'Success'
              ? this.showSuccess(res.retMsg || 'Đã cập nhật phòng')
              : this.showError(res.retMsg || 'Cập nhật phòng thất bại');
            this.fetchRooms();
          },
          error: () => this.showError('Không thể kết nối'),
        });
    } catch (e) {
      this.showError('Có lỗi khi cập nhật phòng');
    }
  }

  deleteRoom(room: Room): void {
    this.confirmationData.set({
      type: 'delete',
      title: 'Xác nhận xóa',
      message: `Xóa phòng "${room.roomName}"?`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
    });
    this.pendingAction = () => this.deleteRoomAPI(room.id);
    this.showConfirmationModal.set(true);
  }

  deleteRoomAPI(id: number): void {
    this.http.delete<any>(`${this.apiBase}/${id}`).subscribe({
      next: (res) => {
        res.status === 'Success'
          ? this.showSuccess(res.retMsg)
          : this.showError(res.retMsg);
        this.fetchRooms();
      },
      error: () => this.showError('Không thể kết nối'),
    });
  }

  executeConfirmation(): void {
    this.pendingAction?.();
    this.pendingAction = null;
    this.showConfirmationModal.set(false);
  }

  cancelConfirmation(): void {
    this.pendingAction = null;
    this.showConfirmationModal.set(false);
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }

  showSuccess(msg: string): void {
    this.toastType.set('success');
    this.toastTitle.set('Thành công');
    this.toastMessage.set(msg);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 5000);
  }

  showError(msg: string): void {
    this.toastType.set('error');
    this.toastTitle.set('Lỗi');
    this.toastMessage.set(msg);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 5000);
  }

  filteredRooms = computed(() => this.rooms());
  totalPages = computed(() =>
    Math.ceil(this.filteredRooms().length / this.itemsPerPage())
  );
  paginatedRooms = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredRooms().slice(start, start + this.itemsPerPage());
  });

  getPageRange(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: Event) {
    if (!(event.target as HTMLElement).closest('.user-profile-container')) {
      // handle dropdown close if needed
    }
  }
  toRoomType(type: string): 'Standard' | 'Deluxe' | 'Suite' {
    const allowed = ['Standard', 'Deluxe', 'Suite'];
    return allowed.includes(type) ? (type as any) : 'Standard';
  }

  toRoomStatus(status: string): 'Vacant' | 'Booked' | 'Inactive' {
    const allowed = ['Vacant', 'Booked', 'Inactive'];
    return allowed.includes(status) ? (status as any) : 'Vacant';
  }
  logout(): void {
    this.authService.logout(); // gọi hàm đã có trong auth.service.ts
  }
  confirmLogout() {
    this.showLogoutModal.set(false);
    this.showSuccess('Đăng xuất thành công');
  }

  showLogoutConfirmation() {
    this.showLogoutModal.set(true);
  }
  get math() {
    return Math;
  }
  showUserDropdown = signal(false);

  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.showUserDropdown.set(!this.showUserDropdown());
  }
  getRoomMainImage(room: Room): string | null {
    const mainImage = room.images?.find((img) => img.isMain);
    if (!mainImage || !mainImage.imageUrl) return null;

    // ✅ Thêm domain backend nếu đường dẫn là tương đối
    if (mainImage.imageUrl.startsWith('http')) {
      return mainImage.imageUrl;
    }

    return `${API_URL}${mainImage.imageUrl}`;
  }

  handleMultipleFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    Array.from(input.files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        const images = [...this.newRoom().images];
        images.push({ imageUrl, file, isMain: images.length === 0 });
        this.newRoom.set({ ...this.newRoom(), images });
      };
      reader.readAsDataURL(file);
    });
  }

  setNewRoomType(roomType: 'Standard' | 'Deluxe' | 'Suite'): void {
    const current = this.newRoom();
    this.newRoom.set({
      ...current,
      roomType: roomType,
    });
  }

  setEditRoomType(roomType: 'Standard' | 'Deluxe' | 'Suite'): void {
    const current = this.editingRoom();
    if (current) {
      this.editingRoom.set({
        ...current,
        roomType: roomType,
      });
    }
  }

  setNewRoomStatus(status: 'Vacant' | 'Booked' | 'Inactive'): void {
    const current = this.newRoom();
    this.newRoom.set({
      ...current,
      status: status,
    });
  }

  handleEditImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;
      const current = this.editingRoom();
      if (current) {
        const images = [...current.images];
        images.push({ imageUrl, file, isMain: images.length === 0 });
        this.editingRoom.set({ ...current, images });
      }
    };
    reader.readAsDataURL(file);
  }

  // ===== Upload ảnh lên Cloudinary, trả về secure_url =====
  private async uploadToCloudinary(
    file: File,
    folder = 'hotel-rooms'
  ): Promise<string | undefined> {
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      form.append('folder', folder);
      const resp = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: form,
        }
      );
      const data = await resp.json();
      return data?.secure_url as string | undefined;
    } catch (e) {
      console.error('Upload Cloudinary error', e);
      return undefined;
    }
  }
}
