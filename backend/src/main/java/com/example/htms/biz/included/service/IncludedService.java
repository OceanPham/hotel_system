package com.example.htms.biz.included.service;

import com.example.htms.biz.included.model.Included;
import com.example.htms.biz.included.model.criteria.IncludedCriteria;
import com.example.htms.biz.included.model.dto.IncludedDTO;
import com.example.htms.biz.included.repository.IncludedMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IncludedService {

    private final IncludedMapper includedMapper;

    public IncludedService(IncludedMapper includedMapper) {
        this.includedMapper = includedMapper;
    }

    public List<Included> listIncluded(IncludedCriteria criteria) {
        return includedMapper.listIncludeds(criteria);
    }

    public Included findById(Integer id) {
        return includedMapper.findById(id);
    }

    public void insert(IncludedDTO.Req req) {
        Included included = req.toIncluded();
        includedMapper.insertIncluded(included);

        if (included.getId() == null) {
            throw new RuntimeException("Failed to insert service.");
        }
    }

    public boolean updateIncluded(Included in){
        Included old = includedMapper.findById(in.getId());
        if (old == null) return false;

        if (in.getBookingId()     == null) in.setBookingId(old.getBookingId());
        if (in.getServiceId()     == null) in.setServiceId(old.getServiceId());
        if (in.getQuantity()      == null) in.setQuantity(old.getQuantity());
        if (in.getPriceOverride() == null) in.setPriceOverride(old.getPriceOverride());

        return includedMapper.updateIncluded(in) > 0;
    }


    public boolean deleteIncluded(Integer id) {
        Included included = includedMapper.findById(id);
        if (included == null) return false;
        return includedMapper.deleteIncluded(id) > 0;
    }

    public List<Included> findByBookingId(Integer bookingId) {
        IncludedCriteria criteria = new IncludedCriteria();
        criteria.setBookingId(bookingId);
        return includedMapper.listIncludeds(criteria);
    }
}