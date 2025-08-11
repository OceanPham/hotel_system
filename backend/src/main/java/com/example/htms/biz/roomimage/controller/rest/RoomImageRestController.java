package com.example.htms.biz.roomimage.controller.rest;

import com.example.htms.biz.roomimage.model.dto.RoomImageDTO;
import com.example.htms.biz.roomimage.service.RoomImageService;
import com.example.htms.common.http.model.Result;
import com.example.htms.common.http.model.ResultData;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Tag(name = "Room Image API")
@RestController
@RequestMapping("/api/v1/room-images")
public class RoomImageRestController {

    private final RoomImageService service;

    @Value("${upload.folder:uploads}")
    private String uploadFolder;

    public RoomImageRestController(RoomImageService service) {
        this.service = service;
    }

    // ✅ Lấy danh sách ảnh theo roomId
    @GetMapping("/room/{roomId}")
    public ResultData<List<RoomImageDTO.Resp>> getImagesByRoom(@PathVariable Integer roomId) {
        List<RoomImageDTO.Resp> images = service.getImagesByRoomId(roomId)
                .stream()
                .map(RoomImageDTO.Resp::from)
                .collect(Collectors.toList());
        return new ResultData<>("Success", images, images.size());
    }

    // ✅ Thêm ảnh từ URL
    @PostMapping("")
    public Result addImage(@RequestBody RoomImageDTO.Req req) {
        service.addImage(req.toModel());
        return new Result("Success", "Image added.");
    }

    // ✅ Cập nhật ảnh
    @PutMapping("/{id}")
    public Result updateImage(@PathVariable Integer id, @RequestBody RoomImageDTO.Req req) {
        req.setId(id);
        service.updateImage(req.toModel());
        return new Result("Success", "Image updated.");
    }

    // ✅ Xoá ảnh
    @DeleteMapping("/{id}")
    public Result deleteImage(@PathVariable Integer id) {
        service.deleteImage(id);
        return new Result("Success", "Image deleted.");
    }

    // ✅ Upload ảnh từ máy tính (Multipart)
    @PostMapping("/upload")
    public ResultData<String> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return new ResultData<>("Error: No file uploaded.", null);
        }

        // ⚠️ Kiểm tra loại file là ảnh (tuỳ chọn)
        if (!file.getContentType().startsWith("image/")) {
            return new ResultData<>("Error: Only image files are allowed.", null);
        }

        try {
            // Đảm bảo thư mục tồn tại
            Path uploadPath = Paths.get(uploadFolder);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Đặt tên file an toàn
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = getFileExtension(originalFilename);
            String filename = UUID.randomUUID().toString() + (extension != null ? "." + extension : "");

            // Lưu file vào thư mục
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Trả về URL ảnh truy cập qua HTTP
            String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(filename)
                    .toUriString();

            return new ResultData<>("Success", fileUrl);
        } catch (IOException e) {
            return new ResultData<>("Error: Failed to save image.", null);
        }
    }

    // 🔧 Hàm phụ lấy đuôi file
    private String getFileExtension(String filename) {
        if (filename == null) return null;
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex >= 0) ? filename.substring(dotIndex + 1) : null;
    }
}
