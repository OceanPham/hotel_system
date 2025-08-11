package com.example.htms.biz.payment.service;

import com.example.htms.biz.booking.model.Booking;
import com.example.htms.biz.booking.service.BookingService;
import com.example.htms.biz.hottelservice.model.HottelService;
import com.example.htms.biz.hottelservice.service.HottelServiceService;
import com.example.htms.biz.included.model.Included;
import com.example.htms.biz.included.service.IncludedService;
import com.example.htms.biz.payment.model.PaymentInvoice;
import com.example.htms.biz.payment.model.criteria.PaymentInvoiceCriteria;
import com.example.htms.biz.payment.model.dto.PaymentInvoiceDTO;
import com.example.htms.biz.payment.repository.PaymentMapper;
import com.example.htms.biz.room.model.Room;
import com.example.htms.biz.room.service.RoomService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaymentInvoiceService {

    private final PaymentMapper paymentMapper;
    private final BookingService bookingService;
    private final RoomService roomService;
    private final IncludedService includedService;
    private final HottelServiceService hottelServiceService;

    public PaymentInvoiceService(PaymentMapper paymentMapper,
                                 BookingService bookingService,
                                 RoomService roomService,
                                 IncludedService includedService,
                                 HottelServiceService hottelServiceService) {
        this.paymentMapper = paymentMapper;
        this.bookingService = bookingService;
        this.roomService = roomService;
        this.includedService = includedService;
        this.hottelServiceService = hottelServiceService;
    }

    public List<PaymentInvoice> listPaymentInvoice(PaymentInvoiceCriteria criteria) {
        return paymentMapper.listPaymentInvoices(criteria);
    }

    public PaymentInvoice findById(Integer id) {
        return paymentMapper.findById(id);
    }

    public List<PaymentInvoice> findByBookingId(Integer bookingId) {
        return paymentMapper.findByBookingId(bookingId);
    }

    @Transactional
    public void create(PaymentInvoiceDTO.Req paymentInvoiceReq) {
        PaymentInvoice paymentInvoice = paymentInvoiceReq.toPaymentInvoice();
        int result = paymentMapper.insertPayment(paymentInvoice);
        if (result == 0) {
            throw new RuntimeException("Failed to create payment invoice.");
        }
    }

    public void insert(PaymentInvoiceDTO.Req paymentInvoiceReq) {
        Booking booking = bookingService.getBookingById(paymentInvoiceReq.getBookingId());
        if (booking == null) throw new RuntimeException("Booking not found id=" + paymentInvoiceReq.getBookingId());

        Room room = roomService.findById(booking.getRoomId());
        if (room == null) throw new RuntimeException("Room not found id=" + booking.getRoomId());

        int roomAmount = roomService.calculateRoomAmount(
                room, booking.getBookingType(),
                booking.getCheckInDate(), booking.getCheckOutDate()
        );

        int serviceAmount = calcServiceAmount(booking.getId());

        int tax = (int) ((roomAmount + serviceAmount) * 0.10);
        int totalAmount = roomAmount + serviceAmount + tax;

        PaymentInvoice pi = paymentInvoiceReq.toPaymentInvoice();
        pi.setRoomAmount(roomAmount);
        pi.setServiceAmount(serviceAmount);
        pi.setTax(tax);
        pi.setTotalAmount(totalAmount);

        if (paymentMapper.insertPayment(pi) == 0) {
            throw new RuntimeException("Failed to insert payment invoice.");
        }
    }

    public Integer getTotalRevenue() {
        return paymentMapper.getTotalRevenue();
    }

    @Transactional
    public void update(Integer id, PaymentInvoiceDTO.Req req) {
        PaymentInvoice old = paymentMapper.findById(id);
        if (old == null) throw new RuntimeException("Invoice not found id=" + id);

        Booking booking = bookingService.getBookingById(req.getBookingId());
        if (booking == null) throw new RuntimeException("Booking not found id=" + req.getBookingId());

        Room room = roomService.findById(booking.getRoomId());
        if (room == null) throw new RuntimeException("Room not found id=" + booking.getRoomId());

        int roomAmount = roomService.calculateRoomAmount(
                room, booking.getBookingType(),
                booking.getCheckInDate(), booking.getCheckOutDate());

        int serviceAmount = calcServiceAmount(booking.getId());

        int tax = (int) ((roomAmount + serviceAmount) * 0.10);
        int totalAmount = roomAmount + serviceAmount + tax;

        PaymentInvoice pi = req.toPaymentInvoice();
        pi.setId(id);
        pi.setRoomAmount(roomAmount);
        pi.setServiceAmount(serviceAmount);
        pi.setTax(tax);
        pi.setTotalAmount(totalAmount);
        pi.setCreatedAt(old.getCreatedAt());

        if (paymentMapper.updatePayment(pi) == 0) {
            throw new RuntimeException("Failed to update payment invoice.");
        }
    }

    @Transactional
    public void delete(Integer id) {
        PaymentInvoice existingPayment = paymentMapper.findById(id);
        if (existingPayment == null) {
            throw new RuntimeException("Payment invoice not found with id: " + id);
        }

        int result = paymentMapper.deletePayment(id);
        if (result == 0) {
            throw new RuntimeException("Failed to delete payment invoice.");
        }
    }

    private int calcServiceAmount(Integer bookingId) {
        List<Included> services = includedService.findByBookingId(bookingId);
        return services.stream()
                .mapToInt(s -> {
                    Integer price = (s.getPriceOverride() != null)
                            ? s.getPriceOverride()
                            : getDefaultHotelServicePrice(s.getServiceId());
                    return price * s.getQuantity();
                })
                .sum();
    }

    private Integer getDefaultHotelServicePrice(Integer hotelServiceId) {
        HottelService svc = hottelServiceService.findById(hotelServiceId);
        if (svc == null) throw new RuntimeException("HotelService not found id=" + hotelServiceId);
        return svc.getPrice();
    }
    public Integer findLatestTotalAmountByBookingId(Integer bookingId) {
        List<PaymentInvoice> invoices = paymentMapper.findByBookingId(bookingId);
        return invoices.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt())) // mới nhất
                .map(PaymentInvoice::getTotalAmount)
                .findFirst()
                .orElse(0);
    }
    public List<PaymentInvoiceDTO.PaymentInvoiceWithBookingDTO> getAllWithBooking() {
        List<PaymentInvoice> invoices = paymentMapper.listPaymentInvoices(new PaymentInvoiceCriteria());

        return invoices.stream().map(invoice -> {
            Booking booking = bookingService.getBookingById(invoice.getBookingId());
            Room room = (booking != null) ? roomService.findById(booking.getRoomId()) : null;
            return PaymentInvoiceDTO.PaymentInvoiceWithBookingDTO.from(invoice, booking, room);
        }).toList();
    }

}


