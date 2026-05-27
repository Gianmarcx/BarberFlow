package com.trimflow.trimflow.controller;

import com.trimflow.trimflow.service.BookingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingWhatsAppController {

    private final BookingService bookingService;

    @PostMapping("/whatsapp")
    public Mono<ResponseEntity<Map<String, Object>>> sendWhatsApp(
            @RequestBody WhatsAppRequest req,
            Authentication auth) {
        
        if (auth == null || !auth.isAuthenticated()) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Non autenticato");
            return Mono.just(ResponseEntity.status(401).body(err));
        }
        
        if (req.getCustomerId() == null || req.getPhone() == null || req.getPhone().isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("error", "customerId e phone sono obbligatori");
            return Mono.just(ResponseEntity.badRequest().body(err));
        }
        
        String shopEmail = auth.getName();
        
        return bookingService.sendWhatsAppWithMessage(
                shopEmail, 
                req.getCustomerId(), 
                req.getPhone(), 
                req.getMessage()
            )
            .map(result -> {
                Map<String, Object> res = new HashMap<>();
                res.put("success", true);
                res.put("message", result);
                return ResponseEntity.ok(res);
            })
            .onErrorResume(e -> {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("error", "Errore: " + e.getMessage());
                return Mono.just(ResponseEntity.badRequest().body(err));
            });
    }

    @Data
    public static class WhatsAppRequest {
        private Long customerId;
        private String phone;
        private String message;
    }
}