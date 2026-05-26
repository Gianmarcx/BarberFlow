package com.trimflow.trimflow.controller;

import com.trimflow.trimflow.service.WhatsAppService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/whatsapp")
@RequiredArgsConstructor
public class WhatsAppConfigController {

    private final WhatsAppService whatsappService;

    // ✅ Salva configurazione WhatsApp per lo shop corrente
    @PostMapping("/config")
    public ResponseEntity<?> saveConfig(
            @RequestBody WhatsAppConfigRequest req,
            Authentication auth) {
        
        String shopEmail = auth.getName(); // Email dello shop loggato
        
        // TODO: Implementare aggiornamento DB reale
        // Esempio:
        // User shop = userRepository.findByEmail(shopEmail).orElseThrow();
        // shop.setWhatsappPhoneNumberId(req.getPhoneNumberId());
        // shop.setWhatsappAccessToken(req.getAccessToken());
        // shop.setWhatsappRemindersEnabled(req.isEnabled());
        // shop.setWhatsappConfiguredAt(LocalDateTime.now());
        // userRepository.save(shop);
        
        return ResponseEntity.ok(Map.of("success", true, "message", "Configurazione salvata"));
    }

    // ✅ Ottieni stato configurazione (per frontend)
    @GetMapping("/config")
    public ResponseEntity<?> getConfig(Authentication auth) {
        String shopEmail = auth.getName();
        
        // TODO: Recupera configurazione reale dal DB
        // Esempio:
        // User shop = userRepository.findByEmail(shopEmail).orElseThrow();
        // return ResponseEntity.ok(Map.of(
        //     "enabled", shop.isWhatsappRemindersEnabled(),
        //     "configured", shop.getWhatsappAccessToken() != null,
        //     "phoneNumberId", maskPhoneNumberId(shop.getWhatsappPhoneNumberId())
        // ));
        
        // Placeholder per sviluppo
        return ResponseEntity.ok(Map.of("enabled", false, "configured", false));
    }

    // ✅ Invia messaggio di test
    @PostMapping("/test")
    public ResponseEntity<?> sendTest(
            @RequestBody TestRequest req,
            Authentication auth) {
        
        String shopEmail = auth.getName();
        
        return whatsappService.testWhatsAppConfig(shopEmail, req.getPhone())
            .map(result -> ResponseEntity.ok(Map.of("success", true, "message", result)))
            .onErrorReturn(ResponseEntity.badRequest().body(Map.of("success", false, "error", "Configurazione non valida")))
            .block();
    }

    // ✅ DTO per richiesta salvataggio configurazione
    @Data  // ✅ Lombok genera automaticamente getter/setter
    public static class WhatsAppConfigRequest {
        private String phoneNumberId;
        private String accessToken;
        private boolean enabled;
    }

    // ✅ DTO per richiesta test messaggio
    @Data  // ✅ Lombok genera automaticamente getter/setter
    public static class TestRequest {
        private String phone;
    }

    // ✅ Utility per mascherare ID nei log (non esporre mai token completi)
    private String maskPhoneNumberId(String id) {
        if (id == null || id.length() < 4) return "***";
        return "***" + id.substring(id.length() - 4);
    }
}