package com.barberflow.barberflow.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "barber_id", nullable = false)
    private User barber;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;   // 🔥 relazione corretta

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;   // 🔥 calcolato dal backend

    @Column
    private String notes;
}
