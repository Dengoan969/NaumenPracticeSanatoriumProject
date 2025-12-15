package ru.naumen.sanatoriumproject.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.naumen.sanatoriumproject.dtos.ProcedureDTO;
import ru.naumen.sanatoriumproject.services.ProcedureService;

import java.util.List;

@RestController
@RequestMapping("/api/procedures")
@RequiredArgsConstructor
public class ProcedureController {
    private final ProcedureService procedureService;

    @GetMapping
    public ResponseEntity<List<ProcedureDTO>> getAllProcedures() {
        return ResponseEntity.ok(procedureService.getAllProcedures());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProcedureDTO> getProcedureById(@PathVariable Long id) {
        return ResponseEntity.ok(procedureService.getProcedureById(id));
    }

    @GetMapping("/by-cabinet/{cabinetId}")
    public ResponseEntity<List<ProcedureDTO>> getProceduresByCabinet(@PathVariable Long cabinetId) {
        return ResponseEntity.ok(procedureService.getProceduresByCabinet(cabinetId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProcedureDTO> createProcedure(@RequestBody ProcedureDTO procedureDTO) {
        return ResponseEntity.ok(procedureService.createProcedure(procedureDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProcedureDTO> updateProcedure(
            @PathVariable Long id,
            @RequestBody ProcedureDTO procedureDTO) {
        return ResponseEntity.ok(procedureService.updateProcedure(id, procedureDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProcedure(@PathVariable Long id) {
        procedureService.deleteProcedure(id);
        return ResponseEntity.noContent().build();
    }
}