package com.barberflow.barberflow.controller;

import com.barberflow.barberflow.dto.ScheduleDTO;
import com.barberflow.barberflow.service.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @PostMapping
    public ResponseEntity<ScheduleDTO> create(@RequestBody ScheduleDTO dto, Authentication auth) {
        return ResponseEntity.ok(scheduleService.saveSchedule(dto, auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<ScheduleDTO>> getAll(Authentication auth) {
        return ResponseEntity.ok(scheduleService.getSchedules(auth.getName()));
    }
}
