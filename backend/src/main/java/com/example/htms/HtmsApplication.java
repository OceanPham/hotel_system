package com.example.htms;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan({
        "com.example.htms.biz.user.repository",
        "com.example.htms.biz.commoncode.notification.repository",
        "com.example.htms.biz.payment.repository"
})
public class HtmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(HtmsApplication.class, args);
    }

}
