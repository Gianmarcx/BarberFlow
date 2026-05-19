package com.trimflow.trimflow.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "barbers")
@Getter
@Setter
public class Barber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;              // solo nome, niente cognome

    private String specialization;   // es. "Taglio uomo", "Barba"

    @ManyToOne
    @JoinColumn(name = "shop_id", nullable = false)
    private User shop;               // ✅ rinominato da owner a shop — è il negozio
}