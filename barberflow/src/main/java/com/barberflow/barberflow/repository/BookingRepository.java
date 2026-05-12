package com.barberflow.barberflow.repository;

import com.barberflow.barberflow.entity.Booking;
import com.barberflow.barberflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByBarber(User barber);

    List<Booking> findByBarberAndDate(User barber, LocalDate date);

    List<Booking> findByBarberAndDateAndStartTimeLessThanAndEndTimeGreaterThan(
        User barber,
        LocalDate date,
        LocalTime endTime,
        LocalTime startTime
);

}
