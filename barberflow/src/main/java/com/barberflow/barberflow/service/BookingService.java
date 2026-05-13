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

        ServiceEntity service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new IllegalStateException("Servizio non trovato"));

        LocalDateTime start = dto.getStartTime();
        LocalDateTime end = start.plusMinutes(service.getDuration());

        validateSchedule(owner, start, end);

        // ✅ usa il metodo senza excludeId per la creazione
        if (bookingRepository.existsOverlappingBooking(owner, start, end)) {
            throw new IllegalStateException("Esiste già una prenotazione in questo orario");
        }

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setBarber(owner);
        booking.setService(service);
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setStatus("PENDING");
        booking.setPriceSnapshot(service.getPrice());   // ✅ storicizza il prezzo
        booking.setNotes(dto.getNotes());

        return bookingMapper.toDTO(bookingRepository.save(booking));
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

        ServiceEntity service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new IllegalStateException("Servizio non trovato"));

        LocalDateTime start = dto.getStartTime();
        LocalDateTime end = start.plusMinutes(service.getDuration());

        validateSchedule(owner, start, end);

        // ✅ usa il metodo con excludeId per l'aggiornamento
        if (bookingRepository.existsOverlappingBookingExcluding(owner, start, end, id)) {
            throw new IllegalStateException("Esiste già una prenotazione in questo orario");
        }

        booking.setService(service);
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setPriceSnapshot(service.getPrice());   // ✅ aggiorna il prezzo snapshot
        booking.setNotes(dto.getNotes());

        if (dto.getStatus() != null) {
            booking.setStatus(dto.getStatus());         // ✅ aggiorna lo status se fornito
        }

        return bookingMapper.toDTO(bookingRepository.save(booking));
    }

    // ---------------------------------------------------------
    // DELETE BOOKING
    // ---------------------------------------------------------
    public void deleteBooking(Long id, String ownerEmail) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Prenotazione non trovata"));

        if (!booking.getBarber().getEmail().equals(ownerEmail)) {
            throw new IllegalStateException("Non autorizzato");
        }

        bookingRepository.delete(booking);  // ✅ rimossa query inutile su userRepository
    }

    // ---------------------------------------------------------
    // AVAILABLE SLOTS
    // ---------------------------------------------------------
    public List<LocalTime> getAvailableSlots(LocalDate date, Long serviceId, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalStateException("Servizio non trovato"));

        int duration = service.getDuration();
        DayOfWeek day = date.getDayOfWeek();

        Schedule schedule = scheduleRepository
                .findByBarberAndDayOfWeek(owner, day)
                .orElseThrow(() -> new IllegalStateException("Nessun orario definito per questo giorno"));

        LocalTime open = schedule.getOpenTime();
        LocalTime close = schedule.getCloseTime();

        // ✅ esclude prenotazioni cancellate dagli slot occupati
        List<Booking> bookings = bookingRepository.findByBarberAndDate(owner, date)
                .stream()
                .filter(b -> !b.getStatus().equals("CANCELLED"))
                .collect(Collectors.toList());

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

    // ---------------------------------------------------------
    // METODO PRIVATO — validazione orari riutilizzabile
    // ---------------------------------------------------------
    private void validateSchedule(User owner, LocalDateTime start, LocalDateTime end) {

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
    }
}