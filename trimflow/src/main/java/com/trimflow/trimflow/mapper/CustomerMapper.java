package com.trimflow.trimflow.mapper;

import org.springframework.stereotype.Component;

import com.trimflow.trimflow.dto.CustomerDTO;
import com.trimflow.trimflow.entity.Customer;

@Component
public class CustomerMapper {

    public CustomerDTO toDTO(Customer c) {
        return new CustomerDTO(
                c.getId(),
                c.getName(),
                c.getSurname(),
                c.getPhone(),
                c.getEmail(),
                c.getNotes()
        );
    }

    public Customer toEntity(CustomerDTO dto) {
        Customer c = new Customer();
        c.setId(dto.getId());
        c.setName(dto.getName());
        c.setSurname(dto.getSurname());
        c.setPhone(dto.getPhone());
        c.setEmail(dto.getEmail());
        c.setNotes(dto.getNotes());
        return c;
    }
}
