package com.barberflow.barberflow.repository;

import com.barberflow.barberflow.entity.Schedule;
import com.barberflow.barberflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByBarber(User barber);

    Schedule findByBarberAndDayOfWeek(User barber, DayOfWeek dayOfWeek);
}
