package com.barberflow.barberflow.service;

import com.barberflow.barberflow.entity.Booking;
import com.barberflow.barberflow.entity.User;
import com.barberflow.barberflow.exception.BookingConflictException;
import com.barberflow.barberflow.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ScheduleService scheduleService;

    public BookingService(BookingRepository bookingRepository,
                          ScheduleService scheduleService) {
        this.bookingRepository = bookingRepository;
        this.scheduleService = scheduleService;
    }

    public Booking save(Booking booking) {

        // 1) Controllo sovrapposizioni
        if (hasConflict(booking)) {
            throw new BookingConflictException("Booking conflict: overlapping appointment");
        }

        // 2) Controllo orari lavorativi
        if (!isWithinSchedule(booking)) {
            throw new BookingConflictException("Booking outside working hours");
        }

        return bookingRepository.save(booking);
    }

    public List<Booking> findByBarber(User barber) {
        return bookingRepository.findByBarber(barber);
    }

    public List<Booking> findByBarberAndDate(User barber, LocalDate date) {
        return bookingRepository.findByBarberAndDate(barber, date);
    }

    public boolean hasConflict(Booking booking) {
        List<Booking> conflicts = bookingRepository
                .findByBarberAndDateAndStartTimeLessThanAndEndTimeGreaterThan(
                        booking.getBarber(),
                        booking.getDate(),
                        booking.getEndTime(),
                        booking.getStartTime()
                );

        return !conflicts.isEmpty();
    }

    private boolean isWithinSchedule(Booking booking) {

        var scheduleOpt = scheduleService.findByBarberAndDay(
                booking.getBarber(),
                booking.getDate().getDayOfWeek()
        );

        if (scheduleOpt.isEmpty()) {
            return false; // nessun orario definito per quel giorno
        }

        var schedule = scheduleOpt.get();

        boolean startsAfterOpening =
                !booking.getStartTime().isBefore(schedule.getStartTime());

        boolean endsBeforeClosing =
                !booking.getEndTime().isAfter(schedule.getEndTime());

        return startsAfterOpening && endsBeforeClosing;
    }
}
