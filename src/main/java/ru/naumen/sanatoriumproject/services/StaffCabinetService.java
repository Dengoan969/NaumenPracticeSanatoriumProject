package ru.naumen.sanatoriumproject.services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ru.naumen.sanatoriumproject.dtos.StaffCabinetDTO;
import ru.naumen.sanatoriumproject.models.Cabinet;
import ru.naumen.sanatoriumproject.models.StaffCabinet;
import ru.naumen.sanatoriumproject.models.StaffCabinetId;
import ru.naumen.sanatoriumproject.models.User;
import ru.naumen.sanatoriumproject.repositories.CabinetRepository;
import ru.naumen.sanatoriumproject.repositories.StaffCabinetRepository;
import ru.naumen.sanatoriumproject.repositories.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffCabinetService {
    private final StaffCabinetRepository staffCabinetRepository;
    private final UserRepository userRepository;
    private final CabinetRepository cabinetRepository;

    @Transactional
    public StaffCabinetDTO assignCabinetToStaff(Long userId, Long cabinetId) {
        if (staffCabinetRepository.existsByUserIdAndCabinetId(userId, cabinetId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assignment already exists");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Cabinet cabinet = cabinetRepository.findById(cabinetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cabinet not found"));

        StaffCabinetId id = new StaffCabinetId();
        id.setUserId(userId);
        id.setCabinetId(cabinetId);

        StaffCabinet staffCabinet = new StaffCabinet();
        staffCabinet.setId(id);
        staffCabinet.setUser(user);
        staffCabinet.setCabinet(cabinet);

        StaffCabinet saved = staffCabinetRepository.save(staffCabinet);
        return convertToDto(saved);
    }

    @Transactional
    public void removeCabinetFromStaff(Long userId, Long cabinetId) {
        StaffCabinetId id = new StaffCabinetId();
        id.setUserId(userId);
        id.setCabinetId(cabinetId);

        if (!staffCabinetRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found");
        }
        staffCabinetRepository.deleteById(id);
    }

    public List<StaffCabinetDTO> getCabinetsByStaff(Long userId) {
        return staffCabinetRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<StaffCabinetDTO> getStaffByCabinet(Long cabinetId) {
        return staffCabinetRepository.findByCabinetId(cabinetId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<StaffCabinetDTO> getAllAssignments() {
        return staffCabinetRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private StaffCabinetDTO convertToDto(StaffCabinet staffCabinet) {
        StaffCabinetDTO dto = new StaffCabinetDTO();
        dto.setUserId(staffCabinet.getUser().getId());
        dto.setCabinetId(staffCabinet.getCabinet().getId());
        dto.setUserFullName(staffCabinet.getUser().getFullName());
        dto.setCabinetNumber(staffCabinet.getCabinet().getNumber());
        dto.setCabinetName(staffCabinet.getCabinet().getName());
        return dto;
    }
}