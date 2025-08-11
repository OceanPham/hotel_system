package com.example.htms.biz.user.model;

import com.example.htms.enumation.RoleEnum;
import lombok.Data;

@Data
public class User {
    private Integer id;             // id của UserAccount
    private String username;
    private String password;        // raw hoặc hashed
    private String fullName;
    private String phone;
    private String email;
    private String gender;          // "Nam", "Nữ", "Khác"
    private String nationality;
    private RoleEnum role;            // "USER", "STAFF"
    private String status;          // "Active", "Inactive"
}
