package com.example.htms.biz.roomimage.model.dto;

import com.example.htms.biz.roomimage.model.RoomImage;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.BeanUtils;

public class RoomImageDTO {

    @Getter
    @Setter
    public static class Req {
        private Integer id;
        private Integer roomId;
        private String imageUrl;
        private Boolean isMain;

        public RoomImage toModel() {
            RoomImage image = new RoomImage();
            BeanUtils.copyProperties(this, image);
            return image;
        }
    }

    @Getter
    @Setter
    public static class Resp {
        private Integer id;
        private Integer roomId;
        private String imageUrl;
        private Boolean isMain;

        public static Resp from(RoomImage image) {
            Resp resp = new Resp();
            BeanUtils.copyProperties(image, resp);
            return resp;
        }
    }
}
