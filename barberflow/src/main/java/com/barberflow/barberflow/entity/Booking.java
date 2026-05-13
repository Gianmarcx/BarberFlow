package com.barberflow.barberflow.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
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
    private ServiceEntity service;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private String status = "PENDING";      // ✅ aggiunto: PENDING, CONFIRMED, CANCELLED, COMPLETED

    @Column(name = "price_snapshot")
    private BigDecimal priceSnapshot;       // ✅ aggiunto: prezzo al momento della prenotazione

    @Column
    private String notes;
}