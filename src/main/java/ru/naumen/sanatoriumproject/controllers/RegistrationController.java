package ru.naumen.sanatoriumproject.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.naumen.sanatoriumproject.dtos.RegistrationDTO;
import ru.naumen.sanatoriumproject.services.RegistrationService;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class RegistrationController {
    private final RegistrationService registrationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('REGISTRAR', 'ADMIN')")
    public ResponseEntity<RegistrationDTO> createOrUpdateRegistration(
            @RequestBody RegistrationDTO registrationDTO) {
        return ResponseEntity.ok(registrationService.registerUser(registrationDTO));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("#userId == authentication.principal.id or hasAnyRole('REGISTRAR', 'ADMIN')")
    public ResponseEntity<List<RegistrationDTO>> getUserRegistrations(
            @PathVariable Long userId) {
        return ResponseEntity.ok(registrationService.getUserRegistrations(userId));
    }

    @GetMapping("/shift/{shiftId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'REGISTRAR', 'ADMIN')")
    public ResponseEntity<List<RegistrationDTO>> getRegistrationsByShift(
            @PathVariable Long shiftId) {
        return ResponseEntity.ok(registrationService.getRegistrationsByShift(shiftId));
    }

    @DeleteMapping("/user/{userId}/shift/{shiftId}")
    @PreAuthorize("hasAnyRole('REGISTRAR', 'ADMIN')")
    public ResponseEntity<Void> unregisterUser(
            @PathVariable Long userId,
            @PathVariable Long shiftId) {
        registrationService.unregisterUser(userId, shiftId);
        return ResponseEntity.noContent().build();
    }
}