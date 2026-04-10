package ru.naumen.sanatoriumproject.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.naumen.sanatoriumproject.dtos.ProcedureCompletionDTO;
import ru.naumen.sanatoriumproject.services.ProcedureCompletionService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/procedure-completions")
@RequiredArgsConstructor
public class ProcedureCompletionController {
    private final ProcedureCompletionService completionService;

    @PostMapping
    @PreAuthorize("hasRole('NURSE')")
    public ResponseEntity<ProcedureCompletionDTO> markAsCompleted(
            @RequestBody Map<String, Object> request) {
        Long appointmentId = Long.valueOf(request.get("appointmentId").toString());
        Long userId = Long.valueOf(request.get("userId").toString());
        String notes = request.get("notes") != null ? request.get("notes").toString() : null;

        return ResponseEntity.ok(completionService.markProcedureAsCompleted(appointmentId, userId, notes));
    }

    @PreAuthorize("hasRole('NURSE')")
    @GetMapping("/by-appointment/{appointmentId}")
    public ResponseEntity<List<ProcedureCompletionDTO>> getByAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(completionService.getCompletionsByAppointment(appointmentId));
    }

    @PreAuthorize("hasRole('NURSE')")
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<ProcedureCompletionDTO>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(completionService.getCompletionsByUser(userId));
    }
}
