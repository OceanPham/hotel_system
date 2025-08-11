package com.example.htms.biz.user.model.dto;

import com.example.htms.biz.user.model.User;
import com.example.htms.enumation.RoleEnum;
import lombok.*;
import org.springframework.beans.BeanUtils;

public class UserDTO {

    @Getter
    @Setter
    public static class Req {
        private String username;
        private String fullName;
        private String password; // plain password
        private String phone;
        private String email;
        private String gender;    // "Nam", "Nữ", "Khác"
        private String nationality;
        private RoleEnum role;      // "USER", "STAFF"
        private String status;    // "Active", "Inactive"

        public User toUser() {
            User user = new User();
            BeanUtils.copyProperties(this, user);
            return user;
        }
    }

    @Getter
    @Setter
    public static class Resp {
        private Integer id;
        private String username;
        private String fullName;
        private String password;  // Nếu cần trả về, hoặc có thể bỏ nếu không muốn lộ mật khẩu
        private String phone;
        private String email;
        private String gender;
        private String nationality;
        private RoleEnum role;
        private String status;

        public static Resp fromUser(User user) {
            Resp resp = new Resp();
            BeanUtils.copyProperties(user, resp);
            return resp;
        }
    }
    @Getter
    @Setter
    public static class ChangePasswordReq {
        private String oldPassword;
        private String newPassword;
    }
    @Getter
    @Setter
    public static class LoginRequest {
        private String username;
        private String password;
    }
    @Getter
    @Setter
    public static class LoginResponse {
        private String token;
        private Resp user;

        public LoginResponse(String token, Resp user) {
            this.token = token;
            this.user = user;
        }
    }
    @Data
    public static class UpdateProfileReq {
        private String fullName;
        private String phone;
        private String email;
        private String gender;
        private String nationality;

        public User toUser() {
            User user = new User();
            user.setFullName(fullName);
            user.setPhone(phone);
            user.setEmail(email);
            user.setGender(gender);
            user.setNationality(nationality);
            return user;
        }
    }


}
