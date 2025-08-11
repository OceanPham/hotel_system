package com.example.htms.biz.roomimage.service;

import com.example.htms.biz.roomimage.model.RoomImage;
import com.example.htms.biz.roomimage.repository.RoomImageMapper;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RoomImageService {

    private final RoomImageMapper mapper;

    public RoomImageService(RoomImageMapper mapper) {
        this.mapper = mapper;
    }

    public List<RoomImage> getImagesByRoomId(Integer roomId) {
        return mapper.findByRoomId(roomId);
    }

    public void addImage(RoomImage image) {
        if (Boolean.TRUE.equals(image.getIsMain())) {
            mapper.clearMainImage(image.getRoomId());
        }
        mapper.insert(image);
    }

    public void deleteImage(Integer id) {
        mapper.deleteById(id);
    }

    public void updateImage(RoomImage image) {
        if (Boolean.TRUE.equals(image.getIsMain())) {
            mapper.clearMainImage(image.getRoomId());
        }
        mapper.update(image);
    }
}
