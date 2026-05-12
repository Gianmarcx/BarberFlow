package com.barberflow.barberflow.repository;

import com.barberflow.barberflow.entity.Customer;
import com.barberflow.barberflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer> findByOwner(User owner);
}
