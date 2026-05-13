package com.barberflow.barberflow.repository;

import com.barberflow.barberflow.entity.Booking;
import com.barberflow.barberflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByBarber(User barber);

    
    @Query("SELECT b FROM Booking b WHERE b.barber = :barber " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findOverlapping(@Param("barber") User barber,
                                  @Param("startTime") LocalDateTime startTime,
                                  @Param("endTime") LocalDateTime endTime);

    
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.barber = :barber " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    boolean existsOverlappingBooking(@Param("barber") User barber,
                                     @Param("startTime") LocalDateTime startTime,
                                     @Param("endTime") LocalDateTime endTime);

    
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.barber = :barber " +
           "AND b.startTime < :endTime AND b.endTime > :startTime " +
           "AND b.id != :excludeId")
    boolean existsOverlappingBookingExcluding(@Param("barber") User barber,
                                              @Param("startTime") LocalDateTime startTime,
                                              @Param("endTime") LocalDateTime endTime,
                                              @Param("excludeId") Long excludeId);

    @Query("SELECT b FROM Booking b WHERE b.barber = :barber AND DATE(b.startTime) = :date")
    List<Booking> findByBarberAndDate(@Param("barber") User barber,
                                      @Param("date") LocalDate date);
}