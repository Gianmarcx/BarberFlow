package com.barberflow.barberflow.service;

import com.barberflow.barberflow.dto.BookingDTO;
import com.barberflow.barberflow.entity.Booking;
import com.barberflow.barberflow.entity.Customer;
import com.barberflow.barberflow.entity.Schedule;
import com.barberflow.barberflow.entity.ServiceEntity;
import com.barberflow.barberflow.entity.User;
import com.barberflow.barberflow.mapper.BookingMapper;
import com.barberflow.barberflow.repository.BookingRepository;
import com.barberflow.barberflow.repository.CustomerRepository;
import com.barberflow.barberflow.repository.ScheduleRepository;
import com.barberflow.barberflow.repository.ServiceRepository;
import com.barberflow.barberflow.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final ServiceRepository serviceRepository;

    public BookingService(BookingRepository bookingRepository,
                          BookingMapper bookingMapper,
                          CustomerRepository customerRepository,
                          UserRepository userRepository,
                          ScheduleRepository scheduleRepository,
                          ServiceRepository serviceRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingMapper = bookingMapper;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.scheduleRepository = scheduleRepository;
        this.serviceRepository = serviceRepository;
    }

    // ---------------------------------------------------------
    // CREATE BOOKING
    // ---------------------------------------------------------
    public BookingDTO createBooking(BookingDTO dto, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new IllegalStateException("Cliente non trovato"));

        if (!customer.getOwner().getEmail().equals(ownerEmail)) {
            throw new IllegalStateException("Non autorizzato");
        }

        // Recupero servizio
        ServiceEntity service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new IllegalStateException("Servizio non trovato"));

        // Calcolo automatico dell'endTime
        LocalDateTime start = dto.getStartTime();
        LocalDateTime end = start.plusMinutes(service.getDuration());

        // Validazione orari
        DayOfWeek day = start.getDayOfWeek();

        Schedule schedule = scheduleRepository
                .findByBarberAndDayOfWeek(owner, day)
                .orElseThrow(() -> new IllegalStateException("Nessun orario definito per questo giorno"));

        LocalTime bookingStart = start.toLocalTime();
        LocalTime bookingEnd = end.toLocalTime();

        if (bookingStart.isBefore(schedule.getOpenTime()) ||
            bookingEnd.isAfter(schedule.getCloseTime())) {
            throw new IllegalStateException("Prenotazione fuori orario lavorativo");
        }

        // Controllo sovrapposizioni
        boolean overlaps = bookingRepository.existsOverlappingBooking(
                owner,
                start,
                end,
                null
        );

        if (overlaps) {
            throw new IllegalStateException("Esiste già una prenotazione in questo orario");
        }

        // Creazione booking
        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setBarber(owner);
        booking.setService(service); // 🔥 CORRETTO
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setNotes(dto.getNotes());

        Booking saved = bookingRepository.save(booking);
        return bookingMapper.toDTO(saved);
    }

    // ---------------------------------------------------------
    // GET ALL BOOKINGS
    // ---------------------------------------------------------
    public List<BookingDTO> getBookings(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        return bookingRepository.findByBarber(owner)
                .stream()
                .map(bookingMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------
    // UPDATE BOOKING
    // ---------------------------------------------------------
    public BookingDTO updateBooking(Long id, BookingDTO dto, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Prenotazione non trovata"));

        if (!booking.getBarber().getEmail().equals(ownerEmail)) {
            throw new IllegalStateException("Non autorizzato");
        }

        // Recupero servizio
        ServiceEntity service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new IllegalStateException("Servizio non trovato"));

        // Calcolo automatico endTime
        LocalDateTime start = dto.getStartTime();
        LocalDateTime end = start.plusMinutes(service.getDuration());

        // Validazione orari
        DayOfWeek day = start.getDayOfWeek();

        Schedule schedule = scheduleRepository
                .findByBarberAndDayOfWeek(owner, day)
                .orElseThrow(() -> new IllegalStateException("Nessun orario definito per questo giorno"));

        LocalTime bookingStart = start.toLocalTime();
        LocalTime bookingEnd = end.toLocalTime();

        if (bookingStart.isBefore(schedule.getOpenTime()) ||
            bookingEnd.isAfter(schedule.getCloseTime())) {
            throw new IllegalStateException("Prenotazione fuori orario lavorativo");
        }

        // Controllo sovrapposizioni (escludendo se stesso)
        boolean overlaps = bookingRepository.existsOverlappingBooking(
                owner,
                start,
                end,
                id
        );

        if (overlaps) {
            throw new IllegalStateException("Esiste già una prenotazione in questo orario");
        }

        // Aggiornamento booking
        booking.setService(service); // 🔥 CORRETTO
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setNotes(dto.getNotes());

        Booking saved = bookingRepository.save(booking);
        return bookingMapper.toDTO(saved);
    }

    // ---------------------------------------------------------
    // DELETE BOOKING
    // ---------------------------------------------------------
    public void deleteBooking(Long id, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Prenotazione non trovata"));

        if (!booking.getBarber().getEmail().equals(owner.getEmail())) {
            throw new IllegalStateException("Non autorizzato");
        }

        bookingRepository.delete(booking);
    }

    // ---------------------------------------------------------
    // AVAILABLE SLOTS (basati sul servizio)
    // ---------------------------------------------------------
    public List<LocalTime> getAvailableSlots(LocalDate date, Long serviceId, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        // Recupero servizio
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalStateException("Servizio non trovato"));

        int duration = service.getDuration();

        DayOfWeek day = date.getDayOfWeek();

        Schedule schedule = scheduleRepository
                .findByBarberAndDayOfWeek(owner, day)
                .orElseThrow(() -> new IllegalStateException("Nessun orario definito per questo giorno"));

        LocalTime open = schedule.getOpenTime();
        LocalTime close = schedule.getCloseTime();

        List<Booking> bookings = bookingRepository.findByBarberAndDate(owner, date);

        List<LocalTime> slots = new ArrayList<>();

        LocalTime current = open;

        while (!current.plusMinutes(duration).isAfter(close)) {

            LocalTime slotStart = current;
            LocalTime slotEnd = current.plusMinutes(duration);

            boolean overlaps = bookings.stream().anyMatch(b ->
                    slotStart.isBefore(b.getEndTime().toLocalTime()) &&
                    slotEnd.isAfter(b.getStartTime().toLocalTime())
            );

            if (!overlaps) {
                slots.add(slotStart);
            }

            current = current.plusMinutes(duration);
        }

        return slots;
    }
}
