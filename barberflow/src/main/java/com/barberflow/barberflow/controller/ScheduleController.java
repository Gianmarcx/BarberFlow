package com.barberflow.barberflow.controller;

import com.barberflow.barberflow.dto.ScheduleDTO;
import com.barberflow.barberflow.service.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @PostMapping
    public ResponseEntity<ScheduleDTO> create(
            @RequestBody ScheduleDTO dto,
            Authentication auth) {
        return ResponseEntity.ok(scheduleService.saveSchedule(dto, auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<ScheduleDTO>> getAll(
            @RequestParam Long barberId,       // ✅ aggiunto
            Authentication auth) {
        return ResponseEntity.ok(scheduleService.getSchedules(barberId, auth.getName()));
    }

    @DeleteMapping("/{barberId}/{dayOfWeek}")  // ✅ aggiunto barberId nel path
    public ResponseEntity<Void> delete(
            @PathVariable Long barberId,
            @PathVariable DayOfWeek dayOfWeek,
            Authentication auth) {
        scheduleService.deleteSchedule(barberId, dayOfWeek, auth.getName());
        return ResponseEntity.noContent().build();
    }
}