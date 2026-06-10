package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import ru.naumen.sanatoriumproject.dtos.ShiftDTO;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Sql(scripts = "/sql/cleanup.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@Sql(scripts = "/sql/test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class ShiftServiceIntegrationTest {

    @Autowired
    private ShiftService shiftService;

    @Test
    void getAllShifts_shouldReturnAllShifts() {
        var shifts = shiftService.getAllShifts();
        assertNotNull(shifts);
        assertEquals(5, shifts.size());
    }

    @Test
    void getActiveShifts_shouldReturnOnlyActiveShifts() {
        var shifts = shiftService.getActiveShifts();
        assertNotNull(shifts);
        assertEquals(3, shifts.size());
        shifts.forEach(s -> assertTrue(s.isActive()));
    }

    @Test
    void getShiftById_shouldReturnExistingShift() {
        ShiftDTO shift = shiftService.getShiftById(1L);
        assertNotNull(shift);
        assertEquals("Summer 2025 Shift 1", shift.getName());
    }

    @Test
    void getShiftById_withNonExistentId_shouldThrowException() {
        assertThrows(Exception.class, () -> shiftService.getShiftById(999L));
    }

    @Test
    void createShift_shouldPersistAndReturnShift() {
        ShiftDTO dto = new ShiftDTO();
        dto.setName("Test Shift");
        dto.setStartDate(LocalDate.of(2025, 12, 1));
        dto.setEndDate(LocalDate.of(2025, 12, 21));
        dto.setActive(true);
        dto.setDescription("Test shift description");

        ShiftDTO created = shiftService.createShift(dto);
        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals("Test Shift", created.getName());
    }

    @Test
    void updateShift_shouldModifyExistingShift() {
        ShiftDTO dto = new ShiftDTO();
        dto.setName("Updated Shift Name");
        dto.setStartDate(LocalDate.of(2025, 6, 1));
        dto.setEndDate(LocalDate.of(2025, 6, 21));
        dto.setActive(true);
        dto.setDescription("Updated description");

        ShiftDTO updated = shiftService.updateShift(1L, dto);
        assertNotNull(updated);
        assertEquals("Updated Shift Name", updated.getName());
    }

    @Test
    void updateShiftStatus_shouldToggleActiveStatus() {
        ShiftDTO updated = shiftService.updateShiftStatus(1L, false);
        assertNotNull(updated);
        assertFalse(updated.isActive());
    }

    @Test
    void deleteShift_shouldRemoveExistingShift() {
        // Create a new shift without registrations first, then delete it
        ShiftDTO dto = new ShiftDTO();
        dto.setName("Temp Shift for Delete");
        dto.setStartDate(LocalDate.of(2026, 1, 1));
        dto.setEndDate(LocalDate.of(2026, 1, 21));
        dto.setActive(false);
        dto.setDescription("Temporary shift");
        ShiftDTO created = shiftService.createShift(dto);

        assertDoesNotThrow(() -> shiftService.deleteShift(created.getId()));
    }

    @Test
    void deleteShift_withNonExistentId_shouldThrowException() {
        assertThrows(Exception.class, () -> shiftService.deleteShift(999L));
    }

    @Test
    void deleteShift_withActiveRegistrations_shouldThrowException() {
        assertThrows(Exception.class, () -> shiftService.deleteShift(1L));
    }
}