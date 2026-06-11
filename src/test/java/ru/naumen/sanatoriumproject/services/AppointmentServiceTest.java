package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.naumen.sanatoriumproject.dtos.AppointmentDTO;
import ru.naumen.sanatoriumproject.metrics.BusinessMetrics;
import ru.naumen.sanatoriumproject.models.*;
import ru.naumen.sanatoriumproject.repositories.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private ProcedureRepository procedureRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ShiftRepository shiftRepository;

    @Mock
    private BusinessMetrics businessMetrics;

    @InjectMocks
    private AppointmentService appointmentService;

    private Procedure testProcedure;
    private User testStudent;
    private User testDoctor;
    private Shift testShift;
    private Cabinet testCabinet;
    private Appointment testAppointment;

    @BeforeEach
    void setUp() {
        testCabinet = new Cabinet();
        testCabinet.setId(1L);
        testCabinet.setNumber("101");
        testCabinet.setName("Test Cabinet");

        testProcedure = new Procedure();
        testProcedure.setId(1L);
        testProcedure.setName("Massage");
        testProcedure.setCabinet(testCabinet);
        testProcedure.setDefaultDuration(30);

        testStudent = new User("student@test.com", "student", "pass", "Student User", LocalDate.of(1995, 5, 10));
        testStudent.setId(1L);

        testDoctor = new User("doctor@test.com", "doctor", "pass", "Doctor User", LocalDate.of(1980, 3, 15));
        testDoctor.setId(2L);

        testShift = new Shift();
        testShift.setId(1L);
        testShift.setName("Morning Shift");

        testAppointment = new Appointment();
        testAppointment.setId(1L);
        testAppointment.setProcedure(testProcedure);
        testAppointment.setStudent(testStudent);
        testAppointment.setDoctor(testDoctor);
        testAppointment.setShift(testShift);
        testAppointment.setAppointmentDate(LocalDate.of(2026, 4, 15));
        testAppointment.setNotes("First appointment");
    }

    @Test
    void createAppointment_shouldCreateSuccessfully() {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setProcedureId(1L);
        dto.setStudentId(1L);
        dto.setDoctorId(2L);
        dto.setShiftId(1L);
        dto.setAppointmentDate(LocalDate.of(2026, 4, 15));
        dto.setNotes("Test");

        when(procedureRepository.findById(1L)).thenReturn(Optional.of(testProcedure));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testStudent));
        when(userRepository.findById(2L)).thenReturn(Optional.of(testDoctor));
        when(shiftRepository.findById(1L)).thenReturn(Optional.of(testShift));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

        AppointmentDTO result = appointmentService.createAppointment(dto);

        assertThat(result.getProcedureId()).isEqualTo(1L);
        assertThat(result.getStudentId()).isEqualTo(1L);
        assertThat(result.getDoctorId()).isEqualTo(2L);
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    void createAppointment_shouldThrowWhenProcedureNotFound() {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setProcedureId(999L);

        when(procedureRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentService.createAppointment(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Procedure not found");
    }

    @Test
    void createAppointment_shouldThrowWhenStudentNotFound() {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setProcedureId(1L);
        dto.setStudentId(999L);

        when(procedureRepository.findById(1L)).thenReturn(Optional.of(testProcedure));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentService.createAppointment(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Student not found");
    }

    @Test
    void deleteAppointment_shouldCallRepository() {
        appointmentService.deleteAppointment(1L);
        verify(appointmentRepository).deleteById(1L);
    }

    @Test
    void updateAppointmentNote_shouldUpdateSuccessfully() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

        AppointmentDTO result = appointmentService.updateAppointmentNote(1L, "Updated note");

        assertThat(result.getNotes()).isEqualTo("Updated note");
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    void updateAppointmentNote_shouldThrowWhenNotFound() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentService.updateAppointmentNote(1L, "Note"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Appointment not found");
    }

    @Test
    void getAppointmentsByShift_shouldReturnList() {
        when(appointmentRepository.findByShiftId(1L)).thenReturn(List.of(testAppointment));

        List<AppointmentDTO> result = appointmentService.getAppointmentsByShift(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getShiftId()).isEqualTo(1L);
    }

    @Test
    void getAppointmentsByStudent_shouldReturnList() {
        when(appointmentRepository.findByStudentId(1L)).thenReturn(List.of(testAppointment));

        List<AppointmentDTO> result = appointmentService.getAppointmentsByStudent(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStudentId()).isEqualTo(1L);
    }

    @Test
    void getAppointmentsByShiftAndCabinet_shouldReturnList() {
        when(appointmentRepository.findByShiftIdAndProcedure_CabinetId(1L, 1L))
                .thenReturn(List.of(testAppointment));

        List<AppointmentDTO> result = appointmentService.getAppointmentsByShiftAndCabinet(1L, 1L);

        assertThat(result).hasSize(1);
    }

    @Test
    void getAppointmentsByStudentAndShift_shouldReturnList() {
        when(appointmentRepository.findByStudentIdAndShiftId(1L, 1L))
                .thenReturn(List.of(testAppointment));

        List<AppointmentDTO> result = appointmentService.getAppointmentsByStudentAndShift(1L, 1L);

        assertThat(result).hasSize(1);
    }
}
