package com.example.htms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class Webconfig {

    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {

            // ✅ CORS cho Angular
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:4200")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }

            // ✅ Truy cập ảnh từ thư mục "uploads/"
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                Path uploadDir = Paths.get("uploads");
                String uploadPath = uploadDir.toFile().getAbsolutePath();

                registry.addResourceHandler("/uploads/**")
                        .addResourceLocations("file:" + uploadPath + "/");
            }
        };
    }
}
