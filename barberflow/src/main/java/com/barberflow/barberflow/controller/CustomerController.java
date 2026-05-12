package com.barberflow.barberflow.controller;

import com.barberflow.barberflow.entity.Customer;
import com.barberflow.barberflow.entity.User;
import com.barberflow.barberflow.service.CustomerService;
import com.barberflow.barberflow.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;
    private final UserService userService;

    public CustomerController(CustomerService customerService,
                              UserService userService) {
        this.customerService = customerService;
        this.userService = userService;
    }

    @PostMapping("/{userEmail}")
    public Customer createCustomer(@PathVariable String userEmail,
                                   @RequestBody Customer customer) {
        User owner = userService.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        customer.setOwner(owner);
        return customerService.save(customer);
    }

    @GetMapping("/{userEmail}")
    public List<Customer> getCustomers(@PathVariable String userEmail) {
        User owner = userService.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return customerService.findByOwner(owner);
    }
}
