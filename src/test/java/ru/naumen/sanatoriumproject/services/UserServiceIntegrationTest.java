package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import ru.naumen.sanatoriumproject.dtos.UserDTO;
import ru.naumen.sanatoriumproject.models.ERole;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Sql(scripts = "/sql/cleanup.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@Sql(scripts = "/sql/test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class UserServiceIntegrationTest {

    @Autowired
    private UserService userService;

    @Test
    void getRegularUsers_shouldReturnAllRegularUsers() {
        var users = userService.getRegularUsers();
        assertNotNull(users);
        assertFalse(users.isEmpty());
        assertTrue(users.size() >= 6);
    }

    @Test
    void createUser_shouldPersistAndReturnUser() {
        UserDTO dto = new UserDTO();
        dto.setEmail("newuser@test.com");
        dto.setLogin("newuser");
        dto.setPassword("password123");
        dto.setFullName("New User");
        dto.setBirthDate(java.time.LocalDate.of(2000, 1, 1));

        UserDTO created = userService.createUser(dto);
        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals("newuser@test.com", created.getEmail());
        assertEquals("newuser", created.getLogin());
    }

    @Test
    void createUser_withDuplicateEmail_shouldThrowException() {
        UserDTO dto = new UserDTO();
        dto.setEmail("user1@test.com"); // exists in test-data.sql
        dto.setLogin("unique_login");
        dto.setPassword("password123");
        dto.setFullName("Duplicate Email User");
        dto.setBirthDate(java.time.LocalDate.of(2000, 1, 1));

        assertThrows(Exception.class, () -> userService.createUser(dto));
    }

    @Test
    void createUser_withDuplicateLogin_shouldThrowException() {
        UserDTO dto = new UserDTO();
        dto.setEmail("unique@test.com");
        dto.setLogin("user1"); // exists in test-data.sql
        dto.setPassword("password123");
        dto.setFullName("Duplicate Login User");
        dto.setBirthDate(java.time.LocalDate.of(2000, 1, 1));

        assertThrows(Exception.class, () -> userService.createUser(dto));
    }

    @Test
    void createUserWithRoles_shouldCreateUserWithSpecifiedRoles() {
        UserDTO dto = new UserDTO();
        dto.setEmail("doctor_new@test.com");
        dto.setLogin("doctor_new");
        dto.setPassword("password123");
        dto.setFullName("New Doctor");
        dto.setBirthDate(java.time.LocalDate.of(1980, 5, 15));

        UserDTO created = userService.createUserWithRoles(dto, Set.of(ERole.ROLE_USER));
        assertNotNull(created);
        assertNotNull(created.getId());
    }

    @Test
    void deleteUser_shouldRemoveExistingUser() {
        // Create a user with no dependencies first, then delete it
        UserDTO dto = new UserDTO();
        dto.setEmail("delete_me@test.com");
        dto.setLogin("delete_me");
        dto.setPassword("password123");
        dto.setFullName("Delete Me");
        dto.setBirthDate(java.time.LocalDate.of(2000, 1, 1));
        UserDTO created = userService.createUser(dto);

        assertDoesNotThrow(() -> userService.deleteUser(created.getId()));
    }

    @Test
    void deleteUser_withNonExistentId_shouldThrowException() {
        assertThrows(Exception.class, () -> userService.deleteUser(999L));
    }

    @Test
    void updateUser_shouldModifyExistingUser() {
        UserDTO dto = new UserDTO();
        dto.setEmail("updated@test.com");
        dto.setLogin("updated_login");
        dto.setPassword("newpassword");
        dto.setFullName("Updated User");
        dto.setBirthDate(java.time.LocalDate.of(1990, 1, 1));

        UserDTO updated = userService.updateUser(1L, dto);
        assertNotNull(updated);
        assertEquals("updated@test.com", updated.getEmail());
    }

    @Test
    void updateUser_withNonExistentId_shouldThrowException() {
        UserDTO dto = new UserDTO();
        dto.setEmail("nonexist@test.com");
        dto.setLogin("nonexist");
        dto.setPassword("password");
        dto.setFullName("No One");
        dto.setBirthDate(java.time.LocalDate.of(1990, 1, 1));

        assertThrows(Exception.class, () -> userService.updateUser(999L, dto));
    }

    @Test
    void hasAdminRole_shouldReturnTrueForAdmin() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "admin",
                        "password",
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
                )
        );
        try {
            assertTrue(userService.hasAdminRole());
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}