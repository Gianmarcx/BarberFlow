package com.barberflow.barberflow.controller;

import com.barberflow.barberflow.entity.Booking;
import com.barberflow.barberflow.entity.Customer;
import com.barberflow.barberflow.entity.User;
import com.barberflow.barberflow.service.BookingService;
import com.barberflow.barberflow.service.CustomerService;
import com.barberflow.barberflow.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;
    private final CustomerService customerService;

    public BookingController(BookingService bookingService,
                             UserService userService,
                             CustomerService customerService) {
        this.bookingService = bookingService;
        this.userService = userService;
        this.customerService = customerService;
    }

    @PostMapping("/{userEmail}/{customerId}")
    public Booking createBooking(@PathVariable String userEmail,
                                 @PathVariable Long customerId,
                                 @RequestBody Booking booking) {

        User barber = userService.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Customer customer = customerService.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        booking.setBarber(barber);
        booking.setCustomer(customer);

        return bookingService.save(booking);
    }

    @GetMapping("/{userEmail}")
    public List<Booking> getBookings(@PathVariable String userEmail) {
        User barber = userService.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingService.findByBarber(barber);
    }

    @GetMapping("/{userEmail}/day")
    public List<Booking> getBookingsByDay(@PathVariable String userEmail,
                                          @RequestParam String date) {

        User barber = userService.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate parsedDate = LocalDate.parse(date);

        return bookingService.findByBarberAndDate(barber, parsedDate);
    }
}
