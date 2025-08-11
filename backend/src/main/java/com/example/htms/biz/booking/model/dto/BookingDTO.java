package com.example.htms.biz.booking.model.dto;

import com.example.htms.biz.booking.model.Booking;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingDTO {

    @Getter
    @Setter
    public static class Resp {
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

        private String mainImageUrl;

        public static Resp fromBooking(Booking booking) {
            Resp resp = new Resp();
            resp.setId(booking.getId());
            resp.setUserId(booking.getUserId());
            resp.setRoomId(booking.getRoomId());

            resp.setUserName(booking.getUserName());
            resp.setFullName(booking.getFullName());
            resp.setPhone(booking.getPhone());
            resp.setEmail(booking.getEmail());

            resp.setRoomNumber(booking.getRoomNumber());
            resp.setRoomName(booking.getRoomName());
            resp.setRoomType(booking.getRoomType());

            resp.setCheckInDate(booking.getCheckInDate());
            resp.setCheckOutDate(booking.getCheckOutDate());
            resp.setStatus(booking.getStatus());
            resp.setBookingType(booking.getBookingType());
            resp.setNote(booking.getNote());
            resp.setCreatedAt(booking.getCreatedAt());

            resp.setTotalAmount(booking.getTotalAmount());
            resp.setMainImageUrl(booking.getMainImageUrl());

            return resp;
        }
    }

    @Getter
    @Setter
    public static class Req {
        private String fullName;     // để tìm userId từ UserService
        private String roomNumber;   // để tìm roomId từ RoomService

        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private String status;
        private String bookingType;
        private String note;

        /**
         * Chuyển sang Booking sau khi đã xác định được userId và roomId từ Service.
         */
        public Booking toBooking(Integer userId, Integer roomId) {
            Booking booking = new Booking();
            booking.setUserId(userId);
            booking.setRoomId(roomId);
            booking.setCheckInDate(checkInDate);
            booking.setCheckOutDate(checkOutDate);
            booking.setStatus(status);
            booking.setBookingType(bookingType);
            booking.setNote(note);
            return booking;
        }
    }

    @Getter
    @Setter
    public static class CreatedResp {
        private Integer bookingId;
        private Integer userId;
        private Integer roomId;

        public CreatedResp(Integer bookingId, Integer userId, Integer roomId) {
            this.bookingId = bookingId;
            this.userId = userId;
            this.roomId = roomId;
        }
    }
}
