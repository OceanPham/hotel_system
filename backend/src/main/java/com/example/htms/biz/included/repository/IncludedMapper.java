package com.example.htms.biz.included.repository;

import com.example.htms.biz.included.model.Included;
import com.example.htms.biz.included.model.criteria.IncludedCriteria;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface IncludedMapper {

    @Select("""
        SELECT  s.id,
                s.booking_id,
                s.hotel_service_id AS service_id,
                s.quantity,
                s.price_override,

                hs.name            AS service_name,
                hs.price           AS unit_price
        FROM    Service s
        JOIN    HotelService hs ON s.hotel_service_id = hs.id
        WHERE   (#{c.bookingId} IS NULL OR s.booking_id       = #{c.bookingId})
          AND   (#{c.serviceId} IS NULL OR s.hotel_service_id = #{c.serviceId})
        ORDER BY s.id DESC
    """)
    @Results(id = "includedMap", value = {
            @Result(column = "id",             property = "id"),
            @Result(column = "booking_id",     property = "bookingId"),
            @Result(column = "service_id",     property = "serviceId"),
            @Result(column = "quantity",       property = "quantity"),
            @Result(column = "price_override", property = "priceOverride")
            // ❌ Không còn dòng mapping unit
    })
    List<Included> listIncludeds(@Param("c") IncludedCriteria criteria);

    @Insert("""
        INSERT INTO Service (booking_id, hotel_service_id, quantity, price_override)
        VALUES (#{in.bookingId}, #{in.serviceId}, #{in.quantity}, #{in.priceOverride})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertIncluded(@Param("in") Included in);

    @Update("""
        UPDATE Service
        SET booking_id       = #{in.bookingId},
            hotel_service_id = #{in.serviceId},
            quantity         = #{in.quantity},
            price_override   = #{in.priceOverride}
        WHERE id = #{in.id}
    """)
    int updateIncluded(@Param("in") Included in);

    @Delete("DELETE FROM Service WHERE id = #{id}")
    int deleteIncluded(Integer id);

    @Select("""
        SELECT  id,
                booking_id,
                hotel_service_id AS service_id,
                quantity,
                price_override
        FROM    Service
        WHERE   id = #{id}
    """)
    Included findById(Integer id);
}
