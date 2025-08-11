package com.example.htms.biz.room.controller.rest;

import com.example.htms.biz.room.model.Room;
import com.example.htms.biz.room.model.criteria.RoomCriteria;
import com.example.htms.biz.room.model.dto.RoomDTO;
import com.example.htms.biz.room.service.RoomService;
import com.example.htms.common.http.model.Result;
import com.example.htms.common.http.model.ResultData;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "Room API v1")
@RestController
@RequestMapping("/api/v1/rooms")
public class RoomRestController {

    private final RoomService roomService;

    public RoomRestController(RoomService roomService) {
        this.roomService = roomService;
    }

    // ✅ GET ALL ROOMS (kèm ảnh)
    @GetMapping("")
    public ResultData<List<RoomDTO.Resp>> listRooms(RoomCriteria criteria) {
        List<Room> rooms = roomService.listRooms(criteria);
        List<RoomDTO.Resp> responses = rooms.stream()
                .map(RoomDTO.Resp::toResponse)
                .collect(Collectors.toList());
        return new ResultData<>("Success", responses, responses.size());
    }

    // ✅ GET ROOM BY ID (kèm ảnh)
    @GetMapping("/{id}")
    public ResultData<RoomDTO.Resp> getRoomById(@PathVariable Integer id) {
        Room room = roomService.findById(id);
        if (room == null) {
            return new ResultData<>("Error", null);
        }
        return new ResultData<>("Success", RoomDTO.Resp.toResponse(room));
    }

    // ✅ CREATE ROOM (kèm ảnh từ máy)
    @PostMapping(value = "", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('STAFF')")
    public Result createRoom(
            @RequestPart("room") RoomDTO.Req roomReq,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        try {
            roomService.insertWithImages(roomReq, images);
            return new Result("Success", "Room created with uploaded images.");
        } catch (Exception e) {
            return new Result("Error", e.getMessage());
        }
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('STAFF')")
    public Result updateRoom(
            @PathVariable Integer id,
            @RequestPart("room") RoomDTO.Req roomReq,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        try {
            roomReq.setId(id);
            roomService.updateWithImages(roomReq, images);
            return new Result("Success", "Room updated with images.");
        } catch (Exception e) {
            return new Result("Error", e.getMessage());
        }
    }

    // ✅ DEACTIVATE ROOM
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('STAFF')")
    public Result deactivateRoom(@PathVariable Integer id) {
        boolean success = roomService.deactivateRoom(id);
        return success
                ? new Result("Success", "Room marked as inactive.")
                : new Result("Error", "Room not found or already inactive.");
    }

    // ✅ DELETE ROOM
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public Result deleteRoom(@PathVariable Integer id) {
        boolean success = roomService.deleteRoomById(id);
        return success
                ? new Result("Success", "Room deleted successfully.")
                : new Result("Error", "Room not found or delete failed.");
    }

    // ✅ SEARCH ROOMS (tách endpoint)
    @GetMapping("/search")
    public ResultData<List<RoomDTO.Resp>> searchRooms(RoomCriteria criteria) {
        List<Room> result = roomService.listRooms(criteria);
        List<RoomDTO.Resp> responses = result.stream()
                .map(RoomDTO.Resp::toResponse)
                .collect(Collectors.toList());
        return new ResultData<>("Success", responses, responses.size());
    }
}
