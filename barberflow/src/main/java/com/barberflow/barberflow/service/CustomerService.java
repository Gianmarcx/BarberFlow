package com.barberflow.barberflow.service;

import com.barberflow.barberflow.entity.Customer;
import com.barberflow.barberflow.entity.User;
import com.barberflow.barberflow.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Customer save(Customer customer) {
        return customerRepository.save(customer);
    }

    public List<Customer> findByOwner(User owner) {
        return customerRepository.findByOwner(owner);
    }

    public Optional<Customer> findById(Long id) {
        return customerRepository.findById(id);
    }
}
