package com.example.htms.biz.roomimage.repository;

import com.example.htms.biz.roomimage.model.RoomImage;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface RoomImageMapper {

    @Select("SELECT id, room_id, image_url, is_main FROM RoomImage WHERE room_id = #{roomId}")
    @Results(id = "roomImageMap", value = {
            @Result(column = "id", property = "id"),
            @Result(column = "room_id", property = "roomId"),
            @Result(column = "image_url", property = "imageUrl"),
            @Result(column = "is_main", property = "isMain")
    })
    List<RoomImage> findByRoomId(@Param("roomId") Integer roomId);

    @Insert("""
        INSERT INTO RoomImage (room_id, image_url, is_main)
        VALUES (#{roomId}, #{imageUrl}, #{isMain})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(RoomImage image);

    @Delete("DELETE FROM RoomImage WHERE id = #{id}")
    int deleteById(@Param("id") Integer id);

    @Update("""
        UPDATE RoomImage
        SET image_url = #{imageUrl}, is_main = #{isMain}
        WHERE id = #{id}
    """)
    int update(RoomImage image);

    @Update("UPDATE RoomImage SET is_main = FALSE WHERE room_id = #{roomId}")
    void clearMainImage(@Param("roomId") Integer roomId);
}
