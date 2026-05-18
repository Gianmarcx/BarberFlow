package com.barberflow.barberflow.mapper;

import com.barberflow.barberflow.dto.BookingDTO;
import com.barberflow.barberflow.entity.Booking;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public BookingDTO toDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setCustomerId(booking.getCustomer().getId());
        dto.setBarberId(booking.getBarber().getId());       // ✅ aggiunto
        dto.setServiceId(booking.getService().getId());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setStatus(booking.getStatus());
        dto.setPriceSnapshot(booking.getPriceSnapshot());
        dto.setNotes(booking.getNotes());
        return dto;
    }

    public Booking toEntity(BookingDTO dto) {
        Booking booking = new Booking();
        booking.setStartTime(dto.getStartTime());
        booking.setNotes(dto.getNotes());
        return booking;
    }
}