package com.barberflow.barberflow.service;

import com.barberflow.barberflow.dto.ScheduleDTO;
import com.barberflow.barberflow.entity.Schedule;
import com.barberflow.barberflow.entity.User;
import com.barberflow.barberflow.mapper.ScheduleMapper;
import com.barberflow.barberflow.repository.ScheduleRepository;
import com.barberflow.barberflow.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
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

        if (!dto.getOpenTime().isBefore(dto.getCloseTime())) {
            throw new IllegalStateException("L'orario di apertura deve essere prima della chiusura");
        }

        Schedule schedule = scheduleRepository
                .findByBarberAndDayOfWeek(owner, dto.getDayOfWeek())
                .orElse(new Schedule());

        schedule.setBarber(owner);
        schedule.setDayOfWeek(dto.getDayOfWeek());
        schedule.setOpenTime(dto.getOpenTime());
        schedule.setCloseTime(dto.getCloseTime());

        // ✅ LOG
        System.out.println(">>> SAVING SCHEDULE: day=" + schedule.getDayOfWeek() + " barber_id=" + owner.getId());

        return scheduleMapper.toDTO(scheduleRepository.save(schedule));
    }

    public List<ScheduleDTO> getSchedules(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        return scheduleRepository.findByBarber(owner)
                .stream()
                .map(scheduleMapper::toDTO)
                .collect(Collectors.toList());
    }

    public void deleteSchedule(DayOfWeek dayOfWeek, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Utente non trovato"));

        Schedule schedule = scheduleRepository
                .findByBarberAndDayOfWeek(owner, dayOfWeek)
                .orElseThrow(() -> new IllegalStateException("Orario non trovato per questo giorno"));

        scheduleRepository.delete(schedule);
    }
}