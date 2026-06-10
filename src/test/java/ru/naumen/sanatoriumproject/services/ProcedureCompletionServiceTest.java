package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import ru.naumen.sanatoriumproject.dtos.ProcedureCompletionDTO;
import ru.naumen.sanatoriumproject.models.*;
import ru.naumen.sanatoriumproject.repositories.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProcedureCompletionServiceTest {

    @Mock
    private ProcedureCompletionRepository completionRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private StaffCabinetRepository staffCabinetRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProcedureCompletionService procedureCompletionService;

    private Appointment testAppointment;
    private User testUser;
    private User testStudent;
    private User testDoctor;
    private Procedure testProcedure;
    private Cabinet testCabinet;
    private Shift testShift;
    private ProcedureCompletion testCompletion;

    @BeforeEach
    void setUp() {
        testCabinet = new Cabinet();
        testCabinet.setId(1L);
        testCabinet.setNumber("101");
        testCabinet.setName("Кабинет массажа");

        testProcedure = new Procedure();
        testProcedure.setId(1L);
        testProcedure.setName("Массаж");
        testProcedure.setDefaultDuration(60);
        testProcedure.setCabinet(testCabinet);

        testStudent = new User("patient@test.com", "patient1", "pass", "Иванов Иван", LocalDate.of(1995, 5, 10));
        testStudent.setId(1L);

        testDoctor = new User("doctor@test.com", "doctor1", "pass", "Петров Пётр", LocalDate.of(1980, 3, 15));
        testDoctor.setId(2L);

        testUser = new User("nurse@test.com", "nurse1", "pass", "Сидорова Анна", LocalDate.of(1985, 7, 20));
        testUser.setId(3L);

        testShift = new Shift();
        testShift.setId(1L);
        testShift.setName("Morning Shift");
        testShift.setStartDate(LocalDate.of(2026, 6, 1));
        testShift.setEndDate(LocalDate.of(2026, 6, 14));
        testShift.setActive(true);

        testAppointment = new Appointment();
        testAppointment.setId(1L);
        testAppointment.setProcedure(testProcedure);
        testAppointment.setStudent(testStudent);
        testAppointment.setDoctor(testDoctor);
        testAppointment.setShift(testShift);
        testAppointment.setAppointmentDate(LocalDate.of(2026, 4, 10));

        testCompletion = new ProcedureCompletion();
        testCompletion.setId(1L);
        testCompletion.setAppointment(testAppointment);
        testCompletion.setCompletedBy(testUser);
        testCompletion.setCompletedAt(LocalDateTime.now());
        testCompletion.setNotes("Тестовые заметки");
    }

    @Test
    void markProcedureAsCompleted_ValidData_Success() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
        when(userRepository.findById(3L)).thenReturn(Optional.of(testUser));
        when(staffCabinetRepository.existsByUserIdAndCabinetId(3L, 1L)).thenReturn(true);
        when(completionRepository.save(any(ProcedureCompletion.class))).thenReturn(testCompletion);

        ProcedureCompletionDTO result = procedureCompletionService.markProcedureAsCompleted(
                1L, 3L, "Тестовые заметки");

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getAppointmentId()).isEqualTo(1L);
        assertThat(result.getCompletedById()).isEqualTo(3L);
        assertThat(result.getCompletedByName()).isEqualTo("Сидорова Анна");
        assertThat(result.getNotes()).isEqualTo("Тестовые заметки");
        assertThat(result.getProcedureName()).isEqualTo("Массаж");
        assertThat(result.getStudentName()).isEqualTo("Иванов Иван");
        assertThat(result.getCabinetNumber()).isEqualTo("101");
    }

    @Test
    void markProcedureAsCompleted_AppointmentNotFound_ThrowsException() {
        when(appointmentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> procedureCompletionService.markProcedureAsCompleted(999L, 3L, "notes"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Appointment not found");
    }

    @Test
    void markProcedureAsCompleted_UserNotFound_ThrowsException() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> procedureCompletionService.markProcedureAsCompleted(1L, 999L, "notes"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void markProcedureAsCompleted_NoCabinetAccess_ThrowsForbidden() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
        when(userRepository.findById(4L)).thenReturn(Optional.of(
                new User("noaccess@test.com", "noaccess", "pass", "No Access", LocalDate.of(1990, 1, 1))));
        when(staffCabinetRepository.existsByUserIdAndCabinetId(4L, 1L)).thenReturn(false);

        assertThatThrownBy(() -> procedureCompletionService.markProcedureAsCompleted(1L, 4L, "notes"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("User doesn't have access to this cabinet");
    }

    @Test
    void getCompletionsByAppointment_ReturnsList() {
        when(completionRepository.findByAppointmentId(1L)).thenReturn(List.of(testCompletion));

        List<ProcedureCompletionDTO> result = procedureCompletionService.getCompletionsByAppointment(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAppointmentId()).isEqualTo(1L);
    }

    @Test
    void getCompletionsByAppointment_EmptyList() {
        when(completionRepository.findByAppointmentId(999L)).thenReturn(List.of());

        List<ProcedureCompletionDTO> result = procedureCompletionService.getCompletionsByAppointment(999L);

        assertThat(result).isEmpty();
    }

    @Test
    void getCompletionsByUser_ReturnsList() {
        when(completionRepository.findByCompletedById(3L)).thenReturn(List.of(testCompletion));

        List<ProcedureCompletionDTO> result = procedureCompletionService.getCompletionsByUser(3L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCompletedById()).isEqualTo(3L);
    }

    @Test
    void getCompletionsByUser_EmptyList() {
        when(completionRepository.findByCompletedById(999L)).thenReturn(List.of());

        List<ProcedureCompletionDTO> result = procedureCompletionService.getCompletionsByUser(999L);

        assertThat(result).isEmpty();
    }

    @Test
    void getCompletionsByUserAndShift_ReturnsList() {
        when(completionRepository.findByAppointment_StudentIdAndAppointment_ShiftId(1L, 1L))
                .thenReturn(List.of(testCompletion));

        List<ProcedureCompletionDTO> result = procedureCompletionService.getCompletionsByUserAndShift(1L, 1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStudentName()).isEqualTo("Иванов Иван");
    }

    @Test
    void getCompletionsByUserAndShift_EmptyList() {
        when(completionRepository.findByAppointment_StudentIdAndAppointment_ShiftId(999L, 999L))
                .thenReturn(List.of());

        List<ProcedureCompletionDTO> result = procedureCompletionService.getCompletionsByUserAndShift(999L, 999L);

        assertThat(result).isEmpty();
    }
}