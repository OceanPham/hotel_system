package com.example.htms.biz.payment.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "PaymentInvoice")
public class PaymentInvoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "booking_id", nullable = false)
    private Integer bookingId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "room_amount", nullable = false)
    private Integer roomAmount;

    @Column(name = "service_amount", nullable = false)
    private Integer serviceAmount;

    @Column(name = "tax", nullable = false)
    private Integer tax;

    @Column(name = "total_amount", nullable = false)
    private Integer totalAmount;

    @Column(name = "payment_method", nullable = false, length = 20)
    private String paymentMethod;

    @Column(name = "status", nullable = false)
    private String status;

    public enum PaymentStatus {
        Paid, Unpaid
    }
} 