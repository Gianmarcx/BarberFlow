package com.trimflow.trimflow.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BookingDTO {
    private Long id;
    private Long customerId;
    private Long barberId;         
    private Long serviceId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private BigDecimal priceSnapshot;
    private String notes;
    private String customMessage;
}