package com.barberflow.barberflow.mapper;

import com.barberflow.barberflow.dto.ServiceDTO;
import com.barberflow.barberflow.entity.ServiceEntity;
import org.springframework.stereotype.Component;

@Component
public class ServiceMapper {

    public ServiceDTO toDTO(ServiceEntity s) {
        return new ServiceDTO(
                s.getId(),
                s.getName(),
                s.getDuration(),
                s.getPrice()
        );
    }

    public ServiceEntity toEntity(ServiceDTO dto) {
        return ServiceEntity.builder()
                .id(dto.getId())
                .name(dto.getName())
                .duration(dto.getDuration())
                .price(dto.getPrice())
                .build();
    }
}
