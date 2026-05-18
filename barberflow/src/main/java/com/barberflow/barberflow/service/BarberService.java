package com.barberflow.barberflow.service;

import com.barberflow.barberflow.dto.BarberDTO;
import com.barberflow.barberflow.entity.Barber;
import com.barberflow.barberflow.entity.User;
import com.barberflow.barberflow.mapper.BarberMapper;
import com.barberflow.barberflow.repository.BarberRepository;
import com.barberflow.barberflow.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BarberService {

    private final BarberRepository barberRepository;
    private final UserRepository userRepository;
    private final BarberMapper barberMapper;

    public BarberService(BarberRepository barberRepository,
                         UserRepository userRepository,
                         BarberMapper barberMapper) {
        this.barberRepository = barberRepository;
        this.userRepository = userRepository;
        this.barberMapper = barberMapper;
    }

    public BarberDTO create(BarberDTO dto, String shopEmail) {
        User shop = userRepository.findByEmail(shopEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        Barber barber = barberMapper.toEntity(dto);
        barber.setShop(shop);

        return barberMapper.toDTO(barberRepository.save(barber));
    }

    public List<BarberDTO> getAll(String shopEmail) {
        User shop = userRepository.findByEmail(shopEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        return barberRepository.findByShop(shop)
                .stream()
                .map(barberMapper::toDTO)
                .collect(Collectors.toList());
    }

    public BarberDTO update(Long id, BarberDTO dto, String shopEmail) {
        Barber barber = barberRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Barbiere non trovato"));

        if (!barber.getShop().getEmail().equals(shopEmail)) {
            throw new IllegalStateException("Non autorizzato");
        }

        barber.setName(dto.getName());
        barber.setSpecialization(dto.getSpecialization());

        return barberMapper.toDTO(barberRepository.save(barber));
    }

    public void delete(Long id, String shopEmail) {
        Barber barber = barberRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Barbiere non trovato"));

        if (!barber.getShop().getEmail().equals(shopEmail)) {
            throw new IllegalStateException("Non autorizzato");
        }

        barberRepository.delete(barber);
    }
}