package com.example.htms.biz.hottelservice.model.dto;

import com.example.htms.biz.hottelservice.model.HottelService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.BeanUtils;

public class HottelServiceDTO {

    @Getter
    @Setter
    public static class Req {
        private Integer id;
        private String name;
        private Integer price;
        private String description;
        private String imageUrl;

        public HottelService toModel() {
            HottelService model = new HottelService();
            BeanUtils.copyProperties(this, model);
            return model;
        }
    }

    @Getter
    @Setter
    public static class Resp {
        private Integer id;
        private String name;
        private Integer price;
        private String description;
        private String imageUrl;

        public static Resp from(HottelService model) {
            Resp dto = new Resp();
            BeanUtils.copyProperties(model, dto);
            return dto;
        }
    }
}
