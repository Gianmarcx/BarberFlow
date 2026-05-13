package com.barberflow.barberflow.mapper;

import com.barberflow.barberflow.dto.ScheduleDTO;
import com.barberflow.barberflow.entity.Schedule;
import org.springframework.stereotype.Component;

@Component
public class ScheduleMapper {

    public ScheduleDTO toDTO(Schedule s) {
        return new ScheduleDTO(
                s.getId(),
                s.getDayOfWeek().name(),
                s.getOpenTime(),
                s.getCloseTime()
        );
    }

    public Schedule toEntity(ScheduleDTO dto) {
        Schedule s = new Schedule();
        s.setId(dto.getId());
        s.setDayOfWeek(java.time.DayOfWeek.valueOf(dto.getDayOfWeek()));
        s.setOpenTime(dto.getOpenTime());
        s.setCloseTime(dto.getCloseTime());
        return s;
    }
}
