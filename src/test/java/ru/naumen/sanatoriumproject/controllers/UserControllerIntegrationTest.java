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
import ru.naumen.sanatoriumproject.dtos.UserDTO;
import ru.naumen.sanatoriumproject.dtos.UserWithRolesDTO;
import ru.naumen.sanatoriumproject.models.ERole;
import ru.naumen.sanatoriumproject.models.Role;
import ru.naumen.sanatoriumproject.repositories.RegistrationRepository;
import ru.naumen.sanatoriumproject.repositories.RoleRepository;
import ru.naumen.sanatoriumproject.repositories.UserRepository;
import ru.naumen.sanatoriumproject.services.AppointmentService;
import ru.naumen.sanatoriumproject.services.ProcedureCompletionService;
import ru.naumen.sanatoriumproject.services.UserService;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private UserService userService;

    @MockBean
    private RegistrationRepository registrationRepository;

    @MockBean
    private AppointmentService appointmentService;

    @MockBean
    private ProcedureCompletionService procedureCompletionService;

    @MockBean
    private RoleRepository roleRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @Test
    @WithMockUser(roles = "REGISTRAR")
    void getRegularUsers_ReturnsList() throws Exception {
        UserDTO dto1 = new UserDTO();
        dto1.setId(1L);
        dto1.setLogin("user1");
        dto1.setEmail("user1@example.com");
        dto1.setFullName("Пользователь 1");

        UserDTO dto2 = new UserDTO();
        dto2.setId(2L);
        dto2.setLogin("user2");
        dto2.setEmail("user2@example.com");
        dto2.setFullName("Пользователь 2");

        when(userService.getRegularUsers()).thenReturn(Arrays.asList(dto1, dto2));

        mockMvc.perform(get("/api/users/regular")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].login").value("user1"))
                .andExpect(jsonPath("$[1].login").value("user2"));

        verify(userService).getRegularUsers();
    }

    @Test
    @WithMockUser(roles = "REGISTRAR")
    void createUser_ValidData_ReturnsOk() throws Exception {
        UserWithRolesDTO createDTO = new UserWithRolesDTO();
        createDTO.setLogin("newuser");
        createDTO.setEmail("new@example.com");
        createDTO.setPassword("password123");
        createDTO.setFullName("New User");
        createDTO.setBirthDate(LocalDate.of(1990, 1, 1));

        UserDTO created = new UserDTO();
        created.setId(1L);
        created.setLogin("newuser");
        created.setEmail("new@example.com");
        created.setFullName("New User");

        when(userService.createUser(any(UserDTO.class))).thenReturn(created);

        mockMvc.perform(post("/api/users")
                        .param("withRoles", "false")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.login").value("newuser"));

        verify(userService).createUser(any(UserDTO.class));
    }

    @Test
    @WithMockUser(roles = "REGISTRAR")
    void updateUser_ValidData_ReturnsUpdated() throws Exception {
        UserWithRolesDTO updateDTO = new UserWithRolesDTO();
        updateDTO.setFullName("Updated Name");
        updateDTO.setPhone("+79999999999");

        UserDTO updated = new UserDTO();
        updated.setId(1L);
        updated.setLogin("testuser");
        updated.setFullName("Updated Name");

        when(userService.updateUser(eq(1L), any(UserDTO.class))).thenReturn(updated);

        mockMvc.perform(put("/api/users/1")
                        .param("updateRoles", "false")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Name"));

        verify(userService).updateUser(eq(1L), any(UserDTO.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteUser_ExistingId_ReturnsNoContent() throws Exception {
        doNothing().when(userService).deleteUser(1L);

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isNoContent());

        verify(userService).deleteUser(1L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createUserWithRoles_ValidData_ReturnsOk() throws Exception {
        UserWithRolesDTO createDTO = new UserWithRolesDTO();
        createDTO.setLogin("adminuser");
        createDTO.setEmail("admin@example.com");
        createDTO.setPassword("adminpass");
        createDTO.setFullName("Admin User");
        createDTO.setRoles(Set.of("ROLE_ADMIN"));

        UserDTO created = new UserDTO();
        created.setId(1L);
        created.setLogin("adminuser");
        created.setEmail("admin@example.com");

        when(userService.hasAdminRole()).thenReturn(true);
        when(userService.createUserWithRoles(any(UserDTO.class), anySet())).thenReturn(created);

        mockMvc.perform(post("/api/users")
                        .param("withRoles", "true")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.login").value("adminuser"));

        verify(userService).createUserWithRoles(any(UserDTO.class), anySet());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllRoles_ReturnsRolesList() throws Exception {
        Role userRole = new Role();
        userRole.setId(1);
        userRole.setName(ERole.ROLE_USER);

        Role adminRole = new Role();
        adminRole.setId(2);
        adminRole.setName(ERole.ROLE_ADMIN);

        when(userService.getAllRoles()).thenReturn(Arrays.asList(userRole, adminRole));

        mockMvc.perform(get("/api/users/roles")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        verify(userService).getAllRoles();
    }
}
