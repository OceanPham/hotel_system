package com.example.htms.biz.room.repository;

import com.example.htms.biz.room.model.Room;
import com.example.htms.biz.room.model.criteria.RoomCriteria;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface RoomMapper {

    // ✅ KHAI BÁO RESULTMAP DÙNG CHUNG
    @Results(id = "roomWithImages", value = {
            @Result(column = "id", property = "id"),
            @Result(column = "room_name", property = "roomName"),
            @Result(column = "room_number", property = "roomNumber"),
            @Result(column = "room_type", property = "roomType"),
            @Result(column = "base_price", property = "basePrice"),
            @Result(column = "status", property = "status"),
            @Result(column = "description", property = "description"),
            @Result(property = "images", column = "id", javaType = List.class,
                    many = @Many(select = "com.example.htms.biz.roomimage.repository.RoomImageMapper.findByRoomId"))
    })
    @Select("""
        SELECT 
            r.id,
            r.room_name,
            r.room_number,
            r.room_type,
            r.base_price,
            r.status,
            r.description
        FROM Room r
        WHERE r.id = #{id}
    """)
    Room findById(@Param("id") Integer id);

    @Select("""
        SELECT 
            r.id,
            r.room_name,
            r.room_number,
            r.room_type,
            r.base_price,
            r.status,
            r.description
        FROM Room r
        WHERE
            (#{criteria.roomName} IS NULL OR r.room_name LIKE CONCAT('%', #{criteria.roomName}, '%'))
            AND (#{criteria.roomNumber} IS NULL OR r.room_number LIKE CONCAT('%', #{criteria.roomNumber}, '%'))
            AND (#{criteria.roomType} IS NULL OR r.room_type = #{criteria.roomType})
            AND (#{criteria.status} IS NULL OR r.status = #{criteria.status})
        ORDER BY r.room_number ASC
    """)
    @ResultMap("roomWithImages")
    List<Room> listRooms(@Param("criteria") RoomCriteria criteria);

    @Insert("""
    INSERT INTO Room (room_name, room_number, room_type, base_price, status, description)
    VALUES (#{room.roomName}, #{room.roomNumber}, #{room.roomType}, #{room.basePrice}, #{room.status}, #{room.description})
""")
    @Options(useGeneratedKeys = true, keyProperty = "room.id")
    int insertRoom(@Param("room") Room room);


    @Select("SELECT COUNT(*) FROM Room WHERE room_number = #{roomNumber}")
    int countByRoomNumber(String roomNumber);

    @Update("""
        UPDATE Room
        SET 
            room_name = #{room.roomName},
            room_number = #{room.roomNumber},
            room_type = #{room.roomType},
            base_price = #{room.basePrice},
            status = #{room.status},
            description = #{room.description}
        WHERE id = #{room.id}
    """)
    int updateRoom(@Param("room") Room room);

    @Update("UPDATE Room SET status = 'Inactive' WHERE id = #{id}")
    int markRoomAsInactive(@Param("id") Integer id);

    @Delete("DELETE FROM Room WHERE id = #{id}")
    int deleteRoomById(@Param("id") Integer id);
}
