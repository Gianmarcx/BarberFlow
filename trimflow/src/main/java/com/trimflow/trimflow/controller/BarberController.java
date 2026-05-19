package com.trimflow.trimflow.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.trimflow.trimflow.dto.BarberDTO;
import com.trimflow.trimflow.service.BarberService;

import java.util.List;

@RestController
@RequestMapping("/api/barbers")
public class BarberController {

    private final BarberService barberService;

    public BarberController(BarberService barberService) {
        this.barberService = barberService;
    }

    @PostMapping
    public ResponseEntity<BarberDTO> create(
            @RequestBody BarberDTO dto,
            Authentication auth) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(barberService.create(dto, auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<BarberDTO>> getAll(Authentication auth) {
        return ResponseEntity.ok(barberService.getAll(auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BarberDTO> update(
            @PathVariable Long id,
            @RequestBody BarberDTO dto,
            Authentication auth) {
        return ResponseEntity.ok(barberService.update(id, dto, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication auth) {
        barberService.delete(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}