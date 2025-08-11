package com.example.htms.biz.feedback.model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class Feedback {
    private Integer id;
    private Integer userId;
    private Integer bookingId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private String userName;     // Thêm
    private String roomNumber;   // Thêm

}
