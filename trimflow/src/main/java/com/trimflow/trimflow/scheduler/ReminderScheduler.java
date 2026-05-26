package com.trimflow.trimflow.scheduler;

import com.trimflow.trimflow.entity.Booking;
import com.trimflow.trimflow.repository.BookingRepository;
import com.trimflow.trimflow.service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReminderScheduler {

    private final BookingRepository bookingRepository;
    private final WhatsAppService whatsappService;

    // ✅ Esegui ogni 30 minuti
    @Scheduled(cron = "0 */30 * * * *")
    public void sendReminders() {
        log.info("🔄 Checking WhatsApp reminders...");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime in24h = now.plusHours(24);
        LocalDateTime in1h = now.plusHours(1);

        // Reminder 24h prima (finestra ±30 min per tolleranza)
        sendRemindersForWindow("24h", 
            bookingRepository.findByStartTimeBetweenAndStatus(
                in24h.minusMinutes(30), in24h.plusMinutes(30), "CONFIRMED"));

        // Reminder 1h prima (finestra ±15 min)
        sendRemindersForWindow("1h", 
            bookingRepository.findByStartTimeBetweenAndStatus(
                in1h.minusMinutes(15), in1h.plusMinutes(15), "CONFIRMED"));
    }

    private void sendRemindersForWindow(String label, List<Booking> bookings) {
        if (bookings == null || bookings.isEmpty()) return;

        for (Booking booking : bookings) {
            // Recupera email dello shop dal barbiere associato
            String shopEmail = booking.getBarber().getShop().getEmail();
            
            if (booking.getCustomer().getPhone() != null) {
                if ("24h".equals(label)) {
                    whatsappService.send24hReminder(shopEmail, booking)
                        .subscribe(r -> log.info("✅ Reminder 24h inviato a {}", booking.getCustomer().getPhone()));
                } else {
                    whatsappService.send1hReminder(shopEmail, booking)
                        .subscribe(r -> log.info("✅ Reminder 1h inviato a {}", booking.getCustomer().getPhone()));
                }
            }
        }
    }
}