package com.trimflow.trimflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.trimflow.trimflow.entity.Barber;
import com.trimflow.trimflow.entity.Booking;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByBarber(Barber barber);

    @Query("SELECT b FROM Booking b WHERE b.barber = :barber " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findOverlapping(@Param("barber") Barber barber,
                                  @Param("startTime") LocalDateTime startTime,
                                  @Param("endTime") LocalDateTime endTime);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.barber = :barber " +
           "AND b.startTime < :endTime AND b.endTime > :startTime " +
           "AND b.status != 'CANCELLED'")
    boolean existsOverlappingBooking(@Param("barber") Barber barber,
                                     @Param("startTime") LocalDateTime startTime,
                                     @Param("endTime") LocalDateTime endTime);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.barber = :barber " +
           "AND b.startTime < :endTime AND b.endTime > :startTime " +
           "AND b.id != :excludeId " +
           "AND b.status != 'CANCELLED'")
    boolean existsOverlappingBookingExcluding(@Param("barber") Barber barber,
                                              @Param("startTime") LocalDateTime startTime,
                                              @Param("endTime") LocalDateTime endTime,
                                              @Param("excludeId") Long excludeId);

    @Query("SELECT b FROM Booking b WHERE b.barber = :barber AND DATE(b.startTime) = :date")
    List<Booking> findByBarberAndDate(@Param("barber") Barber barber,
                                      @Param("date") LocalDate date);
}