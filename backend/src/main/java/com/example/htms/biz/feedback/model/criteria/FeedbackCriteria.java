package com.example.htms.biz.feedback.model.criteria;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FeedbackCriteria {
    private Integer userId;
    private Integer roomId;
    private Integer ratingFrom;           // lọc theo số sao từ...
    private Integer ratingTo;             // ...đến
    private LocalDateTime createdAtFrom;  // thời gian tạo từ
    private LocalDateTime createdAtTo;    // thời gian tạo đến
}
