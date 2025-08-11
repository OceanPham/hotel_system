package com.example.htms.security;

import com.example.htms.biz.user.model.User;
import com.example.htms.biz.user.service.UserService;
import com.example.htms.enumation.RoleEnum;
import com.example.htms.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Stream;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    private static List<GrantedAuthority> getGrantedAuthorities(String role) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(role));
        return authorities;
    }

    public static Collection<? extends GrantedAuthority> getAuthorities(
            RoleEnum role) {

        return getGrantedAuthorities(role.name());
    }

    public static String getCurrentUsername() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) return null;

        Object principal = auth.getPrincipal();
        if (principal instanceof String username) {
            return username;
        } else if (principal instanceof org.springframework.security.core.userdetails.User userDetails) {
            return userDetails.getUsername();
        } else {
            return principal.toString(); // fallback
        }
    }
    public static Integer getCurrentUserId(UserService userService) {
        String username = getCurrentUsername();
        if (username == null) throw new UnauthorizedException("No username found");

        User user = userService.getUserByUsername(username);
        if (user == null) throw new UnauthorizedException("User not found");
        return user.getId();
    }

    // ✅ Thêm hàm này để lấy role hiện tại
    public static String getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getAuthorities() != null) {
            for (GrantedAuthority authority : authentication.getAuthorities()) {
                // Nếu role kiểu ROLE_USER thì cắt prefix ROLE_
                if (authority.getAuthority().startsWith("ROLE_")) {
                    return authority.getAuthority().substring(5); // Trả về "USER", "STAFF", v.v.
                }
            }
        }
        return null;
    }
    public static Stream<String> getListAuthorities(Authentication authentication) {
        return authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority);
    }


}
