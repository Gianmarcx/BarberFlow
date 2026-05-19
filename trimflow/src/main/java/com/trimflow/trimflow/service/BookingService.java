package com.trimflow.trimflow.service;

import org.springframework.stereotype.Service;

import com.trimflow.trimflow.dto.BookingDTO;
import com.trimflow.trimflow.entity.Barber;
import com.trimflow.trimflow.entity.Booking;
import com.trimflow.trimflow.entity.Customer;
import com.trimflow.trimflow.entity.Schedule;
import com.trimflow.trimflow.entity.ServiceEntity;
import com.trimflow.trimflow.entity.User;
import com.trimflow.trimflow.mapper.BookingMapper;
import com.trimflow.trimflow.repository.BarberRepository;
import com.trimflow.trimflow.repository.BookingRepository;
import com.trimflow.trimflow.repository.CustomerRepository;
import com.trimflow.trimflow.repository.ScheduleRepository;
import com.trimflow.trimflow.repository.ServiceRepository;
import com.trimflow.trimflow.repository.UserRepository;

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
    private final BarberRepository barberRepository;
    private final ScheduleRepository scheduleRepository;
    private final ServiceRepository serviceRepository;

    public BookingService(BookingRepository bookingRepository,
                          BookingMapper bookingMapper,
                          CustomerRepository customerRepository,
                          UserRepository userRepository,
                          BarberRepository barberRepository,
                          ScheduleRepository scheduleRepository,
                          ServiceRepository serviceRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingMapper = bookingMapper;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.barberRepository = barberRepository;
        this.scheduleRepository = scheduleRepository;
        this.serviceRepository = serviceRepository;
    }

    public BookingDTO createBooking(BookingDTO dto, String shopEmail) {

        User shop = userRepository.findByEmail(shopEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        // ✅ recupera il barbiere dal DTO
        Barber barber = barberRepository.findById(dto.getBarberId())
                .orElseThrow(() -> new IllegalStateException("Barbiere non trovato"));

        // ✅ verifica che il barbiere appartenga al negozio loggato
        if (!barber.getShop().getEmail().equals(shopEmail)) {
            throw new IllegalStateException("Non autorizzato");
        }

        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new IllegalStateException("Cliente non trovato"));

        if (!customer.getOwner().getEmail().equals(shopEmail)) {
            throw new IllegalStateException("Non autorizzato");
        }

        ServiceEntity service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new IllegalStateException("Servizio non trovato"));

        LocalDateTime start = dto.getStartTime();
        LocalDateTime end = start.plusMinutes(service.getDuration());

        validateSchedule(barber, start, end);

        // ✅ controllo sovrapposizioni per quel barbiere specifico
        if (bookingRepository.existsOverlappingBooking(barber, start, end)) {
            throw new IllegalStateException(
                "Il barbiere " + barber.getName() + " ha già una prenotazione in questo orario"
            );
        }

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setBarber(barber);          // ✅ era owner (User), ora barber (Barber)
        booking.setService(service);
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setStatus("PENDING");
        booking.setPriceSnapshot(service.getPrice());
        booking.setNotes(dto.getNotes());

        return bookingMapper.toDTO(bookingRepository.save(booking));
    }

    public List<BookingDTO> getBookings(String shopEmail) {

        User shop = userRepository.findByEmail(shopEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        // ✅ recupera tutti i barbieri del negozio e le loro prenotazioni
        List<Barber> barbers = barberRepository.findByShop(shop);

        return barbers.stream()
                .flatMap(barber -> bookingRepository.findByBarber(barber).stream())
                .map(bookingMapper::toDTO)
                .sorted((a, b) -> b.getStartTime().compareTo(a.getStartTime()))
                .collect(Collectors.toList());
    }

    public BookingDTO updateBooking(Long id, BookingDTO dto, String shopEmail) {

        User shop = userRepository.findByEmail(shopEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Prenotazione non trovata"));

        // ✅ verifica che la prenotazione appartenga al negozio
        if (!booking.getBarber().getShop().getEmail().equals(shopEmail)) {
            throw new IllegalStateException("Non autorizzato");
        }

        Barber barber = booking.getBarber();

        // ✅ se cambia barbiere
        if (dto.getBarberId() != null && !dto.getBarberId().equals(barber.getId())) {
            barber = barberRepository.findById(dto.getBarberId())
                    .orElseThrow(() -> new IllegalStateException("Barbiere non trovato"));
            if (!barber.getShop().getEmail().equals(shopEmail)) {
                throw new IllegalStateException("Non autorizzato");
            }
        }

        ServiceEntity service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new IllegalStateException("Servizio non trovato"));

        LocalDateTime start = dto.getStartTime();
        LocalDateTime end = start.plusMinutes(service.getDuration());

        validateSchedule(barber, start, end);

        if (bookingRepository.existsOverlappingBookingExcluding(barber, start, end, id)) {
            throw new IllegalStateException(
                "Il barbiere " + barber.getName() + " ha già una prenotazione in questo orario"
            );
        }

        booking.setBarber(barber);
        booking.setService(service);
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setPriceSnapshot(service.getPrice());
        booking.setNotes(dto.getNotes());

        if (dto.getStatus() != null) {
            booking.setStatus(dto.getStatus());
        }

        return bookingMapper.toDTO(bookingRepository.save(booking));
    }

    public void deleteBooking(Long id, String shopEmail) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Prenotazione non trovata"));

        if (!booking.getBarber().getShop().getEmail().equals(shopEmail)) {
            throw new IllegalStateException("Non autorizzato");
        }

        bookingRepository.delete(booking);
    }

    public List<LocalTime> getAvailableSlots(LocalDate date, Long serviceId, Long barberId, String shopEmail) {

        // ✅ aggiunto barberId come parametro
        Barber barber = barberRepository.findById(barberId)
                .orElseThrow(() -> new IllegalStateException("Barbiere non trovato"));

        if (!barber.getShop().getEmail().equals(shopEmail)) {
            throw new IllegalStateException("Non autorizzato");
        }

        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalStateException("Servizio non trovato"));

        int duration = service.getDuration();
        DayOfWeek day = date.getDayOfWeek();

        Schedule schedule = scheduleRepository
                .findByBarberAndDayOfWeek(barber, day)
                .orElseThrow(() -> new IllegalStateException("Nessun orario definito per questo giorno"));

        LocalTime open = schedule.getOpenTime();
        LocalTime close = schedule.getCloseTime();

        List<Booking> bookings = bookingRepository.findByBarberAndDate(barber, date)
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

    private void validateSchedule(Barber barber, LocalDateTime start, LocalDateTime end) {

        DayOfWeek day = start.getDayOfWeek();

        Schedule schedule = scheduleRepository
                .findByBarberAndDayOfWeek(barber, day)
                .orElseThrow(() -> new IllegalStateException("Nessun orario definito per questo giorno"));

        LocalTime bookingStart = start.toLocalTime();
        LocalTime bookingEnd = end.toLocalTime();

        if (bookingStart.isBefore(schedule.getOpenTime()) ||
            bookingEnd.isAfter(schedule.getCloseTime())) {
            throw new IllegalStateException("Prenotazione fuori orario lavorativo");
        }
    }
}