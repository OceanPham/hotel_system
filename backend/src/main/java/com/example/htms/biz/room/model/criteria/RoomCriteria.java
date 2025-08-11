package com.example.htms.biz.room.model.criteria;


import com.example.htms.enumation.RoomStatus;
import com.example.htms.enumation.RoomType;
import com.example.htms.common.http.criteria.Page;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoomCriteria extends Page {
    private String roomName;
    private String roomNumber;
    private RoomType roomType;
    private RoomStatus status;

    public RoomCriteria() {}

    public RoomCriteria(String roomName, String roomNumber, RoomType roomType, RoomStatus status) {
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.status = status;
    }
}