/** Tài khoản demo lấy từ DB/htms.sql (password: abc123456) */
export interface DemoAccount {
  role: 'USER' | 'STAFF' | 'ACCOUNTANT';
  username: string;
  password: string;
  fullName: string;
  label: string;
  description: string;
  icon: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'USER',
    username: 'ttb',
    password: 'abc123456',
    fullName: 'Trần Thị Bình',
    label: 'Khách hàng',
    description: 'Đặt phòng, thanh toán, xem lịch sử',
    icon: '👤',
  },
  {
    role: 'STAFF',
    username: 'ntminh',
    password: 'abc123456',
    fullName: 'Nguyễn Thị Minh',
    label: 'Nhân viên',
    description: 'Quản lý phòng, đơn đặt, dịch vụ',
    icon: '🛎️',
  },
  {
    role: 'ACCOUNTANT',
    username: 'nva',
    password: 'abc123456',
    fullName: 'Nguyễn Văn An',
    label: 'Kế toán',
    description: 'Thống kê doanh thu, báo cáo tài chính',
    icon: '💼',
  },
];
