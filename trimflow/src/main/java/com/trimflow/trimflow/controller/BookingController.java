package com.trimflow.trimflow.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.trimflow.trimflow.dto.BookingDTO;
import com.trimflow.trimflow.service.BookingService;

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

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(
            @RequestBody BookingDTO dto,
            Authentication auth) {
        return ResponseEntity
                .status(HttpStatus.CREATED)             
                .body(bookingService.createBooking(dto, auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<BookingDTO>> getBookings(Authentication auth) {
        return ResponseEntity.ok(bookingService.getBookings(auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingDTO> updateBooking(
            @PathVariable Long id,
            @RequestBody BookingDTO dto,
            Authentication auth) {
        return ResponseEntity.ok(bookingService.updateBooking(id, dto, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable Long id,
            Authentication auth) {
        bookingService.deleteBooking(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/available")
    public ResponseEntity<List<LocalTime>> getAvailableSlots(
            @RequestParam LocalDate date,
            @RequestParam Long serviceId,
            @RequestParam Long barberId,
            Authentication auth) {
        return ResponseEntity.ok(
                bookingService.getAvailableSlots(date, serviceId, barberId, auth.getName())
        );
    }
}