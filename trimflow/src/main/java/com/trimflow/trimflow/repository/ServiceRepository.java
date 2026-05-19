package com.trimflow.trimflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.trimflow.trimflow.entity.ServiceEntity;
import com.trimflow.trimflow.entity.User;

import java.util.List;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    List<ServiceEntity> findByOwner(User owner);  // ✅ era findByBarber()
}