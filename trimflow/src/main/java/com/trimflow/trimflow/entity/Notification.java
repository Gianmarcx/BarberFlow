package com.trimflow.trimflow.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String shopEmail;
    private String title;
    private String message;
    private String type; // es: WHATSAPP_FAILED, BOOKING_CONFIRMED
    private boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();
}