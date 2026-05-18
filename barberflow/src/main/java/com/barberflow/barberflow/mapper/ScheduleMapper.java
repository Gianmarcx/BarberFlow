package com.barberflow.barberflow.mapper;

import com.barberflow.barberflow.dto.ScheduleDTO;
import com.barberflow.barberflow.entity.Schedule;
import org.springframework.stereotype.Component;

@Component
public class ScheduleMapper {

    public ScheduleDTO toDTO(Schedule s) {
        ScheduleDTO dto = new ScheduleDTO();
        dto.setId(s.getId());
        dto.setBarberId(s.getBarber().getId());  // ✅ aggiunto
        dto.setDayOfWeek(s.getDayOfWeek());
        dto.setOpenTime(s.getOpenTime());
        dto.setCloseTime(s.getCloseTime());
        return dto;
    }

    public Schedule toEntity(ScheduleDTO dto) {
        Schedule s = new Schedule();
        s.setId(dto.getId());
        s.setDayOfWeek(dto.getDayOfWeek());
        s.setOpenTime(dto.getOpenTime());
        s.setCloseTime(dto.getCloseTime());
        return s;
    }
}