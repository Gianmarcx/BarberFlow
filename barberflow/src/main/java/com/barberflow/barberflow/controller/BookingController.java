package com.barberflow.barberflow.controller;

import com.barberflow.barberflow.dto.BookingDTO;
import com.barberflow.barberflow.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // ---------------------------------------------------------
    // CREATE BOOKING
    // ---------------------------------------------------------
    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(
            @RequestBody BookingDTO dto,
            Authentication auth) {

        return ResponseEntity.ok(
                bookingService.createBooking(dto, auth.getName())
        );
    }

    // ---------------------------------------------------------
    // GET ALL BOOKINGS
    // ---------------------------------------------------------
    @GetMapping
    public ResponseEntity<List<BookingDTO>> getBookings(Authentication auth) {
        return ResponseEntity.ok(
                bookingService.getBookings(auth.getName())
        );
    }

    // ---------------------------------------------------------
    // UPDATE BOOKING
    // ---------------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<BookingDTO> updateBooking(
            @PathVariable Long id,
            @RequestBody BookingDTO dto,
            Authentication auth) {

        return ResponseEntity.ok(
                bookingService.updateBooking(id, dto, auth.getName())
        );
    }

    // ---------------------------------------------------------
    // DELETE BOOKING
    // ---------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable Long id,
            Authentication auth) {

        bookingService.deleteBooking(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    // ---------------------------------------------------------
    // AVAILABLE SLOTS
    // ---------------------------------------------------------
    @GetMapping("/available")
    public ResponseEntity<List<LocalTime>> getAvailableSlots(
            @RequestParam LocalDate date,
            @RequestParam Long serviceId,
            Authentication auth) {

        return ResponseEntity.ok(
                bookingService.getAvailableSlots(date, serviceId, auth.getName())
        );
    }
}
