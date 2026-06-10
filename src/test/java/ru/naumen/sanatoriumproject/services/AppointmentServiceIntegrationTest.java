package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import ru.naumen.sanatoriumproject.dtos.AppointmentDTO;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Sql(scripts = "/sql/cleanup.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@Sql(scripts = "/sql/test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class AppointmentServiceIntegrationTest {

    @Autowired
    private AppointmentService appointmentService;

    @Test
    void getAppointmentsByShift_shouldReturnAppointmentsForGivenShift() {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByShift(1L);
        assertNotNull(appointments);
        assertEquals(4, appointments.size());
        appointments.forEach(a -> assertEquals(1L, a.getShiftId()));
    }

    @Test
    void getAppointmentsByShift_withNonExistentShift_shouldReturnEmptyList() {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByShift(999L);
        assertNotNull(appointments);
        assertTrue(appointments.isEmpty());
    }

    @Test
    void getAppointmentsByStudent_shouldReturnAppointmentsForGivenStudent() {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByStudent(2L);
        assertNotNull(appointments);
        assertEquals(2, appointments.size());
        appointments.forEach(a -> assertEquals(2L, a.getStudentId()));
    }

    @Test
    void getAppointmentsByStudent_withNonExistentStudent_shouldReturnEmptyList() {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByStudent(999L);
        assertNotNull(appointments);
        assertTrue(appointments.isEmpty());
    }

    @Test
    void createAppointment_shouldPersistAndReturnAppointment() {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setProcedureId(1L);
        dto.setStudentId(2L);
        dto.setDoctorId(4L);
        dto.setShiftId(1L);
        dto.setAppointmentDate(LocalDate.of(2025, 6, 5));
        dto.setNotes("Test appointment");

        AppointmentDTO created = appointmentService.createAppointment(dto);
        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals(2L, created.getStudentId());
        assertEquals("Test appointment", created.getNotes());
    }

    @Test
    void createAppointment_withNonExistentProcedure_shouldThrowException() {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setProcedureId(999L);
        dto.setStudentId(2L);
        dto.setDoctorId(4L);
        dto.setShiftId(1L);
        dto.setAppointmentDate(LocalDate.of(2025, 6, 5));

        assertThrows(Exception.class, () -> appointmentService.createAppointment(dto));
    }

    @Test
    void updateAppointmentNote_shouldModifyExistingAppointment() {
        AppointmentDTO updated = appointmentService.updateAppointmentNote(1L, "Updated note");
        assertNotNull(updated);
        assertEquals("Updated note", updated.getNotes());
    }

    @Test
    void updateAppointmentNote_withNonExistentId_shouldThrowException() {
        assertThrows(Exception.class, () -> appointmentService.updateAppointmentNote(999L, "Note"));
    }

    @Test
    void getAppointmentsByShiftAndCabinet_shouldReturnFilteredAppointments() {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByShiftAndCabinet(1L, 1L);
        assertNotNull(appointments);
        assertFalse(appointments.isEmpty());
        appointments.forEach(a -> {
            assertEquals(1L, a.getShiftId());
        });
    }

    @Test
    void getAppointmentsByStudentAndShift_shouldReturnFilteredAppointments() {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByStudentAndShift(2L, 1L);
        assertNotNull(appointments);
        assertEquals(2, appointments.size());
        appointments.forEach(a -> {
            assertEquals(2L, a.getStudentId());
            assertEquals(1L, a.getShiftId());
        });
    }

    @Test
    void deleteAppointment_shouldRemoveExistingAppointment() {
        // Create a new appointment without completions first, then delete it
        AppointmentDTO dto = new AppointmentDTO();
        dto.setProcedureId(8L); // procedure 8 has no completions
        dto.setStudentId(2L);
        dto.setDoctorId(4L);
        dto.setShiftId(1L);
        dto.setAppointmentDate(LocalDate.of(2025, 6, 5));
        dto.setNotes("Temp appointment for delete test");
        AppointmentDTO created = appointmentService.createAppointment(dto);

        assertDoesNotThrow(() -> appointmentService.deleteAppointment(created.getId()));
    }
}