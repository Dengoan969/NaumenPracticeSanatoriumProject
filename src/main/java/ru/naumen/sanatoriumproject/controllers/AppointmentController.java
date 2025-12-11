package ru.naumen.sanatoriumproject.controllers;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ru.naumen.sanatoriumproject.dtos.AppointmentDTO;
import ru.naumen.sanatoriumproject.services.AppointmentService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private static final Logger logger = LoggerFactory.getLogger(AppointmentController.class);
    private final AppointmentService appointmentService;

    private String getCurrentUserInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "anonymous";
        }

        String username = authentication.getName();
        String roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(", "));

        return String.format("user: %s, roles: [%s]", username, roles);
    }

    @GetMapping("/shift/{shiftId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByShift(
            @PathVariable Long shiftId) {
        logger.info("Запрос на получение записей по смене {} от {}", shiftId, getCurrentUserInfo());

        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByShift(shiftId);

        logger.debug("Отправка {} записей по смене {} пользователю {}",
                appointments.size(), shiftId, getCurrentUserInfo());

        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByStudent(
            @PathVariable Long studentId) {
        logger.info("Запрос на получение записей студента {} от {}", studentId, getCurrentUserInfo());

        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByStudent(studentId);

        logger.debug("Отправка {} записей студента {} пользователю {}",
                appointments.size(), studentId, getCurrentUserInfo());

        return ResponseEntity.ok(appointments);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<AppointmentDTO> createAppointment(
            @RequestBody AppointmentDTO appointmentDTO) {
        logger.info("Запрос на создание новой записи от {}", getCurrentUserInfo());
        logger.debug("Детали создаваемой записи: {}", appointmentDTO);

        AppointmentDTO createdAppointment = appointmentService.createAppointment(appointmentDTO);

        logger.info("Успешно создана запись с ID {} пользователем {}",
                createdAppointment.getId(), getCurrentUserInfo());
        logger.debug("Детали созданной записи: {}", createdAppointment);

        return ResponseEntity.ok(createdAppointment);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteAppointment(
            @PathVariable Long id) {
        logger.info("Запрос на удаление записи с ID {} от {}", id, getCurrentUserInfo());

        appointmentService.deleteAppointment(id);

        logger.info("Запись с ID {} успешно удалена пользователем {}", id, getCurrentUserInfo());

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/note")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<AppointmentDTO> updateAppointmentNote(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String note = request.get("note");
        logger.info("Запрос на обновление заметки записи с ID {} от {}", id, getCurrentUserInfo());
        logger.debug("Новая заметка для записи {}: {}", id, note);

        AppointmentDTO updatedAppointment = appointmentService.updateAppointmentNote(id, note);

        logger.info("Заметка записи с ID {} успешно обновлена пользователем {}",
                id, getCurrentUserInfo());
        logger.debug("Обновленные детали записи: {}", updatedAppointment);

        return ResponseEntity.ok(updatedAppointment);
    }

    @GetMapping("/shift/{shiftId}/cabinet/{cabinetId}")
    @PreAuthorize("hasAnyRole('NURSE', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByShiftAndCabinet(
            @PathVariable Long shiftId,
            @PathVariable Long cabinetId) {
        logger.info("Запрос на получение записей по смене {} и кабинету {} от {}",
                shiftId, cabinetId, getCurrentUserInfo());

        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByShiftAndCabinet(shiftId, cabinetId);

        logger.debug("Отправка {} записей по смене {} и кабинету {} пользователю {}",
                appointments.size(), shiftId, cabinetId, getCurrentUserInfo());

        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/student/{studentId}/shift/{shiftId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByStudentAndShift(
            @PathVariable Long studentId,
            @PathVariable Long shiftId) {
        logger.info("Запрос на получение записей студента {} по смене {} от {}",
                studentId, shiftId, getCurrentUserInfo());

        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByStudentAndShift(studentId, shiftId);

        logger.debug("Отправка {} записей студента {} по смене {} пользователю {}",
                appointments.size(), studentId, shiftId, getCurrentUserInfo());

        return ResponseEntity.ok(appointments);
    }
}
