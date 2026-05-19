package com.trimflow.trimflow.service;

import org.springframework.stereotype.Service;

import com.trimflow.trimflow.dto.CustomerDTO;
import com.trimflow.trimflow.entity.Customer;
import com.trimflow.trimflow.entity.User;
import com.trimflow.trimflow.mapper.CustomerMapper;
import com.trimflow.trimflow.repository.CustomerRepository;
import com.trimflow.trimflow.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final UserRepository userRepository;

    public CustomerService(CustomerRepository customerRepository,
                           CustomerMapper customerMapper,
                           UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.customerMapper = customerMapper;
        this.userRepository = userRepository;
    }

    public CustomerDTO createCustomer(CustomerDTO dto, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        Customer customer = customerMapper.toEntity(dto);
        customer.setOwner(owner);

        return customerMapper.toDTO(customerRepository.save(customer));
    }

    public List<CustomerDTO> getCustomers(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        return customerRepository.findByOwner(owner)
                .stream()
                .map(customerMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ✅ restituisce DTO invece dell'entità grezza
    public CustomerDTO findById(Long id, String ownerEmail) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Cliente non trovato"));

        if (!customer.getOwner().getEmail().equals(ownerEmail)) {
            throw new IllegalStateException("Non autorizzato");
        }

        return customerMapper.toDTO(customer);
    }

    public CustomerDTO updateCustomer(Long id, CustomerDTO dto, String ownerEmail) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Cliente non trovato"));

        if (!customer.getOwner().getEmail().equals(ownerEmail)) {
            throw new IllegalStateException("Non autorizzato");
        }

        customer.setName(dto.getName());
        customer.setSurname(dto.getSurname());
        customer.setPhone(dto.getPhone());
        customer.setEmail(dto.getEmail());
        customer.setNotes(dto.getNotes());

        return customerMapper.toDTO(customerRepository.save(customer));
    }

    public void deleteCustomer(Long id, String ownerEmail) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Cliente non trovato"));

        if (!customer.getOwner().getEmail().equals(ownerEmail)) {
            throw new IllegalStateException("Non autorizzato");
        }

        customerRepository.delete(customer);
    }
}