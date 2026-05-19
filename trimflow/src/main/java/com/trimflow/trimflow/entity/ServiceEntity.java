package com.trimflow.trimflow.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;                     // ✅ aggiunto, era nel SQL ma mancava qui

    @Column(nullable = false)
    private int duration;                           // minuti

    @Column(nullable = false)
    private BigDecimal price;                       // ✅ era double, corretto in BigDecimal

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false) // ✅ era "barber_id", allineato al SQL
    private User owner;                              // ✅ rinominato da barber a owner, più semantico
}