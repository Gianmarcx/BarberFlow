package com.barberflow.barberflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/protected")
public class ProtectedResourceController {

    @GetMapping("/resource")
    public ResponseEntity<String> getProtected() {
        return ResponseEntity.ok("Risorsa protetta: accesso consentito");
    }
}
