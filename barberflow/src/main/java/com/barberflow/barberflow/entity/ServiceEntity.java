package com.barberflow.barberflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "services")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int duration; // minuti

    @Column(nullable = false)
    private double price;

    @ManyToOne
    @JoinColumn(name = "barber_id", nullable = false)
    private User barber;
}
