package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import ru.naumen.sanatoriumproject.dtos.UserDTO;
import ru.naumen.sanatoriumproject.models.ERole;
import ru.naumen.sanatoriumproject.models.Role;
import ru.naumen.sanatoriumproject.models.User;
import ru.naumen.sanatoriumproject.repositories.RoleRepository;
import ru.naumen.sanatoriumproject.repositories.UserRepository;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private UserDTO testUserDTO;
    private Role userRole;

    @BeforeEach
    void setUp() {
        testUserDTO = new UserDTO();
        testUserDTO.setEmail("test@example.com");
        testUserDTO.setLogin("testuser");
        testUserDTO.setPassword("password123");
        testUserDTO.setFullName("Test User");
        testUserDTO.setBirthDate(LocalDate.of(1990, 1, 1));
        testUserDTO.setPhone("+79001234567");

        userRole = new Role();
        userRole.setId(1);
        userRole.setName(ERole.ROLE_USER);
    }

    @Test
    void createUser_shouldCreateSuccessfully() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.existsByLogin("testuser")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(roleRepository.findByName(ERole.ROLE_USER)).thenReturn(Optional.of(userRole));

        User savedUser = new User("test@example.com", "testuser", "encodedPassword", "Test User", LocalDate.of(1990, 1, 1));
        savedUser.setId(1L);
        savedUser.setRoles(Collections.singleton(userRole));
        savedUser.setPhone("+79001234567");

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserDTO result = userService.createUser(testUserDTO);

        assertThat(result.getEmail()).isEqualTo("test@example.com");
        assertThat(result.getFullName()).isEqualTo("Test User");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUser_shouldThrowWhenEmailTaken() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(testUserDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Email is already taken");

        verify(userRepository, never()).save(any());
    }

    @Test
    void createUser_shouldThrowWhenLoginTaken() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.existsByLogin("testuser")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(testUserDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Login is already taken");
    }

    @Test
    void createUserWithRoles_shouldThrowWhenNoValidRoles() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.existsByLogin("testuser")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");

        assertThatThrownBy(() -> userService.createUserWithRoles(testUserDTO, Set.of(ERole.ROLE_ADMIN)))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("No valid roles provided");
    }
}
