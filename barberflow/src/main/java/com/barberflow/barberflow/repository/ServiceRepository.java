package com.barberflow.barberflow.repository;

import com.barberflow.barberflow.entity.ServiceEntity;
import com.barberflow.barberflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    List<ServiceEntity> findByOwner(User owner);  // ✅ era findByBarber()
}