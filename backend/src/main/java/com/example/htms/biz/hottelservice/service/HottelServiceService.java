package com.example.htms.biz.hottelservice.service;

import com.example.htms.biz.hottelservice.model.HottelService;              // ✅ entity
import com.example.htms.biz.hottelservice.model.criteria.HottelServiceCriteria;
import com.example.htms.biz.hottelservice.repository.HottelServiceMapper;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class HottelServiceService {

    private final HottelServiceMapper serviceMapper;

    public HottelServiceService(HottelServiceMapper serviceMapper) {
        this.serviceMapper = serviceMapper;
    }

    public List<HottelService> listServices(HottelServiceCriteria criteria) {
        return serviceMapper.listServices(criteria);
    }

    public HottelService findById(Integer id) {
        return serviceMapper.findById(id);
    }

    public void insert(HottelService service) {
        if (service == null || service.getName() == null) {
            throw new IllegalArgumentException("Service name is required.");
        }
        if (serviceMapper.countByName(service.getName()) > 0) {
            throw new IllegalArgumentException("Service with the same name already exists.");
        }

        int affected = serviceMapper.insertService(service);
        if (affected == 0 || service.getId() == null) {
            throw new RuntimeException("Insert failed.");
        }
    }

    public boolean update(HottelService updated) {
        HottelService existing = serviceMapper.findById(updated.getId());
        if (existing == null) return false;

        if (updated.getName()        == null) updated.setName(existing.getName());
        if (updated.getPrice()       == null) updated.setPrice(existing.getPrice());
        if (updated.getDescription() == null) updated.setDescription(existing.getDescription());
        if (updated.getImageUrl()    == null) updated.setImageUrl(existing.getImageUrl());

        return serviceMapper.updateService(updated) > 0;
    }

    public boolean delete(Integer id) {
        return serviceMapper.deleteService(id) > 0;
    }
}
