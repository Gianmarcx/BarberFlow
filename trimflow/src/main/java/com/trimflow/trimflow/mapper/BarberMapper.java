package com.trimflow.trimflow.mapper;

import org.springframework.stereotype.Component;

import com.trimflow.trimflow.dto.BarberDTO;
import com.trimflow.trimflow.entity.Barber;

@Component
public class BarberMapper {

    public BarberDTO toDTO(Barber b) {
        BarberDTO dto = new BarberDTO();
        dto.setId(b.getId());
        dto.setName(b.getName());
        dto.setSpecialization(b.getSpecialization());
        return dto;
    }

    public Barber toEntity(BarberDTO dto) {
        Barber b = new Barber();
        b.setName(dto.getName());
        b.setSpecialization(dto.getSpecialization());
        return b;
    }
}