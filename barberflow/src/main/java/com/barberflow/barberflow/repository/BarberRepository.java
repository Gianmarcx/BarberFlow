package com.barberflow.barberflow.repository;

import com.barberflow.barberflow.entity.Barber;
import com.barberflow.barberflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BarberRepository extends JpaRepository<Barber, Long> {
    List<Barber> findByShop(User shop);  // ✅ rinominato da owner a shop
}