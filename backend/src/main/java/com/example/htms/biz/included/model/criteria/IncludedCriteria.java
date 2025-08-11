package com.example.htms.biz.included.model.criteria;

import com.example.htms.common.http.criteria.Page;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IncludedCriteria extends Page {
    private Integer bookingId;
    private String name;
    private Integer serviceId; // ✅ THÊM DÒNG NÀY

    public IncludedCriteria() {
    }

    public IncludedCriteria(Integer bookingId, String name, Integer serviceId) {
        this.bookingId = bookingId;
        this.name = name;

        this.serviceId = serviceId;
    }
}
