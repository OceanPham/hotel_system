package com.example.htms.biz.included.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Included {
    private Integer id;
    private Integer bookingId;
    private Integer serviceId; // chính là hotel_service_id trong DB
    private Integer quantity;
    private Integer priceOverride;
}
