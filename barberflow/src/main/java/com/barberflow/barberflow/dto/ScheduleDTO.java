package com.barberflow.barberflow.dto;

import lombok.Data;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
public class ScheduleDTO {
    private Long id;
    private Long barberId;          // ✅ aggiunto
    private DayOfWeek dayOfWeek;
    private LocalTime openTime;
    private LocalTime closeTime;
}