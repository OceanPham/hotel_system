package com.example.htms.biz.payment.model.dto;

import com.example.htms.biz.booking.model.Booking;
import com.example.htms.biz.payment.model.PaymentInvoice;
import com.example.htms.biz.room.model.Room;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.BeanUtils;

import java.time.LocalDateTime;

public class PaymentInvoiceDTO {

    @Getter
    @Setter
    public static class Req {
        private Integer id;
        private Integer bookingId;
        private Integer roomAmount;
        private Integer serviceAmount;
        private Integer tax;
        private Integer totalAmount;
        private String paymentMethod;
        private String status;

        public PaymentInvoice toPaymentInvoice() {
            PaymentInvoice paymentInvoice = new PaymentInvoice();
            BeanUtils.copyProperties(this, paymentInvoice);
            paymentInvoice.setCreatedAt(LocalDateTime.now());
            return paymentInvoice;
        }
    }

    @Getter
    @Setter
    public static class Resp {
        private Integer id;
        private Integer bookingId;
        private LocalDateTime createdAt;
        private Integer roomAmount;
        private Integer serviceAmount;
        private Integer tax;
        private Integer totalAmount;
        private String paymentMethod;
        private PaymentInvoice.PaymentStatus status;

        public static Resp toResponse(PaymentInvoice paymentInvoice) {
            Resp resp = new Resp();
            BeanUtils.copyProperties(paymentInvoice, resp);
            return resp;
        }
    }

    // ✅ Thêm DTO cho export/exportInvoices sử dụng
    @Getter
    @Setter
    public static class PaymentInvoiceWithBookingDTO {
        private Integer id;
        private Integer bookingId;
        private LocalDateTime createdAt;
        private Integer totalAmount;
        private String paymentMethod;
        private String status;

        private String fullName;    // Tên khách hàng
        private String roomNumber;  // Số phòng

        public static PaymentInvoiceWithBookingDTO from(PaymentInvoice invoice, Booking booking, Room room) {
            PaymentInvoiceWithBookingDTO dto = new PaymentInvoiceWithBookingDTO();
            BeanUtils.copyProperties(invoice, dto);

            if (booking != null) {
                dto.setFullName(booking.getFullName());
            }

            if (room != null) {
                dto.setRoomNumber(room.getRoomNumber());
            }

            return dto;
        }
    }
}
