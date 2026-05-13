package com.barberflow.barberflow.service;

import com.barberflow.barberflow.dto.ScheduleDTO;
import com.barberflow.barberflow.entity.Schedule;
import com.barberflow.barberflow.entity.User;
import com.barberflow.barberflow.mapper.ScheduleMapper;
import com.barberflow.barberflow.repository.ScheduleRepository;
import com.barberflow.barberflow.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final ScheduleMapper scheduleMapper;

    public ScheduleService(ScheduleRepository scheduleRepository,
                           UserRepository userRepository,
                           ScheduleMapper scheduleMapper) {
        this.scheduleRepository = scheduleRepository;
        this.userRepository = userRepository;
        this.scheduleMapper = scheduleMapper;
    }

    public ScheduleDTO saveSchedule(ScheduleDTO dto, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        if (dto.getOpenTime().isAfter(dto.getCloseTime())) {
            throw new IllegalStateException("L'orario di apertura non può essere dopo la chiusura");
        }

        Schedule schedule = scheduleMapper.toEntity(dto);
        schedule.setBarber(owner);

        Schedule saved = scheduleRepository.save(schedule);
        return scheduleMapper.toDTO(saved);
    }

    public List<ScheduleDTO> getSchedules(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        return scheduleRepository.findByBarber(owner)
                .stream()
                .map(scheduleMapper::toDTO)
                .collect(Collectors.toList());
    }
}
