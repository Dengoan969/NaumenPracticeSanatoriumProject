package ru.naumen.sanatoriumproject.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.naumen.sanatoriumproject.dtos.AppointmentDTO;
import ru.naumen.sanatoriumproject.models.*;
import ru.naumen.sanatoriumproject.repositories.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final ProcedureRepository procedureRepository;
    private final UserRepository userRepository;
    private final ShiftRepository shiftRepository;

    public List<AppointmentDTO> getAppointmentsByShift(Long shiftId) {
        return appointmentRepository.findByShiftId(shiftId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByStudent(Long studentId) {
        return appointmentRepository.findByStudentId(studentId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public AppointmentDTO createAppointment(AppointmentDTO appointmentDTO) {
        Procedure procedure = procedureRepository.findById(appointmentDTO.getProcedureId())
                .orElseThrow(() -> new RuntimeException("Procedure not found"));
        User student = userRepository.findById(appointmentDTO.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        User doctor = userRepository.findById(appointmentDTO.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        Shift shift = shiftRepository.findById(appointmentDTO.getShiftId())
                .orElseThrow(() -> new RuntimeException("Shift not found"));

        Appointment appointment = new Appointment();
        appointment.setProcedure(procedure);
        appointment.setStudent(student);
        appointment.setDoctor(doctor);
        appointment.setShift(shift);
        appointment.setAppointmentDate(appointmentDTO.getAppointmentDate());
        appointment.setNotes(appointmentDTO.getNotes());

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return convertToDto(savedAppointment);
    }

    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }

    public AppointmentDTO updateAppointmentNote(Long id, String note) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setNotes(note);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return convertToDto(updatedAppointment);
    }

    public List<AppointmentDTO> getAppointmentsByShiftAndCabinet(Long shiftId, Long cabinetId) {
        return appointmentRepository.findByShiftIdAndProcedure_CabinetId(shiftId, cabinetId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByStudentAndShift(Long studentId, Long shiftId) {
        return appointmentRepository.findByStudentIdAndShiftId(studentId, shiftId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private AppointmentDTO convertToDto(Appointment appointment) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        dto.setProcedureId(appointment.getProcedure().getId());
        dto.setProcedureName(appointment.getProcedure().getName());
        dto.setCabinetNumber(appointment.getProcedure().getCabinet().getNumber());
        dto.setStudentId(appointment.getStudent().getId());
        dto.setStudentName(appointment.getStudent().getFullName());
        dto.setStudentPhone(appointment.getStudent().getPhone());
        dto.setStudentEmail(appointment.getStudent().getEmail());
        dto.setDoctorId(appointment.getDoctor().getId());
        dto.setDoctorName(appointment.getDoctor().getFullName());
        dto.setShiftId(appointment.getShift().getId());
        dto.setShiftName(appointment.getShift().getName());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setNotes(appointment.getNotes());
        dto.setCabinetName(appointment.getProcedure().getCabinet().getName());
        dto.setDefaultDuration(appointment.getProcedure().getDefaultDuration());
        return dto;
    }
}