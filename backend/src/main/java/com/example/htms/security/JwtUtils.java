package com.example.htms.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationMs;

    private Key getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secret);
        if (keyBytes.length < 64) { // 512 bits for HS512
            throw new IllegalArgumentException("Secret key must be at least 512 bits (64 bytes) for HS512");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Tạo token và thêm role vào claims
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    // Trích xuất username từ token
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // Trích xuất role từ token
    public String extractRole(String token) {
        return (String) getClaims(token).get("role");
    }

    // Kiểm tra token hợp lệ
    public boolean validateToken(String token) {
        try {
            getClaims(token); // sẽ ném exception nếu không hợp lệ
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // Trích xuất claims
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
