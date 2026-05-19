package com.trimflow.trimflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.trimflow.trimflow.entity.Barber;
import com.trimflow.trimflow.entity.User;

import java.util.List;

public interface BarberRepository extends JpaRepository<Barber, Long> {
    List<Barber> findByShop(User shop);  // ✅ rinominato da owner a shop
}