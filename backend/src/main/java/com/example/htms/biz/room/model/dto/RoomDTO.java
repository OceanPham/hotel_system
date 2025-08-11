package com.example.htms.biz.room.model.dto;

import com.example.htms.biz.room.model.Room;
import com.example.htms.biz.roomimage.model.RoomImage;
import com.example.htms.biz.roomimage.model.dto.RoomImageDTO;
import com.example.htms.enumation.RoomStatus;
import com.example.htms.enumation.RoomType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.BeanUtils;

import java.util.List;

public class RoomDTO {

    @Getter
    @Setter
    public static class Req {
        private Integer id;
        private String roomName;
        private String roomNumber;
        private RoomType roomType;
        private Integer basePrice;
        private RoomStatus status;
        private String description;

        private List<RoomImageDTO.Req> images;

        public Room toRoom() {
            Room room = new Room();
            BeanUtils.copyProperties(this, room);
            if (images != null) {
                room.setImages(images.stream().map(RoomImageDTO.Req::toModel).toList());
            }
            return room;
        }
    }

    @Getter
    @Setter
    public static class Resp {
        private Integer id;
        private String roomName;
        private String roomNumber;
        private RoomType roomType;
        private Integer basePrice;
        private RoomStatus status;
        private String description;

        private List<RoomImageDTO.Resp> images;

        // 👇 Thêm thuộc tính ảnh chính
        private RoomImageDTO.Resp mainImage;

        public static Resp toResponse(Room room) {
            Resp resp = new Resp();
            BeanUtils.copyProperties(room, resp);

            if (room.getImages() != null) {
                List<RoomImageDTO.Resp> imageDTOs = room.getImages().stream()
                        .map(RoomImageDTO.Resp::from)
                        .toList();
                resp.setImages(imageDTOs);

                // 👇 Tìm và set ảnh chính
                room.getImages().stream()
                        .filter(img -> Boolean.TRUE.equals(img.getIsMain()))
                        .findFirst()
                        .map(RoomImageDTO.Resp::from)
                        .ifPresent(resp::setMainImage);
            }

            return resp;
        }
    }
}
