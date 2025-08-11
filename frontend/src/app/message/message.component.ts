import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  AfterViewChecked,
  signal,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  address: string;
  avatar: string;
}

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  isOnline: boolean;
  unreadCount: number;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  text: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
})
export class MessageComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  newMessage = '';
  selectedConversation: Conversation | null = null;
  isTyping = false;
  showEmojiPicker = false;
  currentUserId = '';
  searchText = '';
  filteredConversations: Conversation[] = [];
  shouldScrollToBottom = false;

  // User dropdown signals
  showUserDropdown = signal(false);
  showLogoutModal = signal(false);
  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('success');
  toastTitle = signal('');
  toastMessage = signal('');

  // User profile data
  userProfile = signal<UserProfile>({
    name: '',
    email: '',
    phone: '',
    role: '',
    address: '',
    avatar: '',
  });

  // Dữ liệu mẫu conversations
  conversations: Conversation[] = [
    {
      id: 1,
      name: 'Nguyễn Văn An',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face&auto=format',
      lastMessage: 'Chào admin, tôi muốn đặt phòng VIP cho tuần sau',
      lastMessageTime: '2 phút trước',
      isOnline: true,
      unreadCount: 2,
    },
    {
      id: 2,
      name: 'Trần Thị Bình',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612e742?w=48&h=48&fit=crop&crop=face&auto=format',
      lastMessage: 'Cảm ơn bạn về dịch vụ tuyệt vời!',
      lastMessageTime: '15 phút trước',
      isOnline: false,
      unreadCount: 0,
    },
    {
      id: 3,
      name: 'Lê Văn Cường',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face&auto=format',
      lastMessage: 'Phòng 203 có vấn đề với điều hòa',
      lastMessageTime: '1 giờ trước',
      isOnline: true,
      unreadCount: 1,
    },
    {
      id: 4,
      name: 'Phạm Thị Dung',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&crop=face&auto=format',
      lastMessage: 'Tôi sẽ check-out vào 11h sáng mai',
      lastMessageTime: '3 giờ trước',
      isOnline: false,
      unreadCount: 0,
    },
    {
      id: 5,
      name: 'Hoàng Văn Em',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&h=48&fit=crop&crop=face&auto=format',
      lastMessage: 'Có thể order thêm breakfast không?',
      lastMessageTime: '1 ngày trước',
      isOnline: true,
      unreadCount: 0,
    },
  ];

  // Dữ liệu messages cho từng conversation
  conversationMessages: { [key: number]: Message[] } = {
    1: [
      {
        id: 1,
        conversationId: 1,
        senderId: 'customer-001',
        text: 'Chào admin, tôi là khách hàng mới',
        timestamp: new Date('2024-01-20T10:00:00'),
        status: 'read',
      },
      {
        id: 2,
        conversationId: 1,
        senderId: 'admin-001',
        text: 'Chào bạn! Chúng tôi rất vui được phục vụ bạn. Bạn cần hỗ trợ gì ạ?',
        timestamp: new Date('2024-01-20T10:01:00'),
        status: 'read',
      },
      {
        id: 3,
        conversationId: 1,
        senderId: 'customer-001',
        text: 'Tôi muốn đặt phòng VIP cho tuần sau, từ thứ 2 đến thứ 6',
        timestamp: new Date('2024-01-20T10:02:00'),
        status: 'read',
      },
      {
        id: 4,
        conversationId: 1,
        senderId: 'admin-001',
        text: 'Dạ được ạ! Hiện tại chúng tôi có phòng VIP Deluxe và VIP Suite. Bạn muốn xem chi tiết không?',
        timestamp: new Date('2024-01-20T10:03:00'),
        status: 'read',
      },
      {
        id: 5,
        conversationId: 1,
        senderId: 'customer-001',
        text: 'Tôi muốn xem giá phòng VIP Suite và các dịch vụ đi kèm',
        timestamp: new Date('2024-01-20T10:58:00'),
        status: 'delivered',
      },
      {
        id: 6,
        conversationId: 1,
        senderId: 'customer-001',
        text: 'Chào admin, tôi muốn đặt phòng VIP cho tuần sau',
        timestamp: new Date('2024-01-20T10:59:00'),
        status: 'sent',
      },
    ],
    2: [
      {
        id: 7,
        conversationId: 2,
        senderId: 'customer-002',
        text: 'Cảm ơn khách sạn đã phục vụ tôi rất tốt trong 3 ngày qua',
        timestamp: new Date('2024-01-20T09:45:00'),
        status: 'read',
      },
      {
        id: 8,
        conversationId: 2,
        senderId: 'admin-001',
        text: 'Cảm ơn bạn đã tin tưởng và lựa chọn khách sạn chúng tôi! Hy vọng bạn có những trải nghiệm tuyệt vời.',
        timestamp: new Date('2024-01-20T09:46:00'),
        status: 'read',
      },
      {
        id: 9,
        conversationId: 2,
        senderId: 'customer-002',
        text: 'Cảm ơn bạn về dịch vụ tuyệt vời!',
        timestamp: new Date('2024-01-20T09:47:00'),
        status: 'read',
      },
    ],
    3: [
      {
        id: 10,
        conversationId: 3,
        senderId: 'customer-003',
        text: 'Phòng 203 có vấn đề với điều hòa, không mát lắm',
        timestamp: new Date('2024-01-20T09:00:00'),
        status: 'read',
      },
      {
        id: 11,
        conversationId: 3,
        senderId: 'admin-001',
        text: 'Dạ chúng tôi sẽ cử kỹ thuật viên lên kiểm tra ngay. Xin lỗi bạn về sự bất tiện này.',
        timestamp: new Date('2024-01-20T09:01:00'),
        status: 'read',
      },
      {
        id: 12,
        conversationId: 3,
        senderId: 'customer-003',
        text: 'Cảm ơn, tôi đang đợi kỹ thuật viên',
        timestamp: new Date('2024-01-20T09:02:00'),
        status: 'read',
      },
    ],
    4: [
      {
        id: 13,
        conversationId: 4,
        senderId: 'customer-004',
        text: 'Tôi sẽ check-out vào 11h sáng mai',
        timestamp: new Date('2024-01-20T06:00:00'),
        status: 'read',
      },
      {
        id: 14,
        conversationId: 4,
        senderId: 'admin-001',
        text: 'Dạ được ạ! Chúng tôi sẽ chuẩn bị hóa đơn cho bạn.',
        timestamp: new Date('2024-01-20T06:01:00'),
        status: 'read',
      },
    ],
    5: [
      {
        id: 15,
        conversationId: 5,
        senderId: 'customer-005',
        text: 'Có thể order thêm breakfast không?',
        timestamp: new Date('2024-01-19T08:00:00'),
        status: 'read',
      },
      {
        id: 16,
        conversationId: 5,
        senderId: 'admin-001',
        text: 'Dạ được ạ! Menu breakfast từ 6h-10h sáng. Bạn muốn order gì?',
        timestamp: new Date('2024-01-19T08:01:00'),
        status: 'read',
      },
    ],
  };

  // Messages hiện tại cho conversation được chọn
  currentMessages: Message[] = [];

  // Emojis cho emoji picker
  emojis = [
    '😀',
    '😃',
    '😄',
    '😁',
    '😆',
    '😅',
    '😂',
    '🤣',
    '😊',
    '😇',
    '🙂',
    '🙃',
    '😉',
    '😌',
    '😍',
    '🥰',
    '😘',
    '😗',
    '😙',
    '😚',
    '😋',
    '😛',
    '😝',
    '😜',
    '🤪',
    '🤨',
    '🧐',
    '🤓',
    '😎',
    '🤩',
    '🥳',
    '😏',
    '❤️',
    '💕',
    '💖',
    '💗',
    '💙',
    '💚',
    '💛',
    '🧡',
    '💜',
    '🖤',
    '🤍',
    '🤎',
    '💯',
    '💢',
    '💥',
    '💫',
    '💦',
    '💨',
    '🕳️',
    '💣',
    '💬',
    '👁️‍🗨️',
    '🗨️',
    '🗯️',
    '💭',
  ];

  private typingTimeout: any;

  constructor(private router: Router) {}
  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('>>> ROLE CURRENT:', parsedUser.role); // ✅ Kiểm tra

        this.userProfile.set({
          name: parsedUser.fullName || parsedUser.name || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || '',
          role: parsedUser.role || '',
          address: parsedUser.address || '',
          avatar: parsedUser.avatar || 'https://default-avatar.url/avatar.png',
        });

        this.currentUserId = parsedUser.username || parsedUser.id || '';
      }
    }

    // ✅ KHÔNG redirect theo role ở đây nếu bạn chỉ muốn hiển thị đúng giao diện theo quyền

    // Tự động chọn conversation đầu tiên
    if (this.conversations.length > 0) {
      this.selectConversation(this.conversations[0], 0);
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
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
    this.showUserDropdown.set(!this.showUserDropdown());
  }

  goToProfile(): void {
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

  showLogoutConfirmation(): void {
    this.showUserDropdown.set(false);
    this.showLogoutModal.set(true);
  }

  cancelLogout(): void {
    this.showLogoutModal.set(false);
  }

  confirmLogout(): void {
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

  // Utility methods
  getRoleDisplayName(): string {
    const roleMap: { [key: string]: string } = {
      admin: 'Quản trị viên',
      manager: 'Quản lý',
      user: 'Người dùng',
      staff: 'Nhân viên',
    };
    return roleMap[this.userProfile().role.toLowerCase()] || 'Người dùng';
  }

  selectConversation(conversation: Conversation, index: number): void {
    if (!conversation) return;

    this.selectedConversation = conversation;
    this.loadMessages(conversation.id);
    this.markConversationAsRead(conversation);
    this.shouldScrollToBottom = true;

    // Close emoji picker if open
    this.showEmojiPicker = false;
  }

  loadMessages(conversationId: number): void {
    this.currentMessages = this.conversationMessages[conversationId] || [];
  }

  markConversationAsRead(conversation: Conversation): void {
    if (!conversation) return;
    conversation.unreadCount = 0;
  }

  sendMessage(event: Event): void {
    event.preventDefault();

    if (!this.newMessage.trim() || !this.selectedConversation) {
      return;
    }

    const newMsg: Message = {
      id: Date.now(),
      conversationId: this.selectedConversation.id,
      senderId: this.currentUserId,
      text: this.newMessage.trim(),
      timestamp: new Date(),
      status: 'sent',
    };

    // Add to conversation messages
    if (!this.conversationMessages[this.selectedConversation.id]) {
      this.conversationMessages[this.selectedConversation.id] = [];
    }
    this.conversationMessages[this.selectedConversation.id].push(newMsg);

    // Update current messages
    this.currentMessages = [
      ...this.conversationMessages[this.selectedConversation.id],
    ];

    // Update conversation's last message
    this.selectedConversation.lastMessage = this.newMessage.trim();
    this.selectedConversation.lastMessageTime = 'Vừa xong';

    // Clear input
    this.newMessage = '';

    // Scroll to bottom
    this.shouldScrollToBottom = true;

    // Simulate message delivery
    setTimeout(() => {
      newMsg.status = 'delivered';
    }, 1000);

    // Simulate read status
    setTimeout(() => {
      newMsg.status = 'read';
    }, 3000);

    // Simulate customer response after 5 seconds
    setTimeout(() => {
      this.simulateCustomerResponse();
    }, 5000);
  }

  private simulateCustomerResponse(): void {
    if (!this.selectedConversation) return;

    const responses = [
      'Cảm ơn bạn!',
      'Được rồi, tôi hiểu.',
      'Vậy tôi sẽ chờ thông tin từ bạn.',
      'OK, không có vấn đề gì.',
      'Tuyệt vời!',
      'Xin lỗi, tôi cần thêm thông tin.',
      'Bạn có thể giúp tôi không?',
    ];

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];

    const customerMsg: Message = {
      id: Date.now() + 1,
      conversationId: this.selectedConversation.id,
      senderId: `customer-00${this.selectedConversation.id}`,
      text: randomResponse,
      timestamp: new Date(),
      status: 'read',
    };

    this.conversationMessages[this.selectedConversation.id].push(customerMsg);
    this.currentMessages = [
      ...this.conversationMessages[this.selectedConversation.id],
    ];

    this.selectedConversation.lastMessage = randomResponse;
    this.selectedConversation.lastMessageTime = 'Vừa xong';
    this.selectedConversation.unreadCount = 0;

    this.shouldScrollToBottom = true;
  }

  handleTyping(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.isTyping = true;

    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
    }, 1000);
  }

  searchConversations(): void {
    if (!this.searchText.trim()) {
      this.filteredConversations = [...this.conversations];
    } else {
      this.filteredConversations = this.conversations.filter(
        (conv) =>
          conv.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
          conv.lastMessage.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  }

  getTotalUnreadCount(): number {
    return this.conversations.reduce(
      (total, conv) => total + conv.unreadCount,
      0
    );
  }

  startNewChat(): void {
    console.log('Starting new chat...');
    alert(
      'Tính năng tạo cuộc trò chuyện mới sẽ được phát triển trong tương lai!'
    );
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string): void {
    this.newMessage += emoji;
    this.showEmojiPicker = false;

    // Focus back to input
    setTimeout(() => {
      const input = document.querySelector(
        '.message-input'
      ) as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 100);
  }

  attachFile(): void {
    console.log('Attach file clicked');
    alert('Tính năng đính kèm file sẽ được phát triển trong tương lai!');
  }

  makeCall(): void {
    if (this.selectedConversation) {
      console.log('Making call to:', this.selectedConversation.name);
      alert(`Đang gọi cho ${this.selectedConversation.name}...`);
    }
  }

  makeVideoCall(): void {
    if (this.selectedConversation) {
      console.log('Making video call to:', this.selectedConversation.name);
      alert(`Đang gọi video cho ${this.selectedConversation.name}...`);
    }
  }

  showInfo(): void {
    if (this.selectedConversation) {
      console.log('Show info for:', this.selectedConversation.name);
      alert(
        `Thông tin khách hàng: ${this.selectedConversation.name}\nTrạng thái: ${
          this.selectedConversation.isOnline ? 'Đang hoạt động' : 'Offline'
        }`
      );
    }
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;

    return timestamp.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  // Toast methods
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
