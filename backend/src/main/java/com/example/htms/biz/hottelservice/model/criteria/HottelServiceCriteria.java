package com.example.htms.biz.hottelservice.model.criteria;

import com.example.htms.common.http.criteria.Page;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HottelServiceCriteria extends Page {
    private String name;
    public HottelServiceCriteria() {}
    public HottelServiceCriteria(String name) {
        this.name = name;
    }
}