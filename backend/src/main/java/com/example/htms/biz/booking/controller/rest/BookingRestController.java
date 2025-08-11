package com.example.htms.biz.booking.controller.rest;

import com.example.htms.biz.booking.model.Booking;
import com.example.htms.biz.booking.model.dto.BookingDTO;
import com.example.htms.biz.booking.service.BookingService;
import com.example.htms.biz.user.service.UserService;
import com.example.htms.common.http.model.ResultData;

import com.example.htms.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import static com.example.htms.security.SecurityUtils.getCurrentUserId;

@RestController
@RequestMapping("/api/bookings")
public class BookingRestController {

    private final BookingService bookingService;
    private final UserService userService;

    public BookingRestController(BookingService bookingService, UserService userService) {
        this.bookingService = bookingService;
        this.userService = userService;
    }


    @GetMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ResultData<List<BookingDTO.Resp>>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        List<BookingDTO.Resp> result = bookings.stream()
                .map(BookingDTO.Resp::fromBooking)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ResultData<>("SUCCESS", result, result.size()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'STAFF')")
    public ResponseEntity<ResultData<BookingDTO.Resp>> getBookingById(@PathVariable Integer id) {
        Booking booking = bookingService.getBookingById(id);
        if (booking == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResultData<>("FAIL", "Booking not found", (BookingDTO.Resp) null));
        }
        return ResponseEntity.ok(new ResultData<>("SUCCESS", BookingDTO.Resp.fromBooking(booking)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ResultData<List<BookingDTO.Resp>>> getMyBookings() {
        String currentUsername = SecurityUtils.getCurrentUsername();

        List<Booking> bookings = bookingService.getBookingsByUsername(currentUsername);
        List<BookingDTO.Resp> result = bookings.stream()
                .map(BookingDTO.Resp::fromBooking)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ResultData<>("SUCCESS", result, result.size()));
    }


    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ResultData<BookingDTO.CreatedResp>> createBooking(@Valid @RequestBody BookingDTO.Req req) {
        try {
            Integer userId = bookingService.getUserIdByFullName(req.getFullName());
            Integer roomId = bookingService.getRoomIdByRoomNumber(req.getRoomNumber());

            if (userId == null || roomId == null) {
                return ResponseEntity.badRequest()
                        .body(new ResultData<>("FAIL",  null));
            }

            Booking booking = req.toBooking(userId, roomId);
            int insertedBookingId = bookingService.insertBookingAndReturnId(booking);

            if (insertedBookingId > 0) {
                BookingDTO.CreatedResp response = new BookingDTO.CreatedResp(insertedBookingId, userId, roomId);
                return ResponseEntity.status(HttpStatus.CREATED)
                        .body(new ResultData<>("SUCCESS", "Booking created successfully", response));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResultData<>("FAIL",  null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResultData<>( e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ResultData<String>> updateBooking(@PathVariable Integer id,
                                                            @Valid @RequestBody BookingDTO.Req req) {
        try {
            Booking existing = bookingService.getBookingById(id);
            if (existing == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResultData<>("FAIL",null));
            }

            Integer currentUserId = getCurrentUserId(userService);
            if (!existing.getUserId().equals(currentUserId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ResultData<>("FAIL", null));
            }

            Integer roomId = bookingService.getRoomIdByRoomNumber(req.getRoomNumber());
            if (roomId == null) {
                return ResponseEntity.badRequest()
                        .body(new ResultData<>("FAIL",  null));
            }

            Booking booking = req.toBooking(currentUserId, roomId);
            booking.setId(id);
            int result = bookingService.updateBooking(booking);

            if (result > 0) {
                return ResponseEntity.ok(new ResultData<>("SUCCESS",  null));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResultData<>("FAIL",  null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResultData<>( e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ResultData<String>> deleteBooking(@PathVariable Integer id) {
        Booking existing = bookingService.getBookingById(id);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResultData<>("FAIL",  null));
        }

        Integer currentUserId = SecurityUtils.getCurrentUserId(userService);

        if (!existing.getUserId().equals(currentUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ResultData<>("FAIL", null));
        }

        int result = bookingService.deleteBooking(id);
        if (result > 0) {
            return ResponseEntity.ok(new ResultData<>("SUCCESS", null));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResultData<>("FAIL",  null));
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ResultData<List<BookingDTO.Resp>>> searchBookings(
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String roomNumber,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDate checkInDateFrom,
            @RequestParam(required = false) LocalDate checkInDateTo,
            @RequestParam(required = false) LocalDate checkOutDateFrom,
            @RequestParam(required = false) LocalDate checkOutDateTo,
            @RequestParam(required = false) String bookingType
    ) {
        List<Booking> bookings = bookingService.searchBookings(
                fullName, roomNumber, status,
                checkInDateFrom, checkInDateTo,
                checkOutDateFrom, checkOutDateTo,
                bookingType
        );

        List<BookingDTO.Resp> result = bookings.stream()
                .map(BookingDTO.Resp::fromBooking)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ResultData<>("SUCCESS", result, result.size()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ResultData<String>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(new ResultData<>( e.getMessage(), null));
    }
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ResultData<String>> cancelBooking(@PathVariable Integer id) {
        Integer currentUserId = SecurityUtils.getCurrentUserId(userService);

        Booking booking = bookingService.getBookingById(id);

        if (booking == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResultData<>("FAIL", "Booking not found", (String)null));
        }

        if (!booking.getUserId().equals(currentUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ResultData<>("FAIL", "Access denied", (String)null));
        }

        if (!"confirmed".equalsIgnoreCase(booking.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResultData<>("FAIL", "Only confirmed bookings can be cancelled", (String)null));
        }

        int result = bookingService.cancelBookingByUser(id, currentUserId);
        if (result > 0) {
            return ResponseEntity.ok(new ResultData<>("SUCCESS", "Booking cancelled successfully", (String)null));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResultData<>("FAIL", "Failed to cancel booking", (String)null));
        }
    }

}
