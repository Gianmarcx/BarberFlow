package com.trimflow.trimflow.mapper;

import org.springframework.stereotype.Component;

import com.trimflow.trimflow.dto.ServiceDTO;
import com.trimflow.trimflow.entity.ServiceEntity;

@Component
public class ServiceMapper {

    public ServiceDTO toDTO(ServiceEntity s) {
        return new ServiceDTO(
                s.getId(),
                s.getName(),
                s.getDescription(),   
                s.getDuration(),
                s.getPrice()
        );
    }

    public ServiceEntity toEntity(ServiceDTO dto) {
        ServiceEntity entity = new ServiceEntity();
        entity.setId(dto.getId());
        entity.setName(dto.getName());              
        entity.setDescription(dto.getDescription());
        entity.setDuration(dto.getDuration());
        entity.setPrice(dto.getPrice());
        
        return entity;
    }
}