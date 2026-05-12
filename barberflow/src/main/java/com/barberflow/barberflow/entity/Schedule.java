package com.barberflow.barberflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Table(name = "schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DayOfWeek dayOfWeek; // LUNEDI, MARTEDI, ...

    @Column(nullable = false)
    private LocalTime startTime; // ora di apertura

    @Column(nullable = false)
    private LocalTime endTime; // ora di chiusura

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User barber;

    public User getBarber() {
        return barber;
    }

    public void setBarber(User barber) {
        this.barber = barber;
    }
}
