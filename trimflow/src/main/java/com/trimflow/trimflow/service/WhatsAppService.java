package com.trimflow.trimflow.service;

import com.trimflow.trimflow.entity.Booking;
import com.trimflow.trimflow.entity.User;
import com.trimflow.trimflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WhatsAppService {

    private final UserRepository userRepository;
    private final WebClient.Builder webClientBuilder;
    private final EncryptionService encryptionService;

    private static final DateTimeFormatter IT_DATE = DateTimeFormatter.ofPattern("dd MMMM yyyy", Locale.of("it"));
    private static final DateTimeFormatter IT_TIME = DateTimeFormatter.ofPattern("HH:mm");

    public Mono<String> sendBookingConfirmation(String shopEmail, Booking booking, String customMessage) {
        return Mono.justOrEmpty(userRepository.findByEmail(shopEmail))
            .flatMap(shop -> {
                if (!shop.isWhatsappRemindersEnabled() || 
                    shop.getWhatsappAccessToken() == null || 
                    booking.getCustomer().getPhone() == null) {
                    return Mono.just("WhatsApp non configurato o disabilitato per questo shop");
                }
                String message = buildConfirmationMessage(booking, customMessage);
                return sendWhatsAppMessage(shop, booking.getCustomer().getPhone(), message);
            })
            .switchIfEmpty(Mono.just("Shop non trovato: " + shopEmail))
            .doOnSuccess(r -> log.info("WhatsApp confirmation: {}", r))
            .doOnError(e -> log.error("WhatsApp error: {}", e.getMessage()));
    }

    public Mono<String> send24hReminder(String shopEmail, Booking booking) {
        return Mono.justOrEmpty(userRepository.findByEmail(shopEmail))
            .flatMap(shop -> {
                if (!shop.isWhatsappRemindersEnabled() || 
                    shop.getWhatsappAccessToken() == null || 
                    booking.getCustomer().getPhone() == null) {
                    return Mono.just("WhatsApp non configurato");
                }
                String message = build24hReminderMessage(booking);
                return sendWhatsAppMessage(shop, booking.getCustomer().getPhone(), message);
            });
    }

    public Mono<String> send1hReminder(String shopEmail, Booking booking) {
        return Mono.justOrEmpty(userRepository.findByEmail(shopEmail))
            .flatMap(shop -> {
                if (!shop.isWhatsappRemindersEnabled() || 
                    shop.getWhatsappAccessToken() == null || 
                    booking.getCustomer().getPhone() == null) {
                    return Mono.just("WhatsApp non configurato");
                }
                String message = build1hReminderMessage(booking);
                return sendWhatsAppMessage(shop, booking.getCustomer().getPhone(), message);
            });
    }

    private String buildConfirmationMessage(Booking booking, String customMessage) {
        String base = String.format(
            "✅ *Prenotazione confermata*\\n\\n" +
            "Ciao %s 👋\\n\\n" +
            "📅 %s\\n" +
            "🕐 %s\\n" +
            "✂️ %s\\n" +
            "👨‍🦱 %s",
            booking.getCustomer().getName(),
            booking.getStartTime().format(IT_DATE),
            booking.getStartTime().format(IT_TIME),
            booking.getService().getName(),
            booking.getBarber().getName()
        );
        
        if (customMessage != null && !customMessage.isBlank()) {
            return base + "\\n\\n" + "📝 *Nota dal barbiere:*\\n" + customMessage + "\\n\\n" + "Ti aspettiamo! ✂️✨";
        }
        return base + "\\n\\n" + "Ti aspettiamo! ✂️✨";
    }

    private String build24hReminderMessage(Booking booking) {
        return String.format(
            "🔔 *Promemoria appuntamento*\\n\\n" +
            "Ciao %s,\\n\\n" +
            "Domani alle *%s* hai un appuntamento da *%s*.\\n" +
            "Servizio: %s\\n\\n" +
            "Rispondi a questo messaggio se devi modificare. 📱",
            booking.getCustomer().getName(),
            booking.getStartTime().format(IT_TIME),
            booking.getBarber().getName(),
            booking.getService().getName()
        );
    }

    private String build1hReminderMessage(Booking booking) {
        return String.format(
            "⏰ *Tra 1 ora: il tuo appuntamento!*\\n\\n" +
            "Ore: *%s*\\n" +
            "Barbiere: *%s*\\n\\n" +
            "Ci vediamo tra poco! ✂️",
            booking.getStartTime().format(IT_TIME),
            booking.getBarber().getName()
        );
    }

    private Mono<String> sendWhatsAppMessage(User shop, String to, String text) {
        String formattedPhone = to.startsWith("+") ? to.substring(1) : to;
        if (!formattedPhone.startsWith("39") && formattedPhone.length() == 10) {
            formattedPhone = "39" + formattedPhone;
        }
        final String targetPhone = formattedPhone;

        String decryptedToken;
        try {
            decryptedToken = encryptionService.decrypt(shop.getWhatsappAccessToken());
        } catch (Exception e) {
            return Mono.just("Errore decrittografia token: " + e.getMessage());
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("messaging_product", "whatsapp");
        payload.put("to", targetPhone);
        payload.put("type", "text");
        
        Map<String, String> textBody = new HashMap<>();
        textBody.put("body", text);
        payload.put("text", textBody);

        WebClient webClient = webClientBuilder
            .baseUrl("https://graph.facebook.com/v18.0")
            .defaultHeader("Authorization", "Bearer " + decryptedToken)
            .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
            .build();

        return webClient.post()
            .uri("/" + shop.getWhatsappPhoneNumberId() + "/messages")
            .bodyValue(payload)
            .retrieve()
            .bodyToMono(Map.class)
            .map(response -> {
                if (response.containsKey("messages")) {
                    return "Inviato a " + targetPhone;
                }
                return "Errore API: " + response;
            })
            .onErrorResume(e -> {
                log.error("WhatsApp API error for shop {}: {}", shop.getEmail(), e.getMessage());
                return Mono.just("Errore WhatsApp: " + e.getMessage());
            });
    }

    public Mono<String> testWhatsAppConfig(String shopEmail, String testPhone) {
        return Mono.justOrEmpty(userRepository.findByEmail(shopEmail))
            .flatMap(shop -> {
                if (shop.getWhatsappAccessToken() == null || shop.getWhatsappPhoneNumberId() == null) {
                    return Mono.just("❌ Configurazione incompleta: mancano token o phone number ID");
                }
                
                String message = "🧪 *Test TrimFlow*\\n\\nSe ricevi questo messaggio, la configurazione WhatsApp è corretta! ✅";
                return sendWhatsAppMessage(shop, testPhone, message)
                    .map(result -> "✅ Test inviato: " + result);
            })
            .switchIfEmpty(Mono.just("❌ Shop non trovato"));
    }
}