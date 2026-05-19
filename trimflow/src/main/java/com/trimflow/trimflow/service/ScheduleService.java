package com.trimflow.trimflow.service;

import org.springframework.stereotype.Service;

import com.trimflow.trimflow.dto.ScheduleDTO;
import com.trimflow.trimflow.entity.Barber;
import com.trimflow.trimflow.entity.Schedule;
import com.trimflow.trimflow.mapper.ScheduleMapper;
import com.trimflow.trimflow.repository.BarberRepository;
import com.trimflow.trimflow.repository.ScheduleRepository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final BarberRepository barberRepository;
    private final ScheduleMapper scheduleMapper;

    public ScheduleService(ScheduleRepository scheduleRepository,
                           BarberRepository barberRepository,
                           ScheduleMapper scheduleMapper) {
        this.scheduleRepository = scheduleRepository;
        this.barberRepository = barberRepository;
        this.scheduleMapper = scheduleMapper;
    }

    public ScheduleDTO saveSchedule(ScheduleDTO dto, String shopEmail) {

        Barber barber = barberRepository.findById(dto.getBarberId())
                .orElseThrow(() -> new IllegalStateException("Barbiere non trovato"));

        if (!barber.getShop().getEmail().equals(shopEmail)) {
            throw new IllegalStateException("Non autorizzato");
        }

        if (!dto.getOpenTime().isBefore(dto.getCloseTime())) {
            throw new IllegalStateException("L'orario di apertura deve essere prima della chiusura");
        }

        Schedule schedule = scheduleRepository
                .findByBarberAndDayOfWeek(barber, dto.getDayOfWeek())
                .orElse(new Schedule());

        schedule.setBarber(barber);
        schedule.setDayOfWeek(dto.getDayOfWeek());
        schedule.setOpenTime(dto.getOpenTime());
        schedule.setCloseTime(dto.getCloseTime());

        return scheduleMapper.toDTO(scheduleRepository.save(schedule));
    }

    public List<ScheduleDTO> getSchedules(Long barberId, String shopEmail) {

        Barber barber = barberRepository.findById(barberId)
                .orElseThrow(() -> new IllegalStateException("Barbiere non trovato"));

        if (!barber.getShop().getEmail().equals(shopEmail)) {
            throw new IllegalStateException("Non autorizzato");
        }

        return scheduleRepository.findByBarber(barber)
                .stream()
                .map(scheduleMapper::toDTO)
                .collect(Collectors.toList());
    }

    public void deleteSchedule(Long barberId, DayOfWeek dayOfWeek, String shopEmail) {

        Barber barber = barberRepository.findById(barberId)
                .orElseThrow(() -> new IllegalStateException("Barbiere non trovato"));

        if (!barber.getShop().getEmail().equals(shopEmail)) {
            throw new IllegalStateException("Non autorizzato");
        }

        Schedule schedule = scheduleRepository
                .findByBarberAndDayOfWeek(barber, dayOfWeek)
                .orElseThrow(() -> new IllegalStateException("Orario non trovato per questo giorno"));

        scheduleRepository.delete(schedule);
    }
}