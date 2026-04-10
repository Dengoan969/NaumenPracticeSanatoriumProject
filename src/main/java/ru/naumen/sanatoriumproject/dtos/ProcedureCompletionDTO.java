package ru.naumen.sanatoriumproject.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProcedureCompletionDTO {
    private Long id;
    private Long appointmentId;
    private LocalDateTime completedAt;
    private Long completedById;
    private String completedByName;
    private String notes;
    private String procedureName;
    private String studentName;
    private String cabinetNumber;
}
