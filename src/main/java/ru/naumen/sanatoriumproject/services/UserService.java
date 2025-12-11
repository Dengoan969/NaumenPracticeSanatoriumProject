package ru.naumen.sanatoriumproject.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.naumen.sanatoriumproject.dtos.UserDTO;
import ru.naumen.sanatoriumproject.models.ERole;
import ru.naumen.sanatoriumproject.models.Role;
import ru.naumen.sanatoriumproject.models.User;
import ru.naumen.sanatoriumproject.repositories.RoleRepository;
import ru.naumen.sanatoriumproject.repositories.UserRepository;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDTO> getRegularUsers() {
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role USER not found."));

        return userRepository.findByRolesContaining(userRole).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public UserDTO createUser(UserDTO userDTO) {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Error: Email is already taken!");
        }

        if (userRepository.existsByLogin(userDTO.getLogin())) {
            throw new RuntimeException("Error: Login is already taken!");
        }

        User user = new User(
                userDTO.getEmail(),
                userDTO.getLogin(),
                passwordEncoder.encode(userDTO.getPassword()),
                userDTO.getFullName(),
                userDTO.getBirthDate());

        user.setPhone(userDTO.getPhone());

        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role USER not found."));
        user.setRoles(Collections.singleton(userRole));

        User savedUser = userRepository.save(user);
        return convertToDto(savedUser);
    }

    public UserDTO createUserWithRoles(UserDTO userDTO, Set<ERole> roleNames) {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Error: Email is already taken!");
        }

        if (userRepository.existsByLogin(userDTO.getLogin())) {
            throw new RuntimeException("Error: Login is already taken!");
        }

        User user = new User(
                userDTO.getEmail(),
                userDTO.getLogin(),
                passwordEncoder.encode(userDTO.getPassword()),
                userDTO.getFullName(),
                userDTO.getBirthDate());

        user.setPhone(userDTO.getPhone());

        Set<Role> roles = roleNames.stream()
                .map(roleName -> roleRepository.findByName(roleName))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());

        if (roles.isEmpty()) {
            throw new RuntimeException("Error: No valid roles provided!");
        }

        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        return convertToDto(savedUser);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Error: User not found.");
        }
        userRepository.deleteById(id);
    }

    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        user.setFullName(userDTO.getFullName());
        user.setPhone(userDTO.getPhone());
        user.setBirthDate(userDTO.getBirthDate());
        user.setEmail(userDTO.getEmail());
        user.setLogin(userDTO.getLogin());

        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }

        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }

    public UserDTO updateUserWithRoles(Long id, UserDTO userDTO, Set<ERole> roleNames) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        // Обновляем только те поля, которые разрешено изменять
        user.setFullName(userDTO.getFullName());
        user.setPhone(userDTO.getPhone());
        user.setBirthDate(userDTO.getBirthDate());

        // Не обновляем email и login, если они null или пустые
        if (userDTO.getEmail() != null && !userDTO.getEmail().isEmpty()) {
            user.setEmail(userDTO.getEmail());
        }

        if (userDTO.getLogin() != null && !userDTO.getLogin().isEmpty()) {
            user.setLogin(userDTO.getLogin());
        }

        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }

        if (roleNames != null && !roleNames.isEmpty()) {
            Set<Role> roles = roleNames.stream()
                    .map(roleName -> roleRepository.findByName(roleName))
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }

        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public boolean hasAdminRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));
    }

    private UserDTO convertToDto(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setLogin(user.getLogin());
        dto.setPhone(user.getPhone());
        dto.setBirthDate(user.getBirthDate());
        return dto;
    }
}