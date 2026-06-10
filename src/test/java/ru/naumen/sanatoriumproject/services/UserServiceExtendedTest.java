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
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceExtendedTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private Role userRole;
    private Role adminRole;

    @BeforeEach
    void setUp() {
        userRole = new Role();
        userRole.setId(1);
        userRole.setName(ERole.ROLE_USER);

        adminRole = new Role();
        adminRole.setId(2);
        adminRole.setName(ERole.ROLE_ADMIN);
    }

    @Test
    void getRegularUsers_shouldReturnUsersWithUserRole() {
        User user = new User("user@example.com", "regularuser", "pass", "Regular User", LocalDate.of(1990, 1, 1));
        user.setId(1L);
        user.setRoles(Set.of(userRole));

        when(roleRepository.findByName(ERole.ROLE_USER)).thenReturn(Optional.of(userRole));
        when(userRepository.findByRolesContaining(userRole)).thenReturn(List.of(user));

        List<UserDTO> result = userService.getRegularUsers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("user@example.com");
    }

    @Test
    void deleteUser_shouldDeleteSuccessfully() {
        when(userRepository.existsById(1L)).thenReturn(true);

        userService.deleteUser(1L);

        verify(userRepository).deleteById(1L);
    }

    @Test
    void deleteUser_shouldThrowWhenNotFound() {
        when(userRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> userService.deleteUser(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void updateUser_shouldUpdateSuccessfully() {
        User existingUser = new User("update@test.com", "updateuser", "oldPass", "Old Name", LocalDate.of(1990, 1, 1));
        existingUser.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserDTO updateDto = new UserDTO();
        updateDto.setFullName("Updated Name");
        updateDto.setPhone("+79999999999");
        updateDto.setBirthDate(LocalDate.of(1991, 1, 1));
        updateDto.setEmail("updated@example.com");
        updateDto.setLogin("updateduser");

        UserDTO result = userService.updateUser(1L, updateDto);

        assertThat(result.getFullName()).isEqualTo("Updated Name");
        assertThat(result.getEmail()).isEqualTo("updated@example.com");
    }

    @Test
    void updateUser_shouldEncodePasswordWhenProvided() {
        User existingUser = new User("pass@test.com", "passuser", "oldPass", "Test User", LocalDate.of(1990, 1, 1));
        existingUser.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.encode("newPassword123")).thenReturn("encodedNewPass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserDTO updateDto = new UserDTO();
        updateDto.setFullName("Updated Name");
        updateDto.setPhone("+79999999999");
        updateDto.setBirthDate(LocalDate.of(1991, 1, 1));
        updateDto.setEmail("passupdated@example.com");
        updateDto.setLogin("passupdated");
        updateDto.setPassword("newPassword123");

        UserDTO result = userService.updateUser(1L, updateDto);

        assertThat(result.getFullName()).isEqualTo("Updated Name");
        verify(passwordEncoder).encode("newPassword123");
    }

    @Test
    void createUserWithRoles_shouldCreateSuccessfully() {
        when(userRepository.existsByEmail("admin@example.com")).thenReturn(false);
        when(userRepository.existsByLogin("adminuser")).thenReturn(false);
        when(roleRepository.findByName(ERole.ROLE_ADMIN)).thenReturn(Optional.of(adminRole));
        when(passwordEncoder.encode("adminPass")).thenReturn("encodedAdmin");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(2L);
            return u;
        });

        UserDTO dto = new UserDTO();
        dto.setEmail("admin@example.com");
        dto.setLogin("adminuser");
        dto.setPassword("adminPass");
        dto.setFullName("Admin User");
        dto.setBirthDate(LocalDate.of(1985, 5, 1));
        dto.setPhone("+79001111111");

        UserDTO result = userService.createUserWithRoles(dto, Set.of(ERole.ROLE_ADMIN));

        assertThat(result.getEmail()).isEqualTo("admin@example.com");
        assertThat(result.getId()).isEqualTo(2L);
    }

    @Test
    void updateUserWithRoles_shouldUpdateSuccessfully() {
        User existingUser = new User("roleupdate@test.com", "roleupdate", "pass", "Test User", LocalDate.of(1990, 1, 1));
        existingUser.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(roleRepository.findByName(ERole.ROLE_ADMIN)).thenReturn(Optional.of(adminRole));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserDTO updateDto = new UserDTO();
        updateDto.setFullName("Updated With Roles");
        updateDto.setPhone("+79999999999");
        updateDto.setBirthDate(LocalDate.of(1991, 1, 1));

        UserDTO result = userService.updateUserWithRoles(1L, updateDto, Set.of(ERole.ROLE_ADMIN));

        assertThat(result.getFullName()).isEqualTo("Updated With Roles");
    }

    @Test
    void getAllRoles_shouldReturnAllRoles() {
        when(roleRepository.findAll()).thenReturn(List.of(userRole, adminRole));

        List<Role> result = userService.getAllRoles();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(Role::getName)
                .containsExactlyInAnyOrder(ERole.ROLE_USER, ERole.ROLE_ADMIN);
    }
}
