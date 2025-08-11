// Room.java
package com.example.htms.biz.room.model;

import com.example.htms.biz.roomimage.model.RoomImage;
import com.example.htms.enumation.RoomStatus;
import com.example.htms.enumation.RoomType;
import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Room {
    private Integer id;
    private String roomName;
    private String roomNumber;
    private RoomType roomType;
    private Integer basePrice;
    private RoomStatus status;
    private String description;

    // 👇 Thêm danh sách ảnh
    private List<RoomImage> images;

    // 👇 Thêm shortcut ảnh chính
    public RoomImage getMainImage() {
        if (images == null) return null;
        return images.stream()
                .filter(RoomImage::getIsMain)
                .findFirst()
                .orElse(null);
    }
}
