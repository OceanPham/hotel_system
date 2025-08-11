package com.example.htms.config;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.mapper.MapperScannerConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;

@Configuration
public class MyBatisConfig {

    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);
        return sessionFactory.getObject();
    }

    @Bean
    public MapperScannerConfigurer mapperScannerConfigurer() {
        MapperScannerConfigurer configurer = new MapperScannerConfigurer();
        configurer.setBasePackage(
                "com.example.htms.biz.booking.repository," +
                        "com.example.htms.biz.room.repository," +
                        "com.example.htms.biz.included.repository," +
                        "com.example.htms.biz.hottelservice.repository," +
                        "com.example.htms.biz.user.repository," +
                        "com.example.htms.biz.commoncode.notification.repository," +
                        "com.example.htms.biz.payment.repository," +
                        "com.example.htms.biz.feedback.repository," +
                        "com.example.htms.biz.roomimage.repository"// 🔥 thêm dòng này
        );
        return configurer;
    }

}