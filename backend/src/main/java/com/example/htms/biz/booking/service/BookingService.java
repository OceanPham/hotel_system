package com.example.htms.biz.booking.service;

import com.example.htms.biz.booking.model.Booking;
import com.example.htms.biz.booking.repository.BookingMapper;
import com.example.htms.biz.room.model.Room;
import com.example.htms.biz.room.service.RoomService;
import com.example.htms.biz.roomimage.model.RoomImage;
import com.example.htms.biz.roomimage.repository.RoomImageMapper;
import com.example.htms.biz.user.model.User;
import com.example.htms.biz.user.service.UserService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {

    private final BookingMapper bookingMapper;
    private final UserService userService;
    private final RoomService roomService;
    private final RoomImageMapper roomImageMapper;
    private final JavaMailSender mailSender;
    private final String fromEmail;

    public BookingService(BookingMapper bookingMapper,
                          UserService userService,
                          RoomService roomService,
                          RoomImageMapper roomImageMapper,
                          JavaMailSender mailSender,
                          @Value("${mail.from}") String fromEmail) {
        this.bookingMapper = bookingMapper;
        this.userService = userService;
        this.roomService = roomService;
        this.roomImageMapper = roomImageMapper;
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    public List<Booking> getBookingsByUsername(String username) {
        return bookingMapper.findBookingsByUsername(username);
    }

    public List<Booking> getAllBookings() {
        List<Booking> bookings = bookingMapper.getAllBookings();

        for (Booking booking : bookings) {
            List<RoomImage> images = roomImageMapper.findByRoomId(booking.getRoomId());
            RoomImage mainImage = images.stream()
                    .filter(RoomImage::getIsMain)
                    .findFirst()
                    .orElse(null);

            if (mainImage != null) {
                String imageUrl = mainImage.getImageUrl();
                if (imageUrl.startsWith("http")) {
                    booking.setMainImageUrl(imageUrl);
                } else {
                    booking.setMainImageUrl("/uploads/" + imageUrl);
                }
            }
        }

        return bookings;
    }

    public Booking getBookingById(Integer id) {
        return bookingMapper.getBookingById(id);
    }

    @Transactional
    public int insertBooking(Booking booking) {
        validateBookingDates(booking, false);
        int result = bookingMapper.insertBooking(booking);
        if (result > 0) {
            sendBookingConfirmationEmail(booking);
        }

        return result;
    }

    @Transactional
    public int updateBooking(Booking booking) {
        if (bookingMapper.getBookingById(booking.getId()) == null) {
            throw new IllegalArgumentException("Booking not found");
        }
        validateBookingDates(booking, true);
        return bookingMapper.updateBooking(booking);
    }

    @Transactional
    public int deleteBooking(Integer id) {
        return bookingMapper.deleteBooking(id);
    }

    public List<Booking> searchBookings(
            String fullName,
            String roomNumber,
            String status,
            LocalDate checkInDateFrom,
            LocalDate checkInDateTo,
            LocalDate checkOutDateFrom,
            LocalDate checkOutDateTo,
            String bookingType
    ) {
        return bookingMapper.searchBookings(
                fullName,
                roomNumber,
                status,
                checkInDateFrom,
                checkInDateTo,
                checkOutDateFrom,
                checkOutDateTo,
                bookingType
        );
    }

    private void validateBookingDates(Booking booking, boolean isUpdate) {
        LocalDate today = LocalDate.now();

        if (booking.getCheckInDate() == null || booking.getCheckOutDate() == null) {
            throw new IllegalArgumentException("Check-in and check-out dates must not be null");
        }

        if (booking.getCheckInDate().isBefore(today)) {
            throw new IllegalArgumentException("Check-in date must not be in the past");
        }

        if (booking.getCheckInDate().isAfter(booking.getCheckOutDate())) {
            throw new IllegalArgumentException("Check-in date must be before check-out date");
        }

        int overlapping = isUpdate
                ? bookingMapper.countOverlappingBookingsExcludeIdByRoomNumber(
                booking.getRoomNumber(),
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                booking.getId())
                : bookingMapper.countOverlappingBookingsByRoomNumber(
                booking.getRoomNumber(),
                booking.getCheckInDate(),
                booking.getCheckOutDate());

        if (overlapping > 0) {
            throw new IllegalArgumentException("Room is already booked during the selected dates");
        }
    }

    public Integer getUserIdByFullName(String fullName) {
        List<User> users = userService.getAllUsers();
        return users.stream()
                .filter(u -> u.getFullName().equalsIgnoreCase(fullName))
                .map(User::getId)
                .findFirst()
                .orElse(null);
    }

    public Integer getRoomIdByRoomNumber(String roomNumber) {
        List<Room> rooms = roomService.listRooms(null);
        return rooms.stream()
                .filter(r -> r.getRoomNumber().equalsIgnoreCase(roomNumber))
                .map(Room::getId)
                .findFirst()
                .orElse(null);
    }

    public String findUserNameByBookingId(Integer bookingId) {
        Booking booking = bookingMapper.getBookingById(bookingId);
        return booking != null ? booking.getUserName() : null;
    }

    public String findRoomNumberByBookingId(Integer bookingId) {
        Booking booking = bookingMapper.getBookingById(bookingId);
        return booking != null ? booking.getRoomNumber() : null;
    }

    private void sendBookingConfirmationEmail(Booking booking) {
        try {
            User user = userService.getUserById(booking.getUserId());
            Room room = roomService.getRoomById(booking.getRoomId());

            String userEmail = user.getEmail();
            String subject = "Xác nhận đặt phòng - HTMS Hotel";

            String content = String.format("""
                <html>
                  <body>
                    <h2>Xin chào %s,</h2>
                    <p>Đơn đặt phòng của bạn đã được xác nhận với các thông tin sau:</p>
                    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">
                      <tr><th>Họ tên</th><td>%s</td></tr>
                      <tr><th>Số phòng</th><td>%s</td></tr>
                      <tr><th>Loại phòng</th><td>%s</td></tr>
                      <tr><th>Ngày nhận phòng</th><td>%s</td></tr>
                      <tr><th>Ngày trả phòng</th><td>%s</td></tr>
                      <tr><th>Loại đặt phòng</th><td>%s</td></tr>
                      <tr><th>Ghi chú</th><td>%s</td></tr>
                      <tr><th>Trạng thái</th><td>%s</td></tr>
                    </table>
                    <p>Cảm ơn bạn đã tin tưởng HTMS Hotel!</p>
                  </body>
                </html>
                """,
                    user.getFullName(),
                    user.getFullName(),
                    room.getRoomNumber(),
                    room.getRoomType(),
                    booking.getCheckInDate(),
                    booking.getCheckOutDate(),
                    booking.getBookingType(),
                    booking.getNote() != null ? booking.getNote() : "(Không có)",
                    booking.getStatus()
            );

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            helper.setFrom(fromEmail);
            helper.setTo(userEmail);
            helper.setSubject(subject);
            helper.setText(content, true); // HTML content
            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email xác nhận đặt phòng: " + e.getMessage());
        }
    }

    public boolean isOwnedByUser(Integer bookingId, Integer userId) {
        Booking booking = bookingMapper.getBookingById(bookingId);
        return booking != null && booking.getUserId().equals(userId);
    }
    public int insertBookingAndReturnId(Booking booking) {
        validateBookingDates(booking, false);

        int result = bookingMapper.insertBooking(booking); // booking.id sẽ được set sau khi insert

        if (result > 0 && booking.getId() != null) {
            sendBookingConfirmationEmail(booking);
            return booking.getId(); // trả về id booking vừa tạo
        }

        return -1; // thất bại
    }
    @Transactional
    public int cancelBookingByUser(Integer bookingId, Integer userId) {
        Booking booking = bookingMapper.getBookingById(bookingId);
        if (booking == null || !booking.getUserId().equals(userId)) {
            return 0;
        }

        return bookingMapper.cancelBookingByUser(bookingId, userId);
    }
}