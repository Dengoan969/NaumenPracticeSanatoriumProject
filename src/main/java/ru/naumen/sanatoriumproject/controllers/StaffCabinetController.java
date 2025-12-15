package ru.naumen.sanatoriumproject.controllers;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.naumen.sanatoriumproject.dtos.StaffCabinetDTO;
import ru.naumen.sanatoriumproject.services.StaffCabinetService;

import java.util.List;

@RestController
@RequestMapping("/api/staff-cabinets")
@RequiredArgsConstructor
public class StaffCabinetController {
    private final StaffCabinetService staffCabinetService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffCabinetDTO> assignCabinet(
            @RequestParam Long userId,
            @RequestParam Long cabinetId) {
        return ResponseEntity.ok(staffCabinetService.assignCabinetToStaff(userId, cabinetId));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeAssignment(
            @RequestParam Long userId,
            @RequestParam Long cabinetId) {
        staffCabinetService.removeCabinetFromStaff(userId, cabinetId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-user/{userId}")
    @PreAuthorize("hasRole('NURSE') or hasRole('ADMIN')")
    public ResponseEntity<List<StaffCabinetDTO>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(staffCabinetService.getCabinetsByStaff(userId));
    }

    @GetMapping("/by-cabinet/{cabinetId}")
    @PreAuthorize("hasRole('NURSE') or hasRole('ADMIN')")
    public ResponseEntity<List<StaffCabinetDTO>> getByCabinet(@PathVariable Long cabinetId) {
        return ResponseEntity.ok(staffCabinetService.getStaffByCabinet(cabinetId));
    }

    @GetMapping("/assignments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StaffCabinetDTO>> getAllAssignments() {
        return ResponseEntity.ok(staffCabinetService.getAllAssignments());
    }
}