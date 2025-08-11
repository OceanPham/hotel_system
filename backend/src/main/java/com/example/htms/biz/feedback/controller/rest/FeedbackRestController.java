package com.example.htms.biz.feedback.controller.rest;

import com.example.htms.biz.feedback.model.Feedback;
import com.example.htms.biz.feedback.model.criteria.FeedbackCriteria;
import com.example.htms.biz.feedback.model.dto.FeedbackDTO;
import com.example.htms.biz.feedback.service.FeedbackService;
import com.example.htms.biz.booking.service.BookingService;
import com.example.htms.biz.room.service.RoomService;
import com.example.htms.biz.user.service.UserService;
import com.example.htms.common.http.model.Result;
import com.example.htms.common.http.model.ResultData;
import com.example.htms.security.SecurityUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "Feedback API v1")
@RestController
@RequestMapping("/api/v1/feedbacks")
public class FeedbackRestController {

    private final FeedbackService feedbackService;
    private final BookingService bookingService;
    private final RoomService roomService;
    private final UserService userService;


    public FeedbackRestController(FeedbackService feedbackService, BookingService bookingService, RoomService roomService,UserService userService) {
        this.feedbackService = feedbackService;
        this.bookingService = bookingService;
        this.roomService = roomService;
        this.userService = userService;
    }

    @GetMapping("")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ACCOUNTANT')")
    public ResultData<List<FeedbackDTO.Resp>> listFeedbacks(FeedbackCriteria criteria) {
        List<Feedback> list = feedbackService.listFeedbacks(criteria);

        List<FeedbackDTO.Resp> result = list.stream()
                .map(fb -> {
                    String userName = bookingService.findUserNameByBookingId(fb.getBookingId()); // bạn cần hàm này
                    String roomNumber = bookingService.findRoomNumberByBookingId(fb.getBookingId()); // hoặc thông qua roomService
                    return FeedbackDTO.Resp.fromFeedback(fb, userName, roomNumber);
                })
                .collect(Collectors.toList());

        return new ResultData<>("Success", result, result.size());
    }
    @GetMapping("/room/{roomId}")
    public ResultData<List<FeedbackDTO.Resp>> getFeedbacksByRoom(@PathVariable Integer roomId) {
        List<FeedbackDTO.Resp> feedbacks = feedbackService.getFeedbackDTOsByRoomId(roomId);
        return new ResultData<>("Success", feedbacks, feedbacks.size());
    }


    @PostMapping("")
    @PreAuthorize("hasRole('USER')")
    public Result createFeedback(@RequestBody FeedbackDTO.Req req) {
        try {
            Integer currentUserId = SecurityUtils.getCurrentUserId(userService);

            // Kiểm tra booking này có thuộc user hiện tại không
            if (!bookingService.isOwnedByUser(req.getBookingId(), currentUserId)) {
                return new Result("Error", "You are not allowed to give feedback for this booking.");
            }

            feedbackService.insert(req, currentUserId);
            return new Result("Success", "Feedback submitted.");
        } catch (Exception e) {
            return new Result("Error", "Failed to submit feedback.");
        }
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public Result updateFeedback(@PathVariable Integer id,
                                 @RequestBody Feedback feedback) {
        Integer currentUserId = SecurityUtils.getCurrentUserId(userService);
        if (!feedbackService.isOwnedByUser(id, currentUserId)) {
            return new Result("Error", "You are not authorized to update this feedback.");
        }

        feedback.setId(id);
        boolean success = feedbackService.updateFeedback(feedback);

        return success
                ? new Result("Success", "Feedback updated successfully.")
                : new Result("Error", "Feedback not found or update failed.");
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public Result deleteFeedback(@PathVariable Integer id) {
        Integer currentUserId = SecurityUtils.getCurrentUserId(userService);
        if (!feedbackService.isOwnedByUser(id, currentUserId)) {
            return new Result("Error", "You are not authorized to delete this feedback.");
        }

        boolean success = feedbackService.deleteFeedback(id);

        return success
                ? new Result("Success", "Feedback deleted successfully.")
                : new Result("Error", "Feedback not found.");
    }
    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('USER')")
    public ResultData<FeedbackDTO.Resp> getFeedbackByBooking(@PathVariable Integer bookingId) {
        Integer currentUserId = SecurityUtils.getCurrentUserId(userService);

        Feedback feedback = feedbackService.findByBookingIdAndUserId(bookingId, currentUserId);
        if (feedback == null) {
            return new ResultData<FeedbackDTO.Resp>("No feedback found", null, 0);
        }


        String userName = userService.getUserById(currentUserId).getFullName();
        String roomNumber = bookingService.findRoomNumberByBookingId(bookingId);

        FeedbackDTO.Resp resp = FeedbackDTO.Resp.fromFeedback(feedback, userName, roomNumber);
        return new ResultData<>("Success", resp, 1);
    }
    @GetMapping("/room/{roomId}/average-rating")
    public ResultData<Double> getAverageRating(@PathVariable Integer roomId) {
        Double avgRating = feedbackService.getAverageRating(roomId);
        if (avgRating == null) {
            avgRating = 0.0; // Phòng chưa có đánh giá
        }
        return new ResultData<>("Success", avgRating, 1);
    }

}
