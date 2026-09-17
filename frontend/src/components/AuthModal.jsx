import React, { useState } from 'react';
import { Modal, Form, Input, Button, Tabs, Select } from 'antd';
import { User, Lock, Mail, Phone, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { APP_SETTINGS } from '../constants/settings';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, setAuthModalTab, login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLogin = async (values) => {
    setLoading(true);
    await login(values.username, values.password);
    setLoading(false);
  };

  const handleRegister = async (values) => {
    setLoading(true);
    const res = await register(values);
    setLoading(false);
    if (res.success) {
      registerForm.resetFields();
      loginForm.setFieldsValue({ username: values.username });
    }
  };

  // Quick fill helper for testing demo accounts
  const handleQuickFill = (username, password) => {
    loginForm.setFieldsValue({ username, password });
  };

  const tabItems = [
    {
      key: 'login',
      label: (
        <span className="font-semibold px-4 tracking-wider uppercase text-xs">
          Đăng Nhập
        </span>
      ),
      children: (
        <div className="pt-2">
          {/* Quick Demo Fillers */}
          <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Tài khoản mẫu thử nghiệm (Click để điền nhanh):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('ttb', 'abc123456')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white border border-amber-300 text-slate-700 hover:bg-amber-50 transition-colors shadow-sm"
              >
                Khách hàng: <strong>ttb</strong>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('ntminh', 'abc123456')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white border border-amber-300 text-slate-700 hover:bg-amber-50 transition-colors shadow-sm"
              >
                Nhân viên: <strong>ntminh</strong>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('nva', 'abc123456')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white border border-amber-300 text-slate-700 hover:bg-amber-50 transition-colors shadow-sm"
              >
                Kế toán: <strong>nva</strong>
              </button>
            </div>
          </div>

          <Form form={loginForm} layout="vertical" onFinish={handleLogin} requiredMark={false}>
            <Form.Item
              name="username"
              label={<span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Tên đăng nhập</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
            >
              <Input
                size="large"
                prefix={<User className="w-4 h-4 text-amber-600 mr-1.5" />}
                placeholder="Ví dụ: ttb hoặc ntminh"
                className="rounded-xl border-slate-300 hover:border-amber-500 focus:border-amber-500 py-2.5"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Mật khẩu</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password
                size="large"
                prefix={<Lock className="w-4 h-4 text-amber-600 mr-1.5" />}
                placeholder="Mật khẩu của bạn"
                className="rounded-xl border-slate-300 hover:border-amber-500 focus:border-amber-500 py-2.5"
              />
            </Form.Item>

            <Form.Item className="mt-6 mb-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 border-none font-bold uppercase tracking-wider text-xs shadow-md shadow-amber-500/20"
              >
                Đăng Nhập Vào Hệ Thống
              </Button>
            </Form.Item>

            <div className="text-center text-xs text-slate-500 mt-4">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setAuthModalTab('register')}
                className="font-bold text-amber-600 hover:underline"
              >
                Đăng ký ngay
              </button>
            </div>
          </Form>
        </div>
      ),
    },
    {
      key: 'register',
      label: (
        <span className="font-semibold px-4 tracking-wider uppercase text-xs">
          Đăng Ký Tài Khoản
        </span>
      ),
      children: (
        <div className="pt-2">
          <Form form={registerForm} layout="vertical" onFinish={handleRegister} requiredMark={false}>
            <Form.Item
              name="fullName"
              label={<span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Họ và tên</span>}
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input
                size="large"
                prefix={<User className="w-4 h-4 text-amber-600 mr-1.5" />}
                placeholder="Ví dụ: Nguyễn Văn An"
                className="rounded-xl border-slate-300 py-2"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-3">
              <Form.Item
                name="username"
                label={<span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Tên đăng nhập</span>}
                rules={[{ required: true, message: 'Nhập tên đăng nhập' }]}
              >
                <Input size="large" placeholder="nguyenvanan" className="rounded-xl border-slate-300 py-2" />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Mật khẩu</span>}
                rules={[{ required: true, message: 'Nhập mật khẩu' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}
              >
                <Input.Password size="large" placeholder="••••••" className="rounded-xl border-slate-300 py-2" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Form.Item
                name="email"
                label={<span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</span>}
                rules={[{ type: 'email', message: 'Email không hợp lệ' }, { required: true, message: 'Nhập email' }]}
              >
                <Input size="large" prefix={<Mail className="w-4 h-4 text-slate-400 mr-1" />} placeholder="email@gmail.com" className="rounded-xl border-slate-300 py-2" />
              </Form.Item>

              <Form.Item
                name="phone"
                label={<span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Số điện thoại</span>}
                rules={[{ required: true, message: 'Nhập số điện thoại' }]}
              >
                <Input size="large" prefix={<Phone className="w-4 h-4 text-slate-400 mr-1" />} placeholder={APP_SETTINGS.contact.hotline} className="rounded-xl border-slate-300 py-2" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Form.Item
                name="gender"
                label={<span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Giới tính</span>}
                initialValue="Nam"
              >
                <Select size="large" className="rounded-xl">
                  <Select.Option value="Nam">Nam</Select.Option>
                  <Select.Option value="Nữ">Nữ</Select.Option>
                  <Select.Option value="Khác">Khác</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="nationality"
                label={<span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Quốc tịch</span>}
                initialValue="Vietnam"
              >
                <Input size="large" placeholder="Vietnam" className="rounded-xl border-slate-300 py-2" />
              </Form.Item>
            </div>

            <Form.Item className="mt-4 mb-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 border-none font-bold uppercase tracking-wider text-xs shadow-md shadow-amber-500/20"
              >
                Đăng Ký Tài Khoản Mới
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={isAuthModalOpen}
      onCancel={closeAuthModal}
      footer={null}
      width={480}
      centered
      className="luxury-auth-modal"
      destroyOnClose
    >
      <div className="text-center pt-3 pb-2">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#062C24] border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <KeyRound className="w-6 h-6 text-amber-400" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-wide">
          LUMIÈRE PALACE
        </h2>
        <p className="text-xs text-amber-700 tracking-widest uppercase mt-0.5">
          Cổng Dịch Vụ Khách Hàng Thượng Lưu
        </p>
      </div>

      <Tabs
        activeKey={authModalTab}
        onChange={setAuthModalTab}
        items={tabItems}
        centered
        className="luxury-tabs"
      />
    </Modal>
  );
};

export default AuthModal;
