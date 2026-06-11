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
import ru.naumen.sanatoriumproject.dtos.ShiftDTO;
import ru.naumen.sanatoriumproject.repositories.RoleRepository;
import ru.naumen.sanatoriumproject.repositories.UserRepository;
import ru.naumen.sanatoriumproject.services.ShiftService;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ShiftController.class)
@AutoConfigureMockMvc(addFilters = false)
class ShiftControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ShiftService shiftService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private RoleRepository roleRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @Test
    @WithMockUser(roles = "USER")
    void getAllShifts_ReturnsList() throws Exception {
        ShiftDTO dto1 = new ShiftDTO();
        dto1.setId(1L);
        dto1.setName("Летняя смена");
        dto1.setStartDate(LocalDate.of(2026, 6, 1));
        dto1.setEndDate(LocalDate.of(2026, 6, 14));
        dto1.setActive(true);

        ShiftDTO dto2 = new ShiftDTO();
        dto2.setId(2L);
        dto2.setName("Осенняя смена");
        dto2.setStartDate(LocalDate.of(2026, 9, 1));
        dto2.setEndDate(LocalDate.of(2026, 9, 14));
        dto2.setActive(false);

        when(shiftService.getAllShifts()).thenReturn(Arrays.asList(dto1, dto2));

        mockMvc.perform(get("/api/shifts")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Летняя смена"))
                .andExpect(jsonPath("$[1].name").value("Осенняя смена"));

        verify(shiftService).getAllShifts();
    }

    @Test
    @WithMockUser(roles = "USER")
    void getActiveShifts_ReturnsActiveOnly() throws Exception {
        ShiftDTO dto = new ShiftDTO();
        dto.setId(1L);
        dto.setName("Активная смена");
        dto.setStartDate(LocalDate.of(2026, 6, 1));
        dto.setEndDate(LocalDate.of(2026, 6, 14));
        dto.setActive(true);

        when(shiftService.getActiveShifts()).thenReturn(Arrays.asList(dto));

        mockMvc.perform(get("/api/shifts/active")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Активная смена"));

        verify(shiftService).getActiveShifts();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createShift_ValidData_ReturnsOk() throws Exception {
        ShiftDTO createDTO = new ShiftDTO();
        createDTO.setName("Новая смена");
        createDTO.setStartDate(LocalDate.of(2026, 7, 1));
        createDTO.setEndDate(LocalDate.of(2026, 7, 14));
        createDTO.setActive(true);

        ShiftDTO created = new ShiftDTO();
        created.setId(1L);
        created.setName("Новая смена");
        created.setStartDate(LocalDate.of(2026, 7, 1));
        created.setEndDate(LocalDate.of(2026, 7, 14));
        created.setActive(true);

        when(shiftService.createShift(any(ShiftDTO.class))).thenReturn(created);

        mockMvc.perform(post("/api/shifts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Новая смена"));

        verify(shiftService).createShift(any(ShiftDTO.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateShiftStatus_Activate_ReturnsUpdated() throws Exception {
        ShiftDTO updated = new ShiftDTO();
        updated.setId(1L);
        updated.setName("Летняя смена");
        updated.setActive(true);

        when(shiftService.updateShiftStatus(eq(1L), eq(true))).thenReturn(updated);

        mockMvc.perform(patch("/api/shifts/1/status?isActive=true")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(true));

        verify(shiftService).updateShiftStatus(eq(1L), eq(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateShiftStatus_Deactivate_ReturnsUpdated() throws Exception {
        ShiftDTO updated = new ShiftDTO();
        updated.setId(1L);
        updated.setName("Летняя смена");
        updated.setActive(false);

        when(shiftService.updateShiftStatus(eq(1L), eq(false))).thenReturn(updated);

        mockMvc.perform(patch("/api/shifts/1/status?isActive=false")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));

        verify(shiftService).updateShiftStatus(eq(1L), eq(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteShift_ExistingId_ReturnsNoContent() throws Exception {
        doNothing().when(shiftService).deleteShift(1L);

        mockMvc.perform(delete("/api/shifts/1"))
                .andExpect(status().isNoContent());

        verify(shiftService).deleteShift(1L);
    }

    @Test
    @WithMockUser(roles = "USER")
    void getShiftById_ExistingId_ReturnsShift() throws Exception {
        ShiftDTO dto = new ShiftDTO();
        dto.setId(1L);
        dto.setName("Летняя смена");
        dto.setStartDate(LocalDate.of(2026, 6, 1));
        dto.setEndDate(LocalDate.of(2026, 6, 14));
        dto.setActive(true);

        when(shiftService.getShiftById(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/shifts/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Летняя смена"));

        verify(shiftService).getShiftById(1L);
    }

}
