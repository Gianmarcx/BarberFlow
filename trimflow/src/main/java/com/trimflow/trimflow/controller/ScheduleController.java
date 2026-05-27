package com.trimflow.trimflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.trimflow.trimflow.dto.ScheduleDTO;
import com.trimflow.trimflow.service.ScheduleService;

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
    public ResponseEntity<List<ScheduleDTO>> getAll(Authentication auth) {  // ✅ Rimosso barberId obbligatorio
        return ResponseEntity.ok(scheduleService.getSchedulesByShop(auth.getName()));  // ✅ Nuovo metodo
    }

    @DeleteMapping("/{barberId}/{dayOfWeek}")
    public ResponseEntity<Void> delete(
            @PathVariable Long barberId,
            @PathVariable DayOfWeek dayOfWeek,
            Authentication auth) {
        scheduleService.deleteSchedule(barberId, dayOfWeek, auth.getName());
        return ResponseEntity.noContent().build();
    }
}