package com.example.htms.biz.payment.controller.rest;

import com.example.htms.biz.payment.model.PaymentInvoice;
import com.example.htms.biz.payment.model.criteria.PaymentInvoiceCriteria;
import com.example.htms.biz.payment.model.dto.PaymentInvoiceDTO;
import com.example.htms.biz.payment.service.PaymentInvoiceService;
import com.example.htms.common.http.model.Result;
import com.example.htms.common.http.model.ResultData;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Payment Invoice API v1")
@RestController
@RequestMapping("/api/v1/payment-invoices")
public class PaymentInvoiceRestController {

    private final PaymentInvoiceService paymentInvoiceService;

    public PaymentInvoiceRestController(PaymentInvoiceService paymentInvoiceService) {
        this.paymentInvoiceService = paymentInvoiceService;
    }

    @GetMapping("")
    @PreAuthorize("hasAnyRole('STAFF', 'ACCOUNTANT')")
    public ResultData<List<PaymentInvoice>> listPaymentInvoices(PaymentInvoiceCriteria criteria) {
        List<PaymentInvoice> paymentInvoices = paymentInvoiceService.listPaymentInvoice(criteria);
        return new ResultData<>("Success", paymentInvoices, paymentInvoices.size());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ACCOUNTANT')")
    public ResultData<PaymentInvoiceDTO.Resp> getPaymentInvoiceById(@PathVariable Integer id) {
        PaymentInvoice paymentInvoice = paymentInvoiceService.findById(id);
        if (paymentInvoice == null) {
            return new ResultData<>("Error", "Payment invoice not found", (PaymentInvoiceDTO.Resp) null);
        }
        return new ResultData<>("Success", PaymentInvoiceDTO.Resp.toResponse(paymentInvoice));
    }
    @GetMapping("/with-booking")
    @PreAuthorize("hasAnyRole('STAFF', 'ACCOUNTANT')")
    public ResultData<List<PaymentInvoiceDTO.PaymentInvoiceWithBookingDTO>> listWithBooking() {
        List<PaymentInvoiceDTO.PaymentInvoiceWithBookingDTO> result = paymentInvoiceService.getAllWithBooking();
        return new ResultData<>("Success", result, result.size());
    }

    @PostMapping("")
    @PreAuthorize("hasAnyRole('STAFF', 'ACCOUNTANT','USER')")
    public Result createPaymentInvoice(@RequestBody PaymentInvoiceDTO.Req paymentInvoiceReq) {
        try {
            paymentInvoiceService.create(paymentInvoiceReq);
            return new Result("Success", "Payment invoice created successfully.");
        } catch (Exception e) {
            return new Result("Error", "Failed to create payment invoice.");
        }
    }

//    @PutMapping("/{id}")
//    @PreAuthorize("hasAnyRole('STAFF', 'ACCOUNTANT')")
//    public Result updatePaymentInvoice(@PathVariable Integer id, @RequestBody PaymentInvoiceDTO.Req paymentInvoiceReq) {
//        try {
//            paymentInvoiceService.update(id, paymentInvoiceReq);
//            return new Result("Success", "Payment invoice updated successfully.");
//        } catch (RuntimeException e) {
//            return new Result("Error", e.getMessage());
//        } catch (Exception e) {
//            return new Result("Error", "Failed to update payment invoice.");
//        }
//    }

    @DeleteMapping("/{id}")
    public Result deletePaymentInvoice(@PathVariable Integer id) {
        try {
            paymentInvoiceService.delete(id);
            return new Result("Success", "Payment invoice deleted successfully.");
        } catch (RuntimeException e) {
            return new Result("Error", e.getMessage());
        } catch (Exception e) {
            return new Result("Error", "Failed to delete payment invoice.");
        }
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasAnyRole('ACCOUNTANT')")
    public ResultData<Integer> getTotalRevenue() {
        Integer totalRevenue = paymentInvoiceService.getTotalRevenue();
        return new ResultData<>("Success", totalRevenue);
    }
    @GetMapping("/total-by-booking/{bookingId}")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ACCOUNTANT')")
    public ResultData<Integer> getTotalAmountByBookingId(@PathVariable Integer bookingId) {
        Integer totalAmount = paymentInvoiceService.findLatestTotalAmountByBookingId(bookingId);
        return new ResultData<>("Success", totalAmount);
    }

} 