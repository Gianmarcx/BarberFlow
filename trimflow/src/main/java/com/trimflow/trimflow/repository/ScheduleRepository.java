package com.trimflow.trimflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.trimflow.trimflow.entity.Barber;
import com.trimflow.trimflow.entity.Schedule;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByBarber(Barber barber);

    Optional<Schedule> findByBarberAndDayOfWeek(Barber barber, DayOfWeek dayOfWeek);
}