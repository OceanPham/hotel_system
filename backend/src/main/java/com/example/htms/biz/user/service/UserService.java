package com.example.htms.biz.user.service;

import com.example.htms.biz.user.model.User;
import com.example.htms.biz.user.repository.UserMapper;
import com.example.htms.enumation.RoleEnum;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public String findEmailByUsername(String username) {
        return userMapper.findEmailByUsername(username);
    }

    public User getUserByUsername(String username) {
        return userMapper.getUserByUsername(username);
    }

    public User getUserById(Integer id) {
        return userMapper.getUserById(id);
    }

    public List<User> getAllUsers() {
        return userMapper.getAllUsers();
    }

    public List<User> getUsersByIds(List<Integer> userIds) {
        return userMapper.getUsersByIds(userIds);
    }

    public boolean checkPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    @Transactional
    public int insertUser(User user) {
        User existing = userMapper.getUserByUsername(user.getUsername());
        if (existing != null) {
            throw new IllegalArgumentException("Username already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userMapper.insertUser(user);
    }

    @Transactional
    public int updateUser(User user) {
        User existing = userMapper.getUserByUsername(user.getUsername());
        if (existing == null) {
            throw new IllegalArgumentException("User not found");
        }

        // Nếu truyền mật khẩu mới thì mã hóa, còn không thì giữ nguyên
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            user.setPassword(existing.getPassword());
        }

        return userMapper.updateUser(user);
    }

    @Transactional
    public int deleteUser(String username) {
        return userMapper.deleteUser(username);
    }

    public List<User> searchUsers(List<RoleEnum> roles, List<String> statuses) {
        return userMapper.searchUsers(roles, statuses);
    }

    public List<User> searchUsersAdvanced(List<RoleEnum> roles,
                                          List<String> statuses,
                                          String fullName,
                                          String username,
                                          String email,
                                          String phone) {

        return userMapper.searchUsersAdvanced(roles, statuses, fullName, username, email, phone);
    }

    @Transactional
    public boolean changePassword(String username, String oldPassword, String newPassword) {
        User user = userMapper.getUserByUsername(username);
        if (user == null || !checkPassword(oldPassword, user.getPassword())) {
            return false;
        }

        String encodedNewPassword = passwordEncoder.encode(newPassword);
        return userMapper.updatePassword(username, encodedNewPassword) > 0;
    }
}
