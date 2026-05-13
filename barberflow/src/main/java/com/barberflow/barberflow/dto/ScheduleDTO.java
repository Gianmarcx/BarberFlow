package com.barberflow.barberflow.dto;

import java.time.LocalTime;

public class ScheduleDTO {

    private Long id;
    private String dayOfWeek; // MONDAY, TUESDAY, ...
    private LocalTime openTime;
    private LocalTime closeTime;

    public ScheduleDTO() {}

    public ScheduleDTO(Long id, String dayOfWeek, LocalTime openTime, LocalTime closeTime) {
        this.id = id;
        this.dayOfWeek = dayOfWeek;
        this.openTime = openTime;
        this.closeTime = closeTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public LocalTime getOpenTime() {
        return openTime;
    }

    public void setOpenTime(LocalTime openTime) {
        this.openTime = openTime;
    }

    public LocalTime getCloseTime() {
        return closeTime;
    }

    public void setCloseTime(LocalTime closeTime) {
        this.closeTime = closeTime;
    }

    
}
