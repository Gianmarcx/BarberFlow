package com.barberflow.barberflow.service;

import com.barberflow.barberflow.dto.ServiceDTO;
import com.barberflow.barberflow.entity.ServiceEntity;
import com.barberflow.barberflow.entity.User;
import com.barberflow.barberflow.mapper.ServiceMapper;
import com.barberflow.barberflow.repository.ServiceRepository;
import com.barberflow.barberflow.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final ServiceMapper serviceMapper;

    public ServiceService(ServiceRepository serviceRepository,
                          UserRepository userRepository,
                          ServiceMapper serviceMapper) {
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
        this.serviceMapper = serviceMapper;
    }

    public ServiceDTO create(ServiceDTO dto, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        ServiceEntity service = serviceMapper.toEntity(dto);
        service.setOwner(owner);                        // ✅ era setBarber()

        return serviceMapper.toDTO(serviceRepository.save(service));
    }

    public List<ServiceDTO> getAll(String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        return serviceRepository.findByOwner(owner)     // ✅ era findByBarber()
                .stream()
                .map(serviceMapper::toDTO)
                .collect(Collectors.toList());
    }

    public ServiceDTO update(Long id, ServiceDTO dto, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Servizio non trovato"));

        if (!service.getOwner().getEmail().equals(owner.getEmail())) {  // ✅ era getBarber()
            throw new IllegalStateException("Non autorizzato");
        }

        service.setName(dto.getName());
        service.setDescription(dto.getDescription());   // ✅ aggiunto
        service.setDuration(dto.getDuration());
        service.setPrice(dto.getPrice());

        return serviceMapper.toDTO(serviceRepository.save(service));
    }

    public void delete(Long id, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Servizio non trovato"));

        if (!service.getOwner().getEmail().equals(owner.getEmail())) {  // ✅ era getBarber()
            throw new IllegalStateException("Non autorizzato");
        }

        serviceRepository.delete(service);
    }
}