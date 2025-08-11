package com.example.htms.biz.user.model.criteria;

import com.example.htms.enumation.RoleEnum;
import lombok.Data;

@Data
public class UserCriteria {
    private String username;
    private String fullName;
    private String phone;
    private String email;
    private String gender;       // "Nam", "Nữ", "Khác"
    private String nationality;
    private RoleEnum role;         // "USER", "STAFF"
    private String status;       // "Active", "Inactive"

    // Thêm các trường khác nếu cần (ví dụ: ngày tạo, ngày cập nhật,...)
}
