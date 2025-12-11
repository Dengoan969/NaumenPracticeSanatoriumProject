package ru.naumen.sanatoriumproject.services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ru.naumen.sanatoriumproject.dtos.RegistrationDTO;
import ru.naumen.sanatoriumproject.models.*;
import ru.naumen.sanatoriumproject.repositories.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegistrationService {
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final ShiftRepository shiftRepository;

    @Transactional
    public RegistrationDTO registerUser(RegistrationDTO registrationDTO) {
        User user = userRepository.findById(registrationDTO.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Room room = registrationDTO.getRoomId() != null ?
                roomRepository.findById(registrationDTO.getRoomId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found")) :
                null;

        Shift shift = shiftRepository.findById(registrationDTO.getShiftId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shift not found"));

        if (room != null && registrationRepository.countByRoomIdAndShiftId(room.getId(), shift.getId()) >= room.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Room is full");
        }

        Optional<Registration> existingRegistration = registrationRepository
                .findByUserIdAndShiftId(user.getId(), shift.getId());

        if (existingRegistration.isPresent()) {
            Registration registration = existingRegistration.get();
            registration.setRoom(room);
            registration.setCheckInDate(registrationDTO.getCheckInDate());
            registration.setCheckOutDate(registrationDTO.getCheckOutDate());
            Registration updated = registrationRepository.save(registration);
            return convertToDTO(updated);
        } else {
            Registration registration = new Registration(user, room, shift);
            registration.setCheckInDate(registrationDTO.getCheckInDate());
            registration.setCheckOutDate(registrationDTO.getCheckOutDate());
            Registration saved = registrationRepository.save(registration);
            return convertToDTO(saved);
        }
    }

    public List<RegistrationDTO> getUserRegistrations(Long userId) {
        return registrationRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RegistrationDTO> getRegistrationsByShift(Long shiftId) {
        return registrationRepository.findByShiftIdWithDetails(shiftId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void unregisterUser(Long userId, Long shiftId) {
        if (!registrationRepository.existsByUserIdAndShiftId(userId, shiftId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Registration not found for user " + userId + " and shift " + shiftId);
        }
        registrationRepository.deleteByUserIdAndShiftId(userId, shiftId);
    }

    private RegistrationDTO convertToDTO(Registration registration) {
        RegistrationDTO dto = new RegistrationDTO();
        dto.setId(registration.getId());
        dto.setUserId(registration.getUser().getId());
        dto.setRoomId(registration.getRoom() != null ? registration.getRoom().getId() : null);
        dto.setShiftId(registration.getShift().getId());
        dto.setUserPhone(registration.getUser().getPhone());
        dto.setUserEmail(registration.getUser().getEmail());
        dto.setCheckInDate(registration.getCheckInDate());
        dto.setCheckOutDate(registration.getCheckOutDate());
        dto.setUserFullName(registration.getUser().getFullName());
        dto.setRoomNumber(registration.getRoom() != null ? registration.getRoom().getNumber() : null);
        dto.setShiftName(registration.getShift().getName());
        return dto;
    }
}