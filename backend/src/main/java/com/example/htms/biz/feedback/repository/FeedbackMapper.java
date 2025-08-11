package com.example.htms.biz.feedback.repository;

import com.example.htms.biz.feedback.model.Feedback;
import com.example.htms.biz.feedback.model.criteria.FeedbackCriteria;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface FeedbackMapper {

    @Select("""
        SELECT 
            f.id,
            f.user_id AS userId,
            f.booking_id AS bookingId,
            f.rating,
            f.comment,
            f.created_at AS createdAt
        FROM Feedback f
        JOIN Booking b ON f.booking_id = b.id
        JOIN Room r ON b.room_id = r.id
        WHERE
            (#{criteria.userId} IS NULL OR f.user_id = #{criteria.userId})
            AND (#{criteria.roomId} IS NULL OR r.id = #{criteria.roomId})
            AND (#{criteria.ratingFrom} IS NULL OR f.rating >= #{criteria.ratingFrom})
            AND (#{criteria.ratingTo} IS NULL OR f.rating <= #{criteria.ratingTo})
            AND (#{criteria.createdAtFrom} IS NULL OR f.created_at >= #{criteria.createdAtFrom})
            AND (#{criteria.createdAtTo} IS NULL OR f.created_at <= #{criteria.createdAtTo})
        ORDER BY f.created_at DESC
    """)
    List<Feedback> listFeedbacks(@Param("criteria") FeedbackCriteria criteria);
    @Select("""
    SELECT 
        f.id,
        f.user_id AS userId,
        f.booking_id AS bookingId,
        f.rating,
        f.comment,
        f.created_at AS createdAt,
        u.full_name AS userName,
        r.room_number AS roomNumber
    FROM Feedback f
    JOIN Booking b ON f.booking_id = b.id
    JOIN Room r ON b.room_id = r.id
    JOIN UserAccount u ON f.user_id = u.id
    WHERE r.id = #{roomId}
    ORDER BY f.created_at DESC
""")
    @Results(id = "feedbackWithUserAndRoom", value = {
            @Result(column = "id", property = "id"),
            @Result(column = "userId", property = "userId"),
            @Result(column = "bookingId", property = "bookingId"),
            @Result(column = "rating", property = "rating"),
            @Result(column = "comment", property = "comment"),
            @Result(column = "createdAt", property = "createdAt"),
            // Dưới đây dùng ResultMap tạm thời nếu bạn muốn giữ DTO ở service
    })
    List<Feedback> findByRoomId(@Param("roomId") Integer roomId);

    @Select("""
        SELECT 
            f.id,
            f.user_id AS userId,
            f.booking_id AS bookingId,
            f.rating,
            f.comment,
            f.created_at AS createdAt
        FROM Feedback f
        WHERE f.id = #{id}
    """)
    Feedback findById(@Param("id") Integer id);

    @Insert("""
        INSERT INTO Feedback (user_id, booking_id, rating, comment, created_at)
        VALUES (#{feedback.userId}, #{feedback.bookingId}, #{feedback.rating}, #{feedback.comment}, #{feedback.createdAt})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertFeedback(@Param("feedback") Feedback feedback);

    @Update("""
        UPDATE Feedback
        SET 
            rating = #{feedback.rating},
            comment = #{feedback.comment}
        WHERE id = #{feedback.id}
    """)
    int updateFeedback(@Param("feedback") Feedback feedback);

    @Delete("DELETE FROM Feedback WHERE id = #{id}")
    int deleteFeedback(@Param("id") Integer id);
    @Select("""
    SELECT 
        f.id, f.user_id AS userId, f.booking_id AS bookingId,
        f.rating, f.comment, f.created_at AS createdAt
    FROM Feedback f
    WHERE f.booking_id = #{bookingId} AND f.user_id = #{userId}
""")
    Feedback findByBookingIdAndUserId(@Param("bookingId") Integer bookingId, @Param("userId") Integer userId);
    @Select("""
    SELECT AVG(f.rating) AS averageRating
    FROM Feedback f
    JOIN Booking b ON f.booking_id = b.id
    WHERE b.room_id = #{roomId}
""")
    Double getAverageRatingByRoomId(@Param("roomId") Integer roomId);

}
