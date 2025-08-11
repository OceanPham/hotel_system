import { Component, signal, computed, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
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
  styleUrl: './listroom.component.css'
})
export class ListroomComponent implements OnInit {
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private apiBase = 'http://localhost:8080/api/v1/rooms';

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
    images: []
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
          avatar: parsed.avatar || ''
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
      message: 'Đang chuyển đến trang profile...'
    });
  }
  constructor(private router: Router) {
    // Set initial route based on current URL
    this.currentRoute.set(this.router.url || '/dashboard');
  }

  showToastMessage(config: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string; duration?: number }): void {
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
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
  });

  fetchRooms(): void {
    let params = new HttpParams();
    if (this.searchQuery()) params = params.set('roomName', this.searchQuery());
    if (this.selectedStatus()) params = params.set('status', this.selectedStatus());
    if (this.selectedRoomType()) params = params.set('roomType', this.selectedRoomType());

    this.http.get<any>(this.apiBase, { params }).subscribe({
      next: (res) => {
        if (res.status === 'Success') {
          this.rooms.set(res.data || []);
        } else {
          this.showError(res.retMsg || 'Lỗi tải phòng');
        }
      },
      error: () => this.showError('Không thể kết nối đến máy chủ')
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
      images: []
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
      isEdit ? this.editingRoom.set(updatedRoom) : this.newRoom.set(updatedRoom);
    };
    input.click();
  }

  removeImageField(index: number, isEdit = false): void {
    const room = isEdit ? this.editingRoom() : this.newRoom();
    if (!room) return;
    const images = [...room.images];
    images.splice(index, 1);
    if (!images.some(img => img.isMain) && images.length > 0) {
      images[0].isMain = true;
    }
    const updatedRoom = { ...room, images };
    isEdit ? this.editingRoom.set(updatedRoom) : this.newRoom.set(updatedRoom);
  }

  setMainImage(index: number, isEdit = false): void {
    const room = isEdit ? this.editingRoom() : this.newRoom();
    if (!room) return;
    const images = room.images.map((img, i) => ({ ...img, isMain: i === index }));
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
      isEdit ? this.editingRoom.set({ ...room }) : this.newRoom.set({ ...room });
    };
    reader.readAsDataURL(file);
  }

  showAddConfirmation(): void {
    const nr = this.newRoom();
    if (!nr.roomName || !nr.roomNumber) {
      this.showError('Vui lòng nhập đủ thông tin phòng');
      return;
    }
    const duplicate = this.rooms().some(r =>
      r.roomNumber.toLowerCase() === nr.roomNumber.toLowerCase() ||
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
      cancelText: 'Hủy'
    });
    this.pendingAction = () => {
      this.createRoomAPI(nr);
      this.showAddRoomModal.set(false);
    };
    this.showConfirmationModal.set(true);
  }

  createRoomAPI(room: Room): void {
    const formData = new FormData();

    // Chỉ lấy những ảnh có file (tức là sẽ upload)
    const imagesToUpload = room.images.filter(img => img.file);

    // Tạo room JSON tương ứng với file upload
    const roomData = {
      roomNumber: room.roomNumber,
      roomName: room.roomName,
      roomType: this.toRoomType(room.roomType),
      basePrice: room.basePrice,
      status: this.toRoomStatus(room.status),
      description: room.description,
      images: imagesToUpload.map(i => ({ isMain: i.isMain }))
    };

    // Thêm phần JSON
    formData.append(
      'room',
      new Blob([JSON.stringify(roomData)], { type: 'application/json' })
    );

    // Thêm ảnh từ máy
    imagesToUpload.forEach((img, i) => {
      formData.append('images', img.file!, `room-${Date.now()}-${i}.jpg`);
    });

    this.http.post<any>(this.apiBase, formData).subscribe({
      next: (res) => {
        res.status === 'Success' ? this.showSuccess(res.retMsg) : this.showError(res.retMsg);
        this.fetchRooms();
      },
      error: () => this.showError('Không thể kết nối')
    });
  }



  showEditRoom(room: Room): void {
    this.editingRoom.set({ ...room });
    this.showEditRoomModal.set(true);
  }

  showEditConfirmation(): void {
    const er = this.editingRoom();
    if (!er) return;

    const duplicate = this.rooms().some(r =>
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
      cancelText: 'Hủy'
    });
    this.pendingAction = () => {
      this.updateRoomAPI(er.id, er);
      this.showEditRoomModal.set(false);
    };
    this.showConfirmationModal.set(true);
  }

  updateRoomAPI(id: number, room: Room): void {
    const formData = new FormData();

    const roomData = {
      id: room.id,
      roomNumber: room.roomNumber,
      roomName: room.roomName,
      roomType: this.toRoomType(room.roomType),
      basePrice: room.basePrice,
      status: this.toRoomStatus(room.status),
      description: room.description,
      images: room.images.map(i => ({
        id: i.id,
        isMain: i.isMain
      }))
    };

    formData.append('room', new Blob([JSON.stringify(roomData)], { type: 'application/json' }));

    room.images.forEach((img, i) => {
      if (img.file) {
        formData.append('images', img.file, `room-${Date.now()}-${i}.jpg`);
      }
    });

    this.http.put<any>(`${this.apiBase}/${id}`, formData).subscribe({
      next: (res) => {
        res.status === 'Success' ? this.showSuccess(res.retMsg) : this.showError(res.retMsg);
        this.fetchRooms();
      },
      error: () => this.showError('Không thể kết nối')
    });
  }

  deleteRoom(room: Room): void {
    this.confirmationData.set({
      type: 'delete',
      title: 'Xác nhận xóa',
      message: `Xóa phòng "${room.roomName}"?`,
      confirmText: 'Xóa',
      cancelText: 'Hủy'
    });
    this.pendingAction = () => this.deleteRoomAPI(room.id);
    this.showConfirmationModal.set(true);
  }

  deleteRoomAPI(id: number): void {
    this.http.delete<any>(`${this.apiBase}/${id}`).subscribe({
      next: (res) => {
        res.status === 'Success' ? this.showSuccess(res.retMsg) : this.showError(res.retMsg);
        this.fetchRooms();
      },
      error: () => this.showError('Không thể kết nối')
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
      currency: 'VND'
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
  totalPages = computed(() => Math.ceil(this.filteredRooms().length / this.itemsPerPage()));
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
    return allowed.includes(type) ? type as any : 'Standard';
  }

  toRoomStatus(status: string): 'Vacant' | 'Booked' | 'Inactive' {
    const allowed = ['Vacant', 'Booked', 'Inactive'];
    return allowed.includes(status) ? status as any : 'Vacant';
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
    const mainImage = room.images?.find(img => img.isMain);
    if (!mainImage || !mainImage.imageUrl) return null;

    // ✅ Thêm domain backend nếu đường dẫn là tương đối
    if (mainImage.imageUrl.startsWith('http')) {
      return mainImage.imageUrl;
    }

    return `http://localhost:8080${mainImage.imageUrl}`;
  }


  handleMultipleFiles(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  Array.from(input.files).forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;
      const images = [...this.newRoom().images];
      images.push({
        imageUrl,
        file,
        isMain: images.length === 0
      });
      this.newRoom.set({ ...this.newRoom(), images });
    };
    reader.readAsDataURL(file);
  });
}

setNewRoomType(roomType: 'Standard' | 'Deluxe' | 'Suite'): void {
  const current = this.newRoom();
  this.newRoom.set({
    ...current,
    roomType: roomType
  });
}

setEditRoomType(roomType: 'Standard' | 'Deluxe' | 'Suite'): void {
  const current = this.editingRoom();
  if (current) {
    this.editingRoom.set({
      ...current,
      roomType: roomType
    });
  }
}

setNewRoomStatus(status: 'Vacant' | 'Booked' | 'Inactive'): void {
  const current = this.newRoom();
  this.newRoom.set({
    ...current,
    status: status
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

}
