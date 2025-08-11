package com.example.htms.biz.feedback.service;

import com.example.htms.biz.booking.model.Booking;
import com.example.htms.biz.booking.repository.BookingMapper;
import com.example.htms.biz.feedback.model.Feedback;
import com.example.htms.biz.feedback.model.criteria.FeedbackCriteria;
import com.example.htms.biz.feedback.model.dto.FeedbackDTO;
import com.example.htms.biz.feedback.repository.FeedbackMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackMapper feedbackMapper;
    private final BookingMapper bookingMapper;

    // Lấy danh sách feedback theo tiêu chí
    public List<Feedback> listFeedbacks(FeedbackCriteria criteria) {
        return feedbackMapper.listFeedbacks(criteria);
    }

    // Tìm 1 feedback theo ID
    public Feedback findById(Integer id) {
        return feedbackMapper.findById(id);
    }

    public boolean isOwnedByUser(Integer feedbackId, Integer userId) {
        Feedback feedback = feedbackMapper.findById(feedbackId); // cần bổ sung mapper nếu chưa có
        if (feedback == null) return false;

        Booking booking = bookingMapper.getBookingById(feedback.getBookingId());
        return booking != null && booking.getUserId().equals(userId);
    }
    // ✅ NEW: Lấy danh sách feedback theo roomId (có userName, roomNumber)
    public List<FeedbackDTO.Resp> getFeedbackDTOsByRoomId(Integer roomId) {
        List<Feedback> feedbacks = feedbackMapper.findByRoomId(roomId); // Query đã JOIN đủ user + room
        return feedbacks.stream()
                .map(fb -> FeedbackDTO.Resp.fromFeedback(fb, fb.getUserName(), fb.getRoomNumber()))
                .collect(Collectors.toList());
    }

    // Thêm feedback mới
    public void insert(FeedbackDTO.Req req, Integer userId) {
        Feedback feedback = req.toFeedback(userId);
        feedbackMapper.insertFeedback(feedback);

        if (feedback.getId() == null) {
            throw new RuntimeException("Insert feedback failed");
        }
    }

    // Cập nhật nội dung comment và rating (nếu cần)
    public boolean updateFeedback(Feedback feedback) {
        Feedback existing = feedbackMapper.findById(feedback.getId());
        if (existing == null) return false;

        if (feedback.getRating() == null) feedback.setRating(existing.getRating());
        if (feedback.getComment() == null) feedback.setComment(existing.getComment());

        return feedbackMapper.updateFeedback(feedback) > 0;
    }

    // Xoá feedback
    public boolean deleteFeedback(Integer id) {
        Feedback feedback = feedbackMapper.findById(id);
        if (feedback == null) return false;

        return feedbackMapper.deleteFeedback(id) > 0;
    }
    public Feedback findByBookingIdAndUserId(Integer bookingId, Integer userId) {
        return feedbackMapper.findByBookingIdAndUserId(bookingId, userId);
    }
    public Double getAverageRating(Integer roomId) {
        return feedbackMapper.getAverageRatingByRoomId(roomId);
    }

}
