package ru.naumen.sanatoriumproject.dtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AppointmentDTO {
    private Long id;
    private Long procedureId;
    private String procedureName;
    private String cabinetNumber;
    private Long studentId;
    private String studentName;
    private String studentPhone;
    private String studentEmail;
    private Long doctorId;
    private String doctorName;
    private Long shiftId;
    private String shiftName;
    private LocalDate appointmentDate;
    private String notes;
    private String cabinetName;
    private int defaultDuration;
}