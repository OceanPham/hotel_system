package com.example.htms.biz.booking.repository;

import com.example.htms.biz.booking.model.Booking;
import com.example.htms.biz.feedback.model.Feedback;
import org.apache.ibatis.annotations.*;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface BookingMapper {

    // ------------------------- Fetch -------------------------

    @Select("""
        SELECT b.*, ua.full_name AS full_name, ua.email, ua.phone,
               r.room_number, r.room_type
        FROM Booking b
        JOIN UserAccount ua ON b.user_id = ua.id
        JOIN Room r ON b.room_id = r.id
    """)
    @Results(id = "bookingResultMap", value = {
            @Result(property = "id",           column = "id"),
            @Result(property = "userId",       column = "user_id"),
            @Result(property = "roomId",       column = "room_id"),
            @Result(property = "roomNumber",   column = "room_number"),
            @Result(property = "roomType",     column = "room_type"),
            @Result(property = "checkInDate",  column = "check_in_date"),
            @Result(property = "checkOutDate", column = "check_out_date"),
            @Result(property = "status",       column = "status"),
            @Result(property = "note",         column = "note"),
            @Result(property = "bookingType",  column = "booking_type"),
            @Result(property = "createdAt",    column = "created_at"),
            @Result(property = "fullName",     column = "full_name"),
            @Result(property = "email",        column = "email"),
            @Result(property = "phone",        column = "phone"),
            @Result(property = "images", column = "room_id",
                    javaType = List.class,
                    many = @Many(select = "com.example.htms.biz.roomimage.repository.RoomImageMapper.findByRoomId"))
    })
    List<Booking> getAllBookings();

    @Select("SELECT * FROM Feedback WHERE id = #{id}")
    Feedback findById(Integer id);
    @Select("""
    SELECT 
        b.*, 
        ua.username AS user_name,
        r.room_number, 
        r.room_name, 
        r.room_type,
        pi.total_amount
    FROM Booking b
    JOIN UserAccount ua ON b.user_id = ua.id
    JOIN Room r ON b.room_id = r.id
    LEFT JOIN PaymentInvoice pi ON pi.booking_id = b.id
    WHERE ua.username = #{username}
""")
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "userId", column = "user_id"),
            @Result(property = "roomId", column = "room_id"),
            @Result(property = "checkInDate", column = "check_in_date"),
            @Result(property = "checkOutDate", column = "check_out_date"),
            @Result(property = "status", column = "status"),
            @Result(property = "bookingType", column = "booking_type"),
            @Result(property = "createdAt", column = "created_at"),
            @Result(property = "note", column = "note"),
            @Result(property = "userName", column = "user_name"),
            @Result(property = "roomNumber", column = "room_number"),
            @Result(property = "roomName", column = "room_name"),
            @Result(property = "roomType", column = "room_type"),
            @Result(property = "totalAmount", column = "total_amount")
    })

    List<Booking> findBookingsByUsername(String username);

    @Select("""
        SELECT b.*, ua.full_name AS full_name, ua.email, ua.phone,
               r.room_number, r.room_type
        FROM Booking b
        JOIN UserAccount ua ON b.user_id = ua.id
        JOIN Room r ON b.room_id = r.id
        WHERE b.id = #{id}
    """)
    @ResultMap("bookingResultMap")
    Booking getBookingById(Integer id);

    // ------------------------- CRUD -------------------------

    @Insert("""
        INSERT INTO Booking (user_id, room_id, check_in_date, check_out_date, status, note, booking_type, created_at)
        VALUES (#{userId}, #{roomId}, #{checkInDate}, #{checkOutDate}, #{status}, #{note}, #{bookingType}, NOW())
    """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertBooking(Booking booking);

    @Update("""
        UPDATE Booking
        SET user_id = #{userId},
            room_id = #{roomId},
            check_in_date = #{checkInDate},
            check_out_date = #{checkOutDate},
            status = #{status},
            note = #{note},
            booking_type = #{bookingType}
        WHERE id = #{id}
    """)
    int updateBooking(Booking booking);
    @Update("""
        UPDATE Booking 
        SET status = 'cancelled'
        WHERE id = #{id} AND user_id = #{userId} AND status = 'confirmed'
    """)
    int cancelBookingByUser(@Param("id") Integer id, @Param("userId") Integer userId);

    @Delete("DELETE FROM Booking WHERE id = #{id}")
    int deleteBooking(Integer id);

    // ------------------------- Search -------------------------

    @Select("<script>" +
            "SELECT b.*, ua.full_name AS full_name, ua.email, ua.phone, r.room_number, r.room_type " +
            "FROM Booking b " +
            "JOIN UserAccount ua ON b.user_id = ua.id " +
            "JOIN Room r ON b.room_id = r.id " +
            "WHERE 1 = 1 " +
            "<if test='fullName   != null and fullName.trim()   != \"\"'> AND ua.full_name  LIKE CONCAT('%', #{fullName},  '%') </if>" +
            "<if test='roomNumber != null and roomNumber.trim() != \"\"'> AND r.room_number LIKE CONCAT('%', #{roomNumber}, '%') </if>" +
            "<if test='status     != null and status.trim()     != \"\"'> AND b.status       = #{status}       </if>" +
            "<if test='bookingType!= null and bookingType.trim()!= \"\"'> AND b.booking_type = #{bookingType}  </if>" +
            "<if test='checkInDateFrom  != null'> AND b.check_in_date  &gt;= #{checkInDateFrom}  </if>" +
            "<if test='checkInDateTo    != null'> AND b.check_in_date  &lt;= #{checkInDateTo}    </if>" +
            "<if test='checkOutDateFrom != null'> AND b.check_out_date &gt;= #{checkOutDateFrom} </if>" +
            "<if test='checkOutDateTo   != null'> AND b.check_out_date &lt;= #{checkOutDateTo}   </if>" +
            "</script>")
    @ResultMap("bookingResultMap")
    List<Booking> searchBookings(@Param("fullName")     String fullName,
                                 @Param("roomNumber")   String roomNumber,
                                 @Param("status")       String status,
                                 @Param("checkInDateFrom")  LocalDate checkInDateFrom,
                                 @Param("checkInDateTo")    LocalDate checkInDateTo,
                                 @Param("checkOutDateFrom") LocalDate checkOutDateFrom,
                                 @Param("checkOutDateTo")   LocalDate checkOutDateTo,
                                 @Param("bookingType")  String bookingType);

    // ------------------------- Overlap checks -------------------------

    @Select("""
        SELECT COUNT(*) FROM Booking b
        JOIN Room r ON b.room_id = r.id
        WHERE r.room_number = #{roomNumber}
        AND b.status = 'Confirmed'
        AND (b.check_in_date < #{checkOutDate} AND b.check_out_date > #{checkInDate})
    """)
    int countOverlappingBookingsByRoomNumber(@Param("roomNumber") String roomNumber,
                                             @Param("checkInDate") LocalDate checkInDate,
                                             @Param("checkOutDate") LocalDate checkOutDate);

    @Select("""
        SELECT COUNT(*) FROM Booking b
        JOIN Room r ON b.room_id = r.id
        WHERE r.room_number = #{roomNumber}
        AND b.status = 'Confirmed'
        AND (b.check_in_date < #{checkOutDate} AND b.check_out_date > #{checkInDate})
        AND b.id != #{id}
    """)
    int countOverlappingBookingsExcludeIdByRoomNumber(@Param("roomNumber") String roomNumber,
                                                      @Param("checkInDate") LocalDate checkInDate,
                                                      @Param("checkOutDate") LocalDate checkOutDate,
                                                      @Param("id") Integer excludeId);
}
