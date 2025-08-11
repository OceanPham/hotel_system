package com.example.htms.biz.hottelservice.repository;

import com.example.htms.biz.hottelservice.model.HottelService;
import com.example.htms.biz.hottelservice.model.criteria.HottelServiceCriteria;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface HottelServiceMapper {

    @Select("""
        SELECT 
            id, 
            name, 
            price, 
            description, 
            image_url AS imageUrl
        FROM HotelService
        WHERE
            (#{criteria.name} IS NULL OR name LIKE CONCAT('%', #{criteria.name}, '%'))
        ORDER BY id DESC
    """)
    List<HottelService> listServices(@Param("criteria") HottelServiceCriteria criteria);

    @Select("""
    SELECT 
        id, 
        name, 
        price, 
        description, 
        image_url AS imageUrl
    FROM HotelService 
    WHERE id = #{id}
""")
    HottelService findById(@Param("id") Integer id);

    @Insert("""
        INSERT INTO HotelService (name, price, description, image_url)
        VALUES (#{service.name}, #{service.price}, #{service.description}, #{service.imageUrl})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertService(@Param("service") HottelService service);

    @Update("""
        UPDATE HotelService
        SET 
            name = #{service.name},
            price = #{service.price},
            description = #{service.description},
            image_url = #{service.imageUrl}
        WHERE id = #{service.id}
    """)
    int updateService(@Param("service") HottelService service);

    @Delete("DELETE FROM HotelService WHERE id = #{id}")
    int deleteService(@Param("id") Integer id);

    @Select("SELECT COUNT(*) FROM HotelService WHERE name = #{name}")
    int countByName(@Param("name") String name);
}
