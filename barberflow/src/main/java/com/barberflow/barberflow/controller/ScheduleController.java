package com.barberflow.barberflow.controller;

import com.barberflow.barberflow.entity.Schedule;
import com.barberflow.barberflow.entity.User;
import com.barberflow.barberflow.service.ScheduleService;
import com.barberflow.barberflow.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {

    private final ScheduleService scheduleService;
    private final UserService userService;

    public ScheduleController(ScheduleService scheduleService, UserService userService) {
        this.scheduleService = scheduleService;
        this.userService = userService;
    }

    @PostMapping("/{userEmail}")
    public Schedule createSchedule(@PathVariable String userEmail,
                                   @RequestBody Schedule schedule) {

        User barber = userService.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        schedule.setBarber(barber);
        return scheduleService.save(schedule);
    }

    @GetMapping("/{userEmail}")
    public List<Schedule> getSchedule(@PathVariable String userEmail) {

        User barber = userService.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return scheduleService.findByBarber(barber);
    }

    @GetMapping("/{userEmail}/{day}")
    public Schedule getScheduleForDay(@PathVariable String userEmail,
                                      @PathVariable String day) {

        User barber = userService.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DayOfWeek dayOfWeek = DayOfWeek.valueOf(day.toUpperCase());

        return scheduleService.findByBarberAndDay(barber, dayOfWeek)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
    }
}
