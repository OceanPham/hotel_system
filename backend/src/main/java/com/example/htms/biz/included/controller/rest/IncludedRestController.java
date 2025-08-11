package com.example.htms.biz.included.controller.rest;

import com.example.htms.biz.hottelservice.model.HottelService;
import com.example.htms.biz.hottelservice.service.HottelServiceService;
import com.example.htms.biz.included.model.Included;
import com.example.htms.biz.included.model.criteria.IncludedCriteria;
import com.example.htms.biz.included.model.dto.IncludedDTO;
import com.example.htms.biz.included.service.IncludedService;
import com.example.htms.biz.booking.service.BookingService;
import com.example.htms.biz.booking.model.Booking;
import com.example.htms.common.http.model.Result;
import com.example.htms.common.http.model.ResultData;
import com.example.htms.security.SecurityUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "Included API v1")
@RestController
@RequestMapping("/api/v1/includeds")
public class IncludedRestController {

    private final IncludedService includedService;
    private final HottelServiceService hottelServiceService;
    private final BookingService bookingService;

    public IncludedRestController(IncludedService includedService, HottelServiceService hottelServiceService, BookingService bookingService) {
        this.includedService = includedService;
        this.hottelServiceService = hottelServiceService;
        this.bookingService = bookingService;
    }

    @GetMapping("")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ACCOUNTANT')")
    public ResultData<List<IncludedDTO.Resp>> listIncludeds(IncludedCriteria criteria) {
        List<Included> includeds = includedService.listIncluded(criteria);
        List<IncludedDTO.Resp> result = includeds.stream()
                .map(included -> {
                    HottelService svc = hottelServiceService.findById(included.getServiceId());
                    Booking booking = bookingService.getBookingById(included.getBookingId());
                    String fullName = booking != null ? booking.getUserName() : "";
                    return IncludedDTO.Resp.fromRecord(included, svc, fullName);
                })
                .collect(Collectors.toList());
        return new ResultData<>("Success", result, result.size());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ACCOUNTANT')")
    public ResultData<IncludedDTO.Resp> getIncludedById(@PathVariable Integer id) {
        Included included = includedService.findById(id);
        if (included == null) {
            return new ResultData<>("Error", "Service not found", (IncludedDTO.Resp) null);
        }
        HottelService svc = hottelServiceService.findById(included.getServiceId());
        Booking booking = bookingService.getBookingById(included.getBookingId());
        String fullName = booking != null ? booking.getUserName() : "";
        return new ResultData<>("Success", IncludedDTO.Resp.fromRecord(included, svc, fullName));
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ACCOUNTANT')")
    public ResultData<List<IncludedDTO.Resp>> getIncludedByBookingId(@PathVariable Integer bookingId) {
        List<Included> includeds = includedService.findByBookingId(bookingId);
        List<IncludedDTO.Resp> result = includeds.stream()
            .map(included -> {
                HottelService svc = hottelServiceService.findById(included.getServiceId());
                Booking booking = bookingService.getBookingById(included.getBookingId());
                String fullName = booking != null ? booking.getUserName() : "";
                return IncludedDTO.Resp.fromRecord(included, svc, fullName);
            })
            .collect(Collectors.toList());
        return new ResultData<>("Success", result, result.size());
    }

    @PostMapping("")
    @PreAuthorize("hasRole('USER')")
    public Result createIncluded(@RequestBody IncludedDTO.Req includedReq) {
        try {
            includedService.insert(includedReq);
            return new Result("Success", "Service created successfully.");
        } catch (IllegalArgumentException e) {
            return new Result("Error", e.getMessage());
        } catch (Exception e) {
            return new Result("Error", "Insert failed.");
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public Result updateIncluded(@PathVariable Integer id, @RequestBody IncludedDTO.Req req) {
        try {
            req.setId(id);

            Included existing = includedService.findById(id);
            String currentUser = SecurityUtils.getCurrentUsername();

            if (existing == null) {
                return new Result("Error", "Included not found.");
            }

            Booking booking = bookingService.getBookingById(existing.getBookingId());
            if (booking == null || !booking.getUserName().equals(currentUser)) {
                return new Result("Error", "Permission denied.");
            }

            boolean success = includedService.updateIncluded(req.toIncluded());

            return success
                    ? new Result("Success", "Service updated successfully.")
                    : new Result("Error", "Update failed.");
        } catch (Exception e) {
            return new Result("Error", "Update failed.");
        }
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public Result deleteIncluded(@PathVariable Integer id) {
        Included existing = includedService.findById(id);
        String currentUser = SecurityUtils.getCurrentUsername();

        if (existing == null) {
            return new Result("Error", "Included not found.");
        }

        Booking booking = bookingService.getBookingById(existing.getBookingId());
        if (booking == null || !booking.getUserName().equals(currentUser)) {
            return new Result("Error", "Permission denied.");
        }

        boolean success = includedService.deleteIncluded(id);

        return success
                ? new Result("Success", "Service deleted successfully.")
                : new Result("Error", "Delete failed.");
    }

}
