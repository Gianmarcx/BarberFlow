package com.trimflow.trimflow.repository;

import com.trimflow.trimflow.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByShopEmailAndIsReadOrderByCreatedAtDesc(String shopEmail, boolean isRead);
    long countByShopEmailAndIsRead(String shopEmail, boolean isRead);
}