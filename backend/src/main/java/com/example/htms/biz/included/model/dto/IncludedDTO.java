package com.example.htms.biz.included.model.dto;

import com.example.htms.biz.hottelservice.model.HottelService;
import com.example.htms.biz.included.model.Included;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.BeanUtils;

public class IncludedDTO {

    @Getter @Setter
    public static class Req {
        private Integer id;
        private Integer bookingId;
        private Integer serviceId;
        private Integer quantity;
        private Integer priceOverride;

        public Included toIncluded() {
            Included in = new Included();
            BeanUtils.copyProperties(this, in);
            return in;
        }
    }

    @Getter @Setter
    public static class Resp {
        private Integer id;
        private Integer bookingId;
        private Integer serviceId;
        private String serviceName;
        private Integer unitPrice;
        private Integer priceOverride;
        private Integer quantity;
        private String fullName;

        public static Resp fromRecord(Included in, HottelService svc, String fullName) {
            Resp r = new Resp();
            r.id            = in.getId();
            r.bookingId     = in.getBookingId();
            r.serviceId     = svc.getId();
            r.serviceName   = svc.getName();
            r.unitPrice     = svc.getPrice();
            r.priceOverride = in.getPriceOverride();
            r.quantity      = in.getQuantity();
            r.fullName      = fullName;
            return r;
        }
    }
}
