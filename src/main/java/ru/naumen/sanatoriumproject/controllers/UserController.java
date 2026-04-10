package ru.naumen.sanatoriumproject.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.naumen.sanatoriumproject.dtos.*;
import ru.naumen.sanatoriumproject.models.ERole;
import ru.naumen.sanatoriumproject.models.Registration;
import ru.naumen.sanatoriumproject.models.User;
import ru.naumen.sanatoriumproject.repositories.RegistrationRepository;
import ru.naumen.sanatoriumproject.repositories.UserRepository;
import ru.naumen.sanatoriumproject.services.AppointmentService;
import ru.naumen.sanatoriumproject.services.ProcedureCompletionService;
import ru.naumen.sanatoriumproject.services.UserService;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;
    private final UserService userService;
    private final RegistrationRepository registrationRepository;
    private final AppointmentService appointmentService;
    private final ProcedureCompletionService procedureCompletionService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserWithRolesDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDtoWithRoles)
                .collect(Collectors.toList());
    }

    @GetMapping("/regular")
    @PreAuthorize("hasRole('REGISTRAR')")
    public List<UserDTO> getRegularUsers() {
        return userService.getRegularUsers();
    }

    @PostMapping
    @PreAuthorize("hasRole('REGISTRAR') or hasRole('ADMIN')")
    public ResponseEntity<?> createUser(
            @RequestBody UserWithRolesDTO userDTO,
            @RequestParam(required = false, defaultValue = "false") boolean withRoles) {

        if (withRoles && !userService.hasAdminRole()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (withRoles) {
            Set<ERole> roles = userDTO.getRoles().stream()
                    .map(ERole::valueOf)
                    .collect(Collectors.toSet());
            UserDTO createdUser = userService.createUserWithRoles(convertToSimpleDto(userDTO), roles);
            return ResponseEntity.ok(createdUser);
        } else {
            UserDTO createdUser = userService.createUser(convertToSimpleDto(userDTO));
            return ResponseEntity.ok(createdUser);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('REGISTRAR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody UserWithRolesDTO userDTO,
            @RequestParam(required = false, defaultValue = "false") boolean updateRoles) {

        if (updateRoles && !userService.hasAdminRole()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (updateRoles) {
            Set<ERole> roles = userDTO.getRoles().stream()
                    .filter(Objects::nonNull) // Добавляем фильтр для null значений
                    .map(ERole::valueOf)
                    .collect(Collectors.toSet());
            UserDTO updatedUser = userService.updateUserWithRoles(id, convertToSimpleDto(userDTO), roles);
            return ResponseEntity.ok(updatedUser);
        } else {
            UserDTO updatedUser = userService.updateUser(id, convertToSimpleDto(userDTO));
            return ResponseEntity.ok(updatedUser);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Set<String>> getAllRoles() {
        Set<String> roles = userService.getAllRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/{userId}/profile")
    @PreAuthorize("#userId == authentication.principal.id")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserProfileDTO profile = new UserProfileDTO();
        profile.setFullName(user.getFullName());
        profile.setEmail(user.getEmail());
        profile.setPhone(user.getPhone());
        profile.setBirthDate(user.getBirthDate());

        return ResponseEntity.ok(profile);
    }

    @GetMapping("/{userId}/shifts")
    @PreAuthorize("#userId == authentication.principal.id")
    public ResponseEntity<List<UserShiftInfoDTO>> getUserShifts(@PathVariable Long userId) {
        List<Registration> registrations = registrationRepository.findByUserId(userId);

        List<UserShiftInfoDTO> result = registrations.stream()
                .map(reg -> {
                    UserShiftInfoDTO dto = new UserShiftInfoDTO();
                    dto.setShiftId(reg.getShift().getId());
                    dto.setShiftName(reg.getShift().getName());
                    dto.setStartDate(reg.getShift().getStartDate());
                    dto.setEndDate(reg.getShift().getEndDate());

                    if (reg.getRoom() != null) {
                        dto.setRoomNumber(reg.getRoom().getNumber());
                        dto.setRoomDescription(reg.getRoom().getDescription());
                    }

                    List<AppointmentDTO> appointments = appointmentService.getAppointmentsByStudentAndShift(
                            userId, reg.getShift().getId());
                    dto.setAppointments(appointments);

                    List<ProcedureCompletionDTO> completions = procedureCompletionService
                            .getCompletionsByUserAndShift(userId, reg.getShift().getId());
                    dto.setCompletedProcedures(completions);

                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    private UserWithRolesDTO convertToDtoWithRoles(User user) {
        UserWithRolesDTO dto = new UserWithRolesDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setLogin(user.getLogin());
        dto.setPhone(user.getPhone());
        dto.setBirthDate(user.getBirthDate());
        dto.setRoles(user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet()));
        return dto;
    }

    private UserDTO convertToSimpleDto(UserWithRolesDTO userWithRolesDTO) {
        UserDTO dto = new UserDTO();
        dto.setEmail(userWithRolesDTO.getEmail());
        dto.setFullName(userWithRolesDTO.getFullName());
        dto.setLogin(userWithRolesDTO.getLogin());
        dto.setPassword(userWithRolesDTO.getPassword());
        dto.setPhone(userWithRolesDTO.getPhone());
        dto.setBirthDate(userWithRolesDTO.getBirthDate());
        return dto;
    }
}
