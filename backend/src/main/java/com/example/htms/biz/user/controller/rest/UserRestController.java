package com.example.htms.biz.user.controller.rest;

import com.example.htms.biz.user.model.User;
import com.example.htms.biz.user.model.dto.UserDTO;
import com.example.htms.biz.user.service.UserService;
import com.example.htms.common.http.model.ResultData;
import com.example.htms.enumation.RoleEnum;
import com.example.htms.security.JwtUtils;
import com.example.htms.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserRestController {

    private final UserService userService;
    private final JwtUtils jwtUtils;

    public UserRestController(UserService userService, JwtUtils jwtUtils) {
        this.userService = userService;
        this.jwtUtils = jwtUtils;
    }


    @GetMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ResultData<List<UserDTO.Resp>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserDTO.Resp> result = users.stream()
                .map(UserDTO.Resp::fromUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ResultData<>("SUCCESS", result, result.size()));
    }

    @PostMapping
    public ResponseEntity<ResultData<String>> createUser(@Valid @RequestBody UserDTO.Req req) {
        try {
            User user = req.toUser();
            userService.insertUser(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ResultData<>("SUCCESS", "User created successfully", (String) null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ResultData<>("FAIL", e.getMessage(), (String) null));
        }
    }

    @PutMapping("/{username}")
    @PreAuthorize("hasAnyRole('USER', 'STAFF')")
    public ResponseEntity<ResultData<String>> updateUser(@PathVariable String username,
                                                         @Valid @RequestBody UserDTO.UpdateProfileReq req) {
        String currentUsername = SecurityUtils.getCurrentUsername();

        // ✅ Chặn nếu không đúng username
        if (!currentUsername.equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ResultData<>("FAIL", "You are only allowed to update your own profile",(String) null));
        }

        try {
            User existing = userService.getUserByUsername(username);
            if (existing == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResultData<>("FAIL", "User not found",(String) null));
            }

            User user = req.toUser();
            user.setUsername(username);
            user.setRole(existing.getRole());     // giữ nguyên
            user.setStatus(existing.getStatus()); // giữ nguyên
            user.setPassword(existing.getPassword()); // giữ nguyên nếu không đổi
            int updated = userService.updateUser(user);

            return ResponseEntity.ok(new ResultData<>("SUCCESS", "User updated successfully",(String) null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResultData<>("FAIL", e.getMessage(),(String) null));
        }
    }

//    @DeleteMapping("/{username}")
//    public ResponseEntity<ResultData<String>> deleteUser(@PathVariable String username) {
//        int result = userService.deleteUser(username);
//        if (result > 0) {
//            return ResponseEntity.ok(new ResultData<>("SUCCESS", "User deleted successfully", (String) null));
//        } else {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                    .body(new ResultData<>("FAIL", "User not found or delete failed", (String) null));
//        }
//    }
    @PostMapping("/{username}/change-password")
    public ResponseEntity<ResultData<String>> changePassword(
            @PathVariable String username,
            @RequestBody UserDTO.ChangePasswordReq req) {

        String currentUsername = SecurityUtils.getCurrentUsername();

        // ✅ Chỉ cho phép chính user đổi mật khẩu
        if (!currentUsername.equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ResultData<>("FAIL", "You can only change your own password",(String) null));
        }

        boolean success = userService.changePassword(username, req.getOldPassword(), req.getNewPassword());
        if (!success) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResultData<>("FAIL", "Old password is incorrect",(String) null));
        }

        return ResponseEntity.ok(new ResultData<>("SUCCESS", "Password changed successfully",(String) null));
    }

    @GetMapping("/search")
    public ResponseEntity<ResultData<List<UserDTO.Resp>>> searchUsers(
            @RequestParam(required = false) List<RoleEnum> roles,
            @RequestParam(required = false) List<String> statuses,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone
    ) {
        List<User> users = userService.searchUsersAdvanced(roles, statuses, fullName, username, email, phone);
        List<UserDTO.Resp> result = users.stream()
                .map(UserDTO.Resp::fromUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ResultData<>("SUCCESS", result, result.size()));
    }

    @GetMapping(params = "userIds")
    public ResponseEntity<ResultData<List<UserDTO.Resp>>> getUsersByIds(@RequestParam List<Integer> userIds) {
        List<User> users = userService.getUsersByIds(userIds);
        List<UserDTO.Resp> result = users.stream()
                .map(UserDTO.Resp::fromUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ResultData<>("SUCCESS", result, result.size()));
    }

    // ✅ Global error handler (optional)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ResultData<String>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest()
                .body(new ResultData<>("FAIL", e.getMessage(), (String) null));
    }
    @GetMapping("/{username}")
    @PreAuthorize("hasAnyRole('USER', 'STAFF')")
    public ResponseEntity<ResultData<UserDTO.Resp>> getUserByUsername(@PathVariable String username) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        String currentRole = SecurityUtils.getCurrentUserRole();

        // 👇 Nếu là USER thì chỉ cho xem chính mình
        if (currentRole.equals("USER") && !currentUsername.equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ResultData<>("FAIL", "You can only view your own profile",(UserDTO.Resp) null));
        }

        User user = userService.getUserByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResultData<>("FAIL", null));
        }

        UserDTO.Resp userResp = UserDTO.Resp.fromUser(user);
        return ResponseEntity.ok(new ResultData<>("SUCCESS", userResp, 1));
    }

    @PostMapping("/login")
    public ResponseEntity<ResultData<UserDTO.LoginResponse>> login(@RequestBody UserDTO.LoginRequest request) {
        User user = userService.getUserByUsername(request.getUsername());

        if (user == null || !userService.checkPassword(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResultData<>("FAIL", "Invalid username or password",(UserDTO.LoginResponse) null));
        }

// ✅ Kiểm tra trạng thái
        if (!"Active".equalsIgnoreCase(user.getStatus())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResultData<>("FAIL", "Account is not active",(UserDTO.LoginResponse) null));
        }


        // Tạo JWT token
        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());

        // Tạo DTO trả về
        UserDTO.Resp userResp = UserDTO.Resp.fromUser(user);
        UserDTO.LoginResponse response = new UserDTO.LoginResponse(token, userResp);

        return ResponseEntity.ok(new ResultData<>("SUCCESS", response, 1));
    }
    @PostMapping("/logout")
    public ResponseEntity<ResultData<String>> logout() {
        // Không cần xử lý gì vì JWT không lưu ở backend
        return ResponseEntity.ok(new ResultData<>("SUCCESS", "Logged out successfully",(String) null));
    }
}
