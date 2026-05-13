package com.barberflow.barberflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String surname;

    private String email;

    private String phone;

    private String notes;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;  // il barbiere a cui appartiene il cliente

    // ✅ Rimossi getter e setter manuali — li genera già @Getter/@Setter
}