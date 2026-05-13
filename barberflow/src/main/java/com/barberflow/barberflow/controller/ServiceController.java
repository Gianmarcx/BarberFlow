package com.barberflow.barberflow.controller;

import com.barberflow.barberflow.dto.ServiceDTO;
import com.barberflow.barberflow.service.ServiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceService serviceService;

    public ServiceController(ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    @PostMapping
    public ResponseEntity<ServiceDTO> create(@RequestBody ServiceDTO dto, Authentication auth) {
        return ResponseEntity.ok(serviceService.create(dto, auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<ServiceDTO>> getAll(Authentication auth) {
        return ResponseEntity.ok(serviceService.getAll(auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceDTO> update(@PathVariable Long id,
                                             @RequestBody ServiceDTO dto,
                                             Authentication auth) {
        return ResponseEntity.ok(serviceService.update(id, dto, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        serviceService.delete(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
