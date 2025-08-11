package com.example.htms.biz.roomimage.model;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomImage {
    private Integer id;
    private Integer roomId;
    private String imageUrl;
    private Boolean isMain;
}
