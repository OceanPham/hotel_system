package com.example.htms.biz.payment.model.criteria;

import lombok.Data;

@Data
public class PaymentInvoiceCriteria {
    private Integer bookingId;
    private String paymentMethod;
    private String status;
} 