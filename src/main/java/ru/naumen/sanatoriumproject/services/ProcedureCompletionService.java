package ru.naumen.sanatoriumproject.services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ru.naumen.sanatoriumproject.dtos.ProcedureCompletionDTO;
import ru.naumen.sanatoriumproject.models.*;
import ru.naumen.sanatoriumproject.repositories.AppointmentRepository;
import ru.naumen.sanatoriumproject.repositories.ProcedureCompletionRepository;
import ru.naumen.sanatoriumproject.repositories.StaffCabinetRepository;
import ru.naumen.sanatoriumproject.repositories.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProcedureCompletionService {
    private final ProcedureCompletionRepository completionRepository;
    private final AppointmentRepository appointmentRepository;
    private final StaffCabinetRepository staffCabinetRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProcedureCompletionDTO markProcedureAsCompleted(Long appointmentId, Long userId, String notes) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Проверка что медсестра имеет доступ к кабинету
        boolean hasAccess = staffCabinetRepository.existsByUserIdAndCabinetId(
                userId, appointment.getProcedure().getCabinet().getId());

        if (!hasAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User doesn't have access to this cabinet");
        }

        ProcedureCompletion completion = new ProcedureCompletion();
        completion.setAppointment(appointment);
        completion.setCompletedAt(LocalDateTime.now());
        completion.setCompletedBy(user);
        completion.setNotes(notes);

        ProcedureCompletion saved = completionRepository.save(completion);
        return convertToDto(saved);
    }

    public List<ProcedureCompletionDTO> getCompletionsByAppointment(Long appointmentId) {
        return completionRepository.findByAppointmentId(appointmentId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProcedureCompletionDTO> getCompletionsByUser(Long userId) {
        return completionRepository.findByCompletedById(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProcedureCompletionDTO> getCompletionsByUserAndShift(Long userId, Long shiftId) {
        return completionRepository.findByAppointment_StudentIdAndAppointment_ShiftId(userId, shiftId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private ProcedureCompletionDTO convertToDto(ProcedureCompletion completion) {
        ProcedureCompletionDTO dto = new ProcedureCompletionDTO();
        dto.setId(completion.getId());
        dto.setAppointmentId(completion.getAppointment().getId());
        dto.setCompletedAt(completion.getCompletedAt());
        dto.setCompletedById(completion.getCompletedBy().getId());
        dto.setCompletedByName(completion.getCompletedBy().getFullName());
        dto.setNotes(completion.getNotes());
        dto.setProcedureName(completion.getAppointment().getProcedure().getName());
        dto.setStudentName(completion.getAppointment().getStudent().getFullName());
        dto.setCabinetNumber(completion.getAppointment().getProcedure().getCabinet().getNumber());
        return dto;
    }
}
