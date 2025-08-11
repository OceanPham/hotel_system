package com.example.htms;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class PasswordEncodeExample {
    public static void main(String[] args) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        String rawPassword = "abc123456";
        String encodedPassword = passwordEncoder.encode(rawPassword);

        System.out.println("Encoded password: " + encodedPassword);
    }
}
