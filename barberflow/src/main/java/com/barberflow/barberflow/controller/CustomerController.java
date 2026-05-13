package com.barberflow.barberflow.controller;

import com.barberflow.barberflow.dto.CustomerDTO;
import com.barberflow.barberflow.service.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    public ResponseEntity<CustomerDTO> create(@RequestBody CustomerDTO dto, @RequestParam String ownerEmail) {
        return ResponseEntity.ok(customerService.createCustomer(dto, ownerEmail));
    }

    @GetMapping
    public ResponseEntity<List<CustomerDTO>> getAll(Authentication auth) {
        return ResponseEntity.ok(customerService.getCustomers(auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerDTO> update(@PathVariable Long id,
                                              @RequestBody CustomerDTO dto,
                                              Authentication auth) {
        return ResponseEntity.ok(customerService.updateCustomer(id, dto, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        customerService.deleteCustomer(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
