package com.example.htms.biz.payment.repository;

import com.example.htms.biz.payment.model.PaymentInvoice;
import com.example.htms.biz.payment.model.criteria.PaymentInvoiceCriteria;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface PaymentMapper {

    @Select("""
        SELECT 
            p.id AS id,
            p.booking_id AS bookingId,
            p.created_at AS createdAt,
            p.room_amount AS roomAmount,
            p.service_amount AS serviceAmount,
            p.tax AS tax,
            p.total_amount AS totalAmount,
            p.payment_method AS paymentMethod,
            p.status AS status
        FROM PaymentInvoice p
        WHERE
            (#{criteria.bookingId} IS NULL OR p.booking_id = #{criteria.bookingId})
            AND (#{criteria.paymentMethod} IS NULL OR p.payment_method = #{criteria.paymentMethod})
            AND (#{criteria.status} IS NULL OR p.status = #{criteria.status})
        ORDER BY p.created_at DESC
    """)
    List<PaymentInvoice> listPaymentInvoices(@Param("criteria") PaymentInvoiceCriteria criteria);

    @Select("""
        SELECT 
            p.id AS id,
            p.booking_id AS bookingId,
            p.created_at AS createdAt,
            p.room_amount AS roomAmount,
            p.service_amount AS serviceAmount,
            p.tax AS tax,
            p.total_amount AS totalAmount,
            p.payment_method AS paymentMethod,
            p.status AS status
        FROM PaymentInvoice p
        WHERE p.id = #{id}
    """)
    PaymentInvoice findById(@Param("id") Integer id);

    @Select("""
        SELECT 
            p.id AS id,
            p.booking_id AS bookingId,
            p.created_at AS createdAt,
            p.room_amount AS roomAmount,
            p.service_amount AS serviceAmount,
            p.tax AS tax,
            p.total_amount AS totalAmount,
            p.payment_method AS paymentMethod,
            p.status AS status
        FROM PaymentInvoice p
        WHERE p.booking_id = #{bookingId}
    """)
    List<PaymentInvoice> findByBookingId(@Param("bookingId") Integer bookingId);

    @Insert("""
        INSERT INTO PaymentInvoice (
            booking_id, created_at, room_amount, service_amount, 
            tax, total_amount, payment_method, status
        )
        VALUES (
            #{payment.bookingId}, #{payment.createdAt}, #{payment.roomAmount}, 
            #{payment.serviceAmount}, #{payment.tax}, #{payment.totalAmount}, 
            #{payment.paymentMethod}, #{payment.status}
        )
    """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertPayment(@Param("payment") PaymentInvoice payment);

    @Select("""
        SELECT COALESCE(SUM(total_amount), 0)
        FROM PaymentInvoice
        WHERE status = 'PAID'
    """)
    Integer getTotalRevenue();

    @Update("""
        UPDATE PaymentInvoice 
        SET 
            booking_id = #{payment.bookingId},
            room_amount = #{payment.roomAmount},
            service_amount = #{payment.serviceAmount},
            tax = #{payment.tax},
            total_amount = #{payment.totalAmount},
            payment_method = #{payment.paymentMethod},
            status = #{payment.status}
        WHERE id = #{payment.id}
    """)
    int updatePayment(@Param("payment") PaymentInvoice payment);

    @Delete("""
        DELETE FROM PaymentInvoice 
        WHERE id = #{id}
    """)
    int deletePayment(@Param("id") Integer id);
} 