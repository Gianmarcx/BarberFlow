package com.barberflow.barberflow.service;

import com.barberflow.barberflow.entity.Schedule;
import com.barberflow.barberflow.entity.User;
import com.barberflow.barberflow.repository.ScheduleRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    public ScheduleService(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    public Schedule save(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }

    public List<Schedule> findByBarber(User barber) {
        return scheduleRepository.findByBarber(barber);
    }

    public Optional<Schedule> findByBarberAndDay(User barber, DayOfWeek day) {
        return Optional.ofNullable(scheduleRepository.findByBarberAndDayOfWeek(barber, day));
    }
}
