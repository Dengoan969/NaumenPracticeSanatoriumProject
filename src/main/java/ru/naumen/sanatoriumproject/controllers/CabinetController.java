package ru.naumen.sanatoriumproject.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.naumen.sanatoriumproject.dtos.CabinetDTO;
import ru.naumen.sanatoriumproject.services.CabinetService;

import java.util.List;

@RestController
@RequestMapping("/api/cabinets")
@RequiredArgsConstructor
public class CabinetController {
    private final CabinetService cabinetService;

    @GetMapping
    public ResponseEntity<List<CabinetDTO>> getAllCabinets() {
        return ResponseEntity.ok(cabinetService.getAllCabinets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CabinetDTO> getCabinetById(@PathVariable Long id) {
        return ResponseEntity.ok(cabinetService.getCabinetById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CabinetDTO> createCabinet(@RequestBody CabinetDTO cabinetDTO) {
        if (cabinetService.cabinetExists(cabinetDTO.getNumber())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(cabinetService.createCabinet(cabinetDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CabinetDTO> updateCabinet(
            @PathVariable Long id,
            @RequestBody CabinetDTO cabinetDTO) {
        return ResponseEntity.ok(cabinetService.updateCabinet(id, cabinetDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCabinet(@PathVariable Long id) {
        cabinetService.deleteCabinet(id);
        return ResponseEntity.noContent().build();
    }
}