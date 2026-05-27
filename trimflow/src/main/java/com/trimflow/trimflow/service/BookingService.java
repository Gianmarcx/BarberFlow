package com.trimflow.trimflow.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.trimflow.trimflow.dto.BookingDTO;
import com.trimflow.trimflow.dto.DashboardStatsDTO;
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
import java.util.Optional;
import java.util.stream.Collectors;

import reactor.core.publisher.Mono;

@Service
public class BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final BarberRepository barberRepository;
    private final ScheduleRepository scheduleRepository;
    private final ServiceRepository serviceRepository;
    private final WhatsAppService whatsappService;

    public BookingService(BookingRepository bookingRepository,
                          BookingMapper bookingMapper,
                          CustomerRepository customerRepository,
                          UserRepository userRepository,
                          BarberRepository barberRepository,
                          ScheduleRepository scheduleRepository,
                          ServiceRepository serviceRepository,
                          WhatsAppService whatsappService) {
        this.bookingRepository = bookingRepository;
        this.bookingMapper = bookingMapper;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.barberRepository = barberRepository;
        this.scheduleRepository = scheduleRepository;
        this.serviceRepository = serviceRepository;
        this.whatsappService = whatsappService;
    }

    public BookingDTO createBooking(BookingDTO dto, String shopEmail) {
        User shop = userRepository.findByEmail(shopEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        Barber barber = barberRepository.findById(dto.getBarberId())
                .orElseThrow(() -> new IllegalStateException("Barbiere non trovato"));

        if (!barber.getShop().getId().equals(shop.getId())) {
            throw new IllegalStateException("Non autorizzato");
        }

        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new IllegalStateException("Cliente non trovato"));

        if (!customer.getOwner().getId().equals(shop.getId())) {
            throw new IllegalStateException("Non autorizzato");
        }

        ServiceEntity service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new IllegalStateException("Servizio non trovato"));

        LocalDateTime start = dto.getStartTime();
        LocalDateTime end = start.plusMinutes(service.getDuration());

        validateSchedule(barber, start, end);

        if (bookingRepository.existsOverlappingBooking(barber, start, end)) {
            throw new IllegalStateException(
                "Il barbiere " + barber.getName() + " ha già una prenotazione in questo orario"
            );
        }

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setBarber(barber);
        booking.setService(service);
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setStatus("PENDING");
        booking.setPriceSnapshot(service.getPrice());
        booking.setNotes(dto.getNotes());

        Booking savedBooking = bookingRepository.save(booking);

        if (customer.getPhone() != null && !customer.getPhone().isEmpty() && dto.getWhatsappMessage() != null) {
            whatsappService.sendWhatsAppMessage(shop, customer.getPhone(), dto.getWhatsappMessage())
                .subscribe(
                    result -> logger.info("WhatsApp sent to {}: {}", customer.getPhone(), result),
                    error -> logger.error("WhatsApp failed for {}: {}", customer.getPhone(), error.getMessage())
                );
        }

        return bookingMapper.toDTO(savedBooking);
    }

    public List<BookingDTO> getBookings(String shopEmail) {
        User shop = userRepository.findByEmail(shopEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

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

        if (!booking.getBarber().getShop().getId().equals(shop.getId())) {
            throw new IllegalStateException("Non autorizzato");
        }

        Barber barber = booking.getBarber();

        if (dto.getBarberId() != null && !dto.getBarberId().equals(barber.getId())) {
            barber = barberRepository.findById(dto.getBarberId())
                    .orElseThrow(() -> new IllegalStateException("Barbiere non trovato"));
            
            if (!barber.getShop().getId().equals(shop.getId())) {
                throw new IllegalStateException("Non autorizzato");
            }
        }

        ServiceEntity service = (dto.getServiceId() != null) 
            ? serviceRepository.findById(dto.getServiceId()).orElseThrow(() -> new IllegalStateException("Servizio non trovato"))
            : booking.getService();

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

        User shop = userRepository.findByEmail(shopEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        if (!booking.getBarber().getShop().getId().equals(shop.getId())) {
            throw new IllegalStateException("Non autorizzato");
        }

        bookingRepository.delete(booking);
    }

    public List<LocalTime> getAvailableSlots(LocalDate date, Long serviceId, Long barberId, String shopEmail) {
        Barber barber = barberRepository.findById(barberId)
                .orElseThrow(() -> new IllegalStateException("Barbiere non trovato"));

        User shop = userRepository.findByEmail(shopEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        if (!barber.getShop().getId().equals(shop.getId())) {
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

        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();

        List<Booking> bookings = bookingRepository.findByStartTimeBetweenAndStatus(dayStart, dayEnd, "CONFIRMED")
                .stream()
                .filter(b -> !"CANCELLED".equals(b.getStatus()))
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
            !bookingEnd.isBefore(schedule.getCloseTime())) {
            throw new IllegalStateException("Prenotazione fuori orario lavorativo");
        }
    }

    public DashboardStatsDTO getTodayStats(String shopEmail) {
        try {
            LocalDate today = LocalDate.now();
            
            User shop = userRepository.findByEmail(shopEmail)
                    .orElseThrow(() -> new IllegalStateException("Utente non trovato: " + shopEmail));

            List<Barber> barbers = barberRepository.findByShop(shop);
            if (barbers.isEmpty()) {
                logger.debug("Nessun barbiere trovato per lo shop: {}", shopEmail);
                return new DashboardStatsDTO(0, 0, 0, 0, 0.0, "EUR");
            }

            LocalDateTime startOfDay = today.atStartOfDay();
            LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();

            List<Booking> todayBookings = bookingRepository.findByStartTimeBetweenAndStatus(startOfDay, endOfDay, "CONFIRMED")
                    .stream()
                    .collect(Collectors.toList());

            if (todayBookings.isEmpty()) {
                logger.debug("Nessuna prenotazione trovata per oggi: {}", today);
                return new DashboardStatsDTO(0, 0, 0, 0, 0.0, "EUR");
            }

            long confirmed = todayBookings.stream()
                    .filter(b -> b != null && b.getStatus() != null)
                    .filter(b -> "CONFIRMED".equals(b.getStatus()) || "COMPLETED".equals(b.getStatus()))
                    .count();
            
            long pending = todayBookings.stream()
                    .filter(b -> b != null && "PENDING".equals(b.getStatus()))
                    .count();
            
            long cancelled = todayBookings.stream()
                    .filter(b -> b != null && "CANCELLED".equals(b.getStatus()))
                    .count();

            double totalRevenue = todayBookings.stream()
                    .filter(b -> b != null && b.getStatus() != null)
                    .filter(b -> "CONFIRMED".equals(b.getStatus()) || "COMPLETED".equals(b.getStatus()))
                    .mapToDouble(b -> {
                        try {
                            var price = b.getPriceSnapshot();
                            return price != null ? price.doubleValue() : 0.0;
                        } catch (Exception e) {
                            logger.warn("Errore conversione prezzo per booking {}: {}", 
                                b != null ? b.getId() : "null", e.getMessage());
                            return 0.0;
                        }
                    })
                    .sum();

            logger.info("Stats calcolate per shop {}: {} prenotazioni, {} incasso", 
                shopEmail, todayBookings.size(), totalRevenue);
            
            return new DashboardStatsDTO(
                    todayBookings.size(),
                    confirmed,
                    pending,
                    cancelled,
                    Math.round(totalRevenue * 100.0) / 100.0,
                    "EUR"
            );
            
        } catch (Exception e) {
            logger.error("Errore in getTodayStats per shop {}: {}", shopEmail, e.getMessage(), e);
            return new DashboardStatsDTO(0, 0, 0, 0, 0.0, "EUR");
        }
    }

    public Mono<String> sendWhatsAppWithMessage(String shopEmail, Long customerId, String phone, String message) {
        Optional<Customer> customerOpt = customerRepository.findById(customerId);
        Optional<User> shopOpt = userRepository.findByEmail(shopEmail);

        if (customerOpt.isEmpty() || shopOpt.isEmpty()) {
            return Mono.just("Shop o cliente non trovato");
        }

        Customer customer = customerOpt.get();
        User shop = shopOpt.get();

        if (!shop.isWhatsappRemindersEnabled()) {
            return Mono.just("WhatsApp non configurato per questo shop");
        }

        return whatsappService.sendWhatsAppMessage(shop, phone, message)
            .doOnSuccess(r -> logger.info("WhatsApp custom message: {}", r))
            .doOnError(e -> logger.error("WhatsApp custom message error: {}", e.getMessage()));
    }
}