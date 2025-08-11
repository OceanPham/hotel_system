package com.example.htms.biz.room.service;

import com.example.htms.biz.room.model.Room;
import com.example.htms.biz.room.model.criteria.RoomCriteria;
import com.example.htms.biz.room.model.dto.RoomDTO;
import com.example.htms.biz.room.repository.RoomMapper;
import com.example.htms.biz.roomimage.model.dto.RoomImageDTO;
import com.example.htms.biz.roomimage.service.RoomImageService;
import com.example.htms.enumation.RoomStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class RoomService {

    private final RoomMapper roomMapper;
    private final RoomImageService roomImageService;

    @Value("${app.upload.room-image-path:uploads}")
    private String uploadDir;

    @Value("${app.public.room-image-url:/uploads/}")
    private String imageUrlPrefix;

    public RoomService(RoomMapper roomMapper, RoomImageService roomImageService) {
        this.roomMapper = roomMapper;
        this.roomImageService = roomImageService;
    }

    public List<Room> listRooms(RoomCriteria criteria) {
        return roomMapper.listRooms(criteria);
    }

    public Room findById(Integer id) {
        return roomMapper.findById(id);
    }

    public Room getRoomById(Integer id) {
        return findById(id);
    }

    // ✅ Tạo room (chưa xử lý ảnh trong hàm này)
    public void insert(RoomDTO.Req req) {
        int count = roomMapper.countByRoomNumber(req.getRoomNumber());
        if (count > 0) throw new IllegalArgumentException("Room number already exists.");

        Room room = req.toRoom();
        room.setStatus(RoomStatus.Vacant);
        roomMapper.insertRoom(room);

        if (room.getId() == null) throw new RuntimeException("Failed to insert room.");

        req.setId(room.getId()); // ✅ Gán lại ID cho req sau khi insert
    }

    public boolean updateRoom(RoomDTO.Req req) {
        Room existing = roomMapper.findById(req.getId());
        if (existing == null) return false;

        Room updated = req.toRoom();
        if (updated.getRoomName() == null) updated.setRoomName(existing.getRoomName());
        if (updated.getRoomNumber() == null) updated.setRoomNumber(existing.getRoomNumber());
        if (updated.getRoomType() == null) updated.setRoomType(existing.getRoomType());
        if (updated.getBasePrice() == null) updated.setBasePrice(existing.getBasePrice());
        if (updated.getStatus() == null) updated.setStatus(existing.getStatus());
        if (updated.getDescription() == null) updated.setDescription(existing.getDescription());

        boolean success = roomMapper.updateRoom(updated) > 0;

        if (success) {
            roomImageService.getImagesByRoomId(req.getId())
                    .forEach(img -> roomImageService.deleteImage(img.getId()));
        }

        return success;
    }

    public boolean deactivateRoom(Integer id) {
        Room room = roomMapper.findById(id);
        if (room == null) return false;
        return roomMapper.markRoomAsInactive(id) > 0;
    }

    public int calculateRoomAmount(Room room, String bookingType, LocalDate checkInDate, LocalDate checkOutDate) {
        int basePrice = room.getBasePrice();
        if ("Night".equalsIgnoreCase(bookingType)) {
            return (int) (basePrice * 0.5);
        } else {
            long days = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
            return basePrice * (int) days;
        }
    }

    public boolean deleteRoomById(Integer id) {
        Room room = roomMapper.findById(id);
        if (room == null) return false;

        roomImageService.getImagesByRoomId(id)
                .forEach(img -> roomImageService.deleteImage(img.getId()));
        return roomMapper.deleteRoomById(id) > 0;
    }

    // ✅ Tạo phòng kèm upload ảnh từ máy
    public void insertWithImages(RoomDTO.Req req, List<MultipartFile> images) {
        insert(req); // Gán ID vào req tại đây
        saveRoomImages(req.getId(), images, req);
    }

    // ✅ Cập nhật phòng kèm ảnh mới từ máy
    public void updateWithImages(RoomDTO.Req req, List<MultipartFile> images) {
        updateRoom(req); // Không tạo lại ID
        saveRoomImages(req.getId(), images, req);
    }

    // ✅ Ghi ảnh vào thư mục uploads và lưu imageUrl vào DB
    private void saveRoomImages(Integer roomId, List<MultipartFile> files, RoomDTO.Req req) {
        if (files == null || files.isEmpty()) return;

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            try {
                String imageUrl = uploadFileToStaticDirectory(file); // trả về /uploads/uuid.jpg
                RoomImageDTO.Req imageReq = new RoomImageDTO.Req();
                imageReq.setRoomId(roomId); // ✅ Không null
                imageReq.setImageUrl(imageUrl);
                imageReq.setIsMain(req.getImages() != null && req.getImages().size() > i &&
                        Boolean.TRUE.equals(req.getImages().get(i).getIsMain()));
                roomImageService.addImage(imageReq.toModel());
            } catch (IOException e) {
                throw new RuntimeException("Failed to save image: " + file.getOriginalFilename(), e);
            }
        }
    }

    // ✅ Ghi file vào thư mục uploads/ (ngoài target), trả về URL như /uploads/uuid.jpg
    private String uploadFileToStaticDirectory(MultipartFile file) throws IOException {
        String ext = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf('.'));
        String filename = UUID.randomUUID() + ext;

        File dir = new File(uploadDir); // uploads/
        if (!dir.exists()) dir.mkdirs();

        File targetFile = new File(dir, filename);
        try (FileOutputStream fos = new FileOutputStream(targetFile)) {
            fos.write(file.getBytes());
        }

        return imageUrlPrefix + filename; // VD: /uploads/xxx.jpg
    }
}
