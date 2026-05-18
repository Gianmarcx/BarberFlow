package com.barberflow.barberflow.mapper;

import com.barberflow.barberflow.dto.BarberDTO;
import com.barberflow.barberflow.entity.Barber;
import org.springframework.stereotype.Component;

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