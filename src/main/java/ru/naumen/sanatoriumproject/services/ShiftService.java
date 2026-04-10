package ru.naumen.sanatoriumproject.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.sanatoriumproject.dtos.ShiftDTO;
import ru.naumen.sanatoriumproject.models.Shift;
import ru.naumen.sanatoriumproject.repositories.ShiftRepository;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShiftService {
    private final ShiftRepository shiftRepository;

    public List<ShiftDTO> getAllShifts() {
        return shiftRepository.findAllByOrderByStartDateDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ShiftDTO> getActiveShifts() {
        return shiftRepository.findByIsActiveTrue().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ShiftDTO getShiftById(Long id) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Shift not found with id: " + id));
        return convertToDto(shift);
    }

    @Transactional
    public ShiftDTO createShift(ShiftDTO shiftDTO) {
        Shift shift = new Shift();
        shift.setName(shiftDTO.getName());
        shift.setStartDate(shiftDTO.getStartDate());
        shift.setEndDate(shiftDTO.getEndDate());
        shift.setActive(shiftDTO.isActive());
        shift.setDescription(shiftDTO.getDescription());

        Shift savedShift = shiftRepository.save(shift);
        return convertToDto(savedShift);
    }

    @Transactional
    public ShiftDTO updateShift(Long id, ShiftDTO shiftDTO) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Shift not found with id: " + id));

        shift.setName(shiftDTO.getName());
        shift.setStartDate(shiftDTO.getStartDate());
        shift.setEndDate(shiftDTO.getEndDate());
        shift.setActive(shiftDTO.isActive());
        shift.setDescription(shiftDTO.getDescription());

        Shift updatedShift = shiftRepository.save(shift);
        return convertToDto(updatedShift);
    }

    @Transactional
    public void deleteShift(Long id) {
        if (!shiftRepository.existsById(id)) {
            throw new NoSuchElementException("Shift not found with id: " + id);
        }
        shiftRepository.deleteById(id);
    }

    @Transactional
    public ShiftDTO updateShiftStatus(Long id, boolean isActive) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Shift not found with id: " + id));

        shift.setActive(isActive);
        Shift updatedShift = shiftRepository.save(shift);
        return convertToDto(updatedShift);
    }

    private ShiftDTO convertToDto(Shift shift) {
        ShiftDTO dto = new ShiftDTO();
        dto.setId(shift.getId());
        dto.setName(shift.getName());
        dto.setStartDate(shift.getStartDate());
        dto.setEndDate(shift.getEndDate());
        dto.setActive(shift.isActive());
        dto.setDescription(shift.getDescription());
        return dto;
    }
}
