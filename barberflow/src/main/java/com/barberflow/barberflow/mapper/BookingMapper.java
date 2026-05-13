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
        dto.setServiceId(booking.getService().getId());  // 🔥 corretto
        dto.setStartTime(booking.getStartTime());
        dto.setNotes(booking.getNotes());

        return dto;
    }
}
