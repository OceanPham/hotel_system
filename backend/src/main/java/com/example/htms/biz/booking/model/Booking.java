package com.example.htms.biz.booking.model;

import com.example.htms.biz.roomimage.model.RoomImage;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
@Getter
@Setter
public class Booking {
    private Integer id;
    private Integer userId;
    private Integer roomId;

    private String userName;
    private String fullName;
    private String phone;
    private String email;

    private String roomNumber;
    private String roomName;
    private String roomType;

    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private String status;
    private String bookingType;
    private String note;
    private LocalDateTime createdAt;

    private Integer totalAmount;

    // ✅ Nếu bạn muốn map toàn bộ ảnh phòng
    private List<RoomImage> images;

    // ✅ Cần thiết để set mainImageUrl từ service
    private String mainImageUrl;
}
