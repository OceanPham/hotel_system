package com.example.htms.biz.commoncode.notification.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import com.example.htms.biz.commoncode.notification.model.Notification;

@Controller
@RequestMapping("/notification")
public class NotificationController {
    @RequestMapping("")
    public String openMeetingView(Model model) {
        model.addAttribute("notification", new Notification());
        return "notification";
    }
}