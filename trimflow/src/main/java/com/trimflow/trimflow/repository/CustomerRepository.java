package com.trimflow.trimflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.trimflow.trimflow.entity.Customer;
import com.trimflow.trimflow.entity.User;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer> findByOwner(User owner);
}
