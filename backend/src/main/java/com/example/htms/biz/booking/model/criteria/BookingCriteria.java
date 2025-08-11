package com.example.htms.biz.booking.model.criteria;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingCriteria {
    private Integer userId;
    private Integer roomId;
    private LocalDate checkInDateFrom;   // ngày nhận phòng từ
    private LocalDate checkInDateTo;     // ngày nhận phòng đến
    private LocalDate checkOutDateFrom;  // ngày trả phòng từ
    private LocalDate checkOutDateTo;    // ngày trả phòng đến
    private String status;               // "Confirmed" hoặc "Cancelled"
    private String bookingType;          // "Day" hoặc "Night"
}
