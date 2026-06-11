package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.naumen.sanatoriumproject.dtos.ShiftDTO;
import ru.naumen.sanatoriumproject.models.Shift;
import ru.naumen.sanatoriumproject.repositories.ShiftRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShiftServiceTest {

    @Mock
    private ShiftRepository shiftRepository;

    @InjectMocks
    private ShiftService shiftService;

    private Shift testShift;
    private ShiftDTO testShiftDTO;

    @BeforeEach
    void setUp() {
        testShift = new Shift();
        testShift.setId(1L);
        testShift.setName("Summer 2026");
        testShift.setStartDate(LocalDate.of(2026, 6, 1));
        testShift.setEndDate(LocalDate.of(2026, 6, 14));
        testShift.setActive(true);
        testShift.setDescription("Summer session");

        testShiftDTO = new ShiftDTO();
        testShiftDTO.setName("Summer 2026");
        testShiftDTO.setStartDate(LocalDate.of(2026, 6, 1));
        testShiftDTO.setEndDate(LocalDate.of(2026, 6, 14));
        testShiftDTO.setActive(true);
        testShiftDTO.setDescription("Summer session");
    }

    @Test
    void createShift_shouldCreateSuccessfully() {
        when(shiftRepository.save(any(Shift.class))).thenReturn(testShift);

        ShiftDTO result = shiftService.createShift(testShiftDTO);

        assertThat(result.getName()).isEqualTo("Summer 2026");
        assertThat(result.isActive()).isTrue();
        verify(shiftRepository).save(any(Shift.class));
    }

    @Test
    void getShiftById_shouldReturnShift() {
        when(shiftRepository.findById(1L)).thenReturn(Optional.of(testShift));

        ShiftDTO result = shiftService.getShiftById(1L);

        assertThat(result.getName()).isEqualTo("Summer 2026");
    }

    @Test
    void getShiftById_shouldThrowWhenNotFound() {
        when(shiftRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> shiftService.getShiftById(999L))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Shift not found");
    }

    @Test
    void getAllShifts_shouldReturnSortedList() {
        when(shiftRepository.findAllByOrderByStartDateDesc()).thenReturn(List.of(testShift));

        List<ShiftDTO> result = shiftService.getAllShifts();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Summer 2026");
    }

    @Test
    void getActiveShifts_shouldReturnOnlyActive() {
        when(shiftRepository.findByIsActiveTrue()).thenReturn(List.of(testShift));

        List<ShiftDTO> result = shiftService.getActiveShifts();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isActive()).isTrue();
    }

    @Test
    void updateShift_shouldUpdateSuccessfully() {
        when(shiftRepository.findById(1L)).thenReturn(Optional.of(testShift));
        when(shiftRepository.save(any(Shift.class))).thenReturn(testShift);

        testShiftDTO.setName("Updated Shift");
        ShiftDTO result = shiftService.updateShift(1L, testShiftDTO);

        assertThat(result.getName()).isEqualTo("Updated Shift");
        verify(shiftRepository).save(any(Shift.class));
    }

    @Test
    void updateShift_shouldThrowWhenNotFound() {
        when(shiftRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> shiftService.updateShift(1L, testShiftDTO))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Shift not found");
    }

    @Test
    void deleteShift_shouldDeleteSuccessfully() {
        when(shiftRepository.existsById(1L)).thenReturn(true);

        shiftService.deleteShift(1L);

        verify(shiftRepository).deleteById(1L);
    }

    @Test
    void deleteShift_shouldThrowWhenNotFound() {
        when(shiftRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> shiftService.deleteShift(999L))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Shift not found");
    }

    @Test
    void updateShiftStatus_shouldUpdateSuccessfully() {
        when(shiftRepository.findById(1L)).thenReturn(Optional.of(testShift));
        when(shiftRepository.save(any(Shift.class))).thenReturn(testShift);

        ShiftDTO result = shiftService.updateShiftStatus(1L, false);

        assertThat(result.isActive()).isFalse();
        verify(shiftRepository).save(any(Shift.class));
    }
}
