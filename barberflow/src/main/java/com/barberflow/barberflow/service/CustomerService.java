package com.barberflow.barberflow.service;

import com.barberflow.barberflow.dto.CustomerDTO;
import com.barberflow.barberflow.entity.Customer;
import com.barberflow.barberflow.entity.User;
import com.barberflow.barberflow.mapper.CustomerMapper;
import com.barberflow.barberflow.repository.CustomerRepository;
import com.barberflow.barberflow.repository.UserRepository;
import org.springframework.stereotype.Service;

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

        Customer saved = customerRepository.save(customer);
        return customerMapper.toDTO(saved);
    }

    public List<CustomerDTO> getCustomers(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        return customerRepository.findByOwner(owner)
                .stream()
                .map(customerMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Customer findById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Cliente non trovato"));
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
