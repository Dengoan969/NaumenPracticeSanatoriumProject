package ru.naumen.sanatoriumproject.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import ru.naumen.sanatoriumproject.dtos.AppointmentDTO;
import ru.naumen.sanatoriumproject.repositories.RoleRepository;
import ru.naumen.sanatoriumproject.repositories.UserRepository;
import ru.naumen.sanatoriumproject.services.AppointmentService;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AppointmentController.class)
@AutoConfigureMockMvc(addFilters = false)
class AppointmentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AppointmentService appointmentService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private RoleRepository roleRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @Test
    @WithMockUser(roles = "DOCTOR")
    void getAppointmentsByShift_ReturnsList() throws Exception {
        // Given
        AppointmentDTO dto1 = new AppointmentDTO();
        dto1.setId(1L);
        dto1.setStudentName("Иван Иванов");
        dto1.setProcedureName("Массаж");
        dto1.setAppointmentDate(LocalDate.of(2026, 6, 15));

        AppointmentDTO dto2 = new AppointmentDTO();
        dto2.setId(2L);
        dto2.setStudentName("Петр Петров");
        dto2.setProcedureName("УЗИ");
        dto2.setAppointmentDate(LocalDate.of(2026, 6, 15));

        List<AppointmentDTO> list = Arrays.asList(dto1, dto2);
        when(appointmentService.getAppointmentsByShift(1L)).thenReturn(list);

        // When & Then
        mockMvc.perform(get("/api/appointments/shift/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].studentName").value("Иван Иванов"))
                .andExpect(jsonPath("$[1].studentName").value("Петр Петров"));

        verify(appointmentService).getAppointmentsByShift(1L);
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void getAppointmentsByStudent_ReturnsList() throws Exception {
        // Given
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(1L);
        dto.setStudentName("Иван Иванов");
        dto.setProcedureName("Массаж");
        dto.setAppointmentDate(LocalDate.of(2026, 6, 15));

        when(appointmentService.getAppointmentsByStudent(1L)).thenReturn(Arrays.asList(dto));

        // When & Then
        mockMvc.perform(get("/api/appointments/student/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].studentName").value("Иван Иванов"));

        verify(appointmentService).getAppointmentsByStudent(1L);
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void createAppointment_ValidData_ReturnsOk() throws Exception {
        // Given
        AppointmentDTO createDTO = new AppointmentDTO();
        createDTO.setProcedureId(1L);
        createDTO.setStudentId(1L);
        createDTO.setDoctorId(2L);
        createDTO.setShiftId(1L);
        createDTO.setAppointmentDate(LocalDate.of(2026, 7, 1));

        AppointmentDTO created = new AppointmentDTO();
        created.setId(1L);
        created.setStudentName("Новый студент");
        created.setProcedureName("Массаж");
        created.setAppointmentDate(LocalDate.of(2026, 7, 1));

        when(appointmentService.createAppointment(any(AppointmentDTO.class))).thenReturn(created);

        // When & Then
        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));

        verify(appointmentService).createAppointment(any(AppointmentDTO.class));
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void updateAppointmentNote_ValidData_ReturnsUpdated() throws Exception {
        // Given
        AppointmentDTO updated = new AppointmentDTO();
        updated.setId(1L);
        updated.setStudentName("Иван Иванов");
        updated.setNotes("Обновленная заметка");

        when(appointmentService.updateAppointmentNote(eq(1L), anyString())).thenReturn(updated);

        Map<String, String> requestBody = Map.of("note", "Обновленная заметка");

        // When & Then
        mockMvc.perform(patch("/api/appointments/1/note")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notes").value("Обновленная заметка"));

        verify(appointmentService).updateAppointmentNote(eq(1L), anyString());
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void deleteAppointment_ExistingId_ReturnsNoContent() throws Exception {
        // Given
        doNothing().when(appointmentService).deleteAppointment(1L);

        // When & Then
        mockMvc.perform(delete("/api/appointments/1"))
                .andExpect(status().isNoContent());

        verify(appointmentService).deleteAppointment(1L);
    }

    @Test
    @WithMockUser(roles = "NURSE")
    void getAppointmentsByShiftAndCabinet_ReturnsFilteredList() throws Exception {
        // Given
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(1L);
        dto.setStudentName("Иван Иванов");
        dto.setCabinetNumber("101");
        dto.setAppointmentDate(LocalDate.of(2026, 6, 15));

        when(appointmentService.getAppointmentsByShiftAndCabinet(1L, 1L))
                .thenReturn(Arrays.asList(dto));

        // When & Then
        mockMvc.perform(get("/api/appointments/shift/1/cabinet/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].cabinetNumber").value("101"));

        verify(appointmentService).getAppointmentsByShiftAndCabinet(1L, 1L);
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void getAppointmentsByStudentAndShift_ReturnsFilteredList() throws Exception {
        // Given
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(1L);
        dto.setStudentName("Иван Иванов");
        dto.setProcedureName("Массаж");
        dto.setAppointmentDate(LocalDate.of(2026, 6, 15));

        when(appointmentService.getAppointmentsByStudentAndShift(1L, 1L))
                .thenReturn(Arrays.asList(dto));

        // When & Then
        mockMvc.perform(get("/api/appointments/student/1/shift/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].studentName").value("Иван Иванов"));

        verify(appointmentService).getAppointmentsByStudentAndShift(1L, 1L);
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void getAppointmentsByShift_NoAppointments_ReturnsEmptyList() throws Exception {
        // Given
        when(appointmentService.getAppointmentsByShift(999L)).thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/api/appointments/shift/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(appointmentService).getAppointmentsByShift(999L);
    }
}
