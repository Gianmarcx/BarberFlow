package com.trimflow.trimflow.controller;

import com.trimflow.trimflow.entity.User;
import com.trimflow.trimflow.repository.UserRepository;
import com.trimflow.trimflow.service.EncryptionService;
import com.trimflow.trimflow.service.WhatsAppService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/whatsapp")
@RequiredArgsConstructor
public class WhatsAppConfigController {

    private final WhatsAppService whatsappService;
    private final UserRepository userRepository;
    private final EncryptionService encryptionService;

    @PostMapping("/config")
    public ResponseEntity<?> saveConfig(@RequestBody WhatsAppConfigRequest req, Authentication auth) {
        String shopEmail = auth.getName();
        
        User shop = userRepository.findByEmail(shopEmail)
            .orElseThrow(() -> new IllegalStateException("Shop non trovato"));
        
        if (req.getAccessToken() != null && !req.getAccessToken().isBlank()) {
            shop.setWhatsappAccessToken(encryptionService.encrypt(req.getAccessToken()));
        }
        
        if (req.getPhoneNumberId() != null) {
            shop.setWhatsappPhoneNumberId(req.getPhoneNumberId());
        }
        
        shop.setWhatsappRemindersEnabled(req.isEnabled());
        shop.setWhatsappConfiguredAt(LocalDateTime.now());
        
        userRepository.save(shop);
        
        return ResponseEntity.ok(Map.of("success", true, "message", "Configurazione salvata"));
    }

    @GetMapping("/config")
    public ResponseEntity<?> getConfig(Authentication auth) {
        String shopEmail = auth.getName();
        
        User shop = userRepository.findByEmail(shopEmail)
            .orElseThrow(() -> new IllegalStateException("Shop non trovato"));
        
        return ResponseEntity.ok(Map.of(
            "enabled", shop.isWhatsappRemindersEnabled(),
            "configured", shop.getWhatsappAccessToken() != null,
            "phoneNumberId", maskPhoneNumberId(shop.getWhatsappPhoneNumberId())
        ));
    }

    @PostMapping("/test")
    public ResponseEntity<?> sendTest(@RequestBody TestRequest req, Authentication auth) {
        String shopEmail = auth.getName();
        
        return whatsappService.testWhatsAppConfig(shopEmail, req.getPhone())
            .map(result -> ResponseEntity.ok(Map.of("success", true, "message", result)))
            .onErrorReturn(ResponseEntity.badRequest().body(Map.of("success", false, "error", "Configurazione non valida")))
            .block();
    }

    private String maskPhoneNumberId(String id) {
        if (id == null || id.length() < 4) return "***";
        return "***" + id.substring(id.length() - 4);
    }

    @Data
    public static class WhatsAppConfigRequest {
        private String phoneNumberId;
        private String accessToken;
        private boolean enabled;
    }

    @Data
    public static class TestRequest {
        private String phone;
    }
}