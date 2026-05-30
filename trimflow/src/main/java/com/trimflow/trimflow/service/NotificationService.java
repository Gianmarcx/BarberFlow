package com.trimflow.trimflow.service;

import com.trimflow.trimflow.entity.Notification;
import com.trimflow.trimflow.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public Notification create(String shopEmail, String title, String message, String type) {
        Notification n = new Notification();
        n.setShopEmail(shopEmail);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        return notificationRepository.save(n);
    }

    public List<Notification> getUnread(String shopEmail) {
        return notificationRepository.findByShopEmailAndIsReadOrderByCreatedAtDesc(shopEmail, false);
    }

    public long getUnreadCount(String shopEmail) {
        return notificationRepository.countByShopEmailAndIsRead(shopEmail, false);
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}