package com.barberflow.barberflow.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingDTO {

    private Long id;
    private Long customerId;
    private Long serviceId;   // 🔥 fondamentale
    private LocalDateTime startTime;
    private String notes;
}
