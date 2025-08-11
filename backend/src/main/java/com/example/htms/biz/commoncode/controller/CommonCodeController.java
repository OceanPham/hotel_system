package com.example.htms.biz.commoncode.controller;

import com.example.htms.enumation.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Controller
public class CommonCodeController {

    private static final Map<String, List<?>> enums = Map.of(
            "BookingStatusEnum", Arrays.asList(BookingStatusEnum.values()),
            "RoomEnum", Arrays.asList(RoomType.values()),
            "RoleEnum", Arrays.asList(RoleEnum.values()),
            "StatusEnum", Arrays.asList(StatusEnum.values())
    );

    @GetMapping("/api/common/{group}")
    @ResponseBody
    public Object getCommonCodesByGroup(@PathVariable String group) {
        List<?> codes = enums.get(group);
        if (codes != null) {
            return Map.of("group", group, "codes", codes);
        } else {
            return Map.of("error", "Group not found");
        }
    }

    @GetMapping("/common-codes")
    public String showCommonCodesPage(Model model) {
        model.addAttribute("groups", enums.keySet());
        return "bookingSuccess";
    }
}
