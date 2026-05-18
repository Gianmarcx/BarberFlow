package com.barberflow.barberflow.repository;

import com.barberflow.barberflow.entity.Barber;
import com.barberflow.barberflow.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByBarber(Barber barber);

    Optional<Schedule> findByBarberAndDayOfWeek(Barber barber, DayOfWeek dayOfWeek);
}