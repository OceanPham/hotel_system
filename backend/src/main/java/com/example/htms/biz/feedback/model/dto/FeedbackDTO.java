package com.example.htms.biz.feedback.model.dto;

import com.example.htms.biz.feedback.model.Feedback;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

public class FeedbackDTO {

    @Getter
    @Setter
    public static class Resp {
        private Integer id;
        private String userName;
        private String roomNumber;
        private Integer rating;
        private String comment;
        private LocalDateTime createdAt;

        public static Resp fromFeedback(Feedback feedback, String userName, String roomNumber) {
            Resp resp = new Resp();
            resp.setId(feedback.getId());
            resp.setUserName(userName);
            resp.setRoomNumber(roomNumber);
            resp.setRating(feedback.getRating());
            resp.setComment(feedback.getComment());
            resp.setCreatedAt(feedback.getCreatedAt());
            return resp;
        }
    }

    @Getter
    @Setter
    public static class Req {
        @NotNull
        private Integer bookingId;

        @NotNull
        @Min(1)
        @Max(5)
        private Integer rating;
        private String comment;

        /**
         * Hàm ánh xạ sang entity Feedback. userId cần truyền từ controller.
         */
        public Feedback toFeedback(Integer userId) {
            Feedback feedback = new Feedback();
            feedback.setUserId(userId);
            feedback.setBookingId(bookingId);
            feedback.setRating(rating);
            feedback.setComment(comment);
            feedback.setCreatedAt(LocalDateTime.now());
            return feedback;
        }
    }
}
