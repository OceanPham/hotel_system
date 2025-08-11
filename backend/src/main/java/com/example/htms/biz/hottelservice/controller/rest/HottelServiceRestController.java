package com.example.htms.biz.hottelservice.controller.rest;

import com.example.htms.biz.hottelservice.model.HottelService;
import com.example.htms.biz.hottelservice.model.criteria.HottelServiceCriteria;
import com.example.htms.biz.hottelservice.model.dto.HottelServiceDTO;
import com.example.htms.biz.hottelservice.service.HottelServiceService;
import com.example.htms.common.http.model.Result;
import com.example.htms.common.http.model.ResultData;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Tag(name = "Hotel Service API v1")
@RestController
@RequestMapping("/api/v1/hotel-services")
public class HottelServiceRestController {

    private final HottelServiceService service;

    public HottelServiceRestController(HottelServiceService service) {
        this.service = service;
    }

    /* ---------- LIST ---------- */
    @GetMapping("")
    @PreAuthorize("hasAnyRole('STAFF', 'ACCOUNTANT')")
    public ResultData<List<HottelServiceDTO.Resp>> list(HottelServiceCriteria criteria) {
        List<HottelServiceDTO.Resp> result = service.listServices(criteria)
                .stream()
                .map(HottelServiceDTO.Resp::from)
                .toList();
        return new ResultData<>("Success", result, result.size());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ACCOUNTANT')")
    public ResultData<HottelServiceDTO.Resp> getById(@PathVariable Integer id) {
        HottelService svc = service.findById(id);
        if (svc == null) {
            return new ResultData<>("Error", null);
        }
        return new ResultData<>("Success", HottelServiceDTO.Resp.from(svc));
    }

    /* ---------- CREATE ---------- */
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STAFF')")
    public Result create(
            @RequestPart("service") HottelServiceDTO.Req req,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        try {
            HottelService entity = req.toModel();

            if (image != null && !image.isEmpty()) {
                entity.setImageUrl(saveUploadedFile(image));
            }

            service.insert(entity);
            return new Result("Success", "Service created successfully.");
        } catch (IllegalArgumentException e) {
            return new Result("Error", e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return new Result("Error", "Insert failed.");
        }
    }


    /* ---------- UPDATE ---------- */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STAFF')")
    public Result update(
            @PathVariable Integer id,
            @RequestPart("service") HottelServiceDTO.Req req,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        try {
            HottelService entity = req.toModel();
            entity.setId(id);

            if (image != null && !image.isEmpty()) {
                entity.setImageUrl(saveUploadedFile(image));
            }

            boolean ok = service.update(entity);
            return ok
                    ? new Result("Success", "Service updated successfully.")
                    : new Result("Error", "Service not found or update failed.");
        } catch (Exception e) {
            e.printStackTrace();
            return new Result("Error", "Update failed.");
        }
    }


    /* ---------- DELETE ---------- */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public Result delete(@PathVariable Integer id) {
        boolean ok = service.delete(id);
        return ok
                ? new Result("Success", "Service deleted successfully.")
                : new Result("Error", "Service not found or delete failed.");
    }

    /* ---------- Helper ---------- */
    private String saveUploadedFile(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get("uploads");

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + fileName;
    }
}
