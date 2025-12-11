package ru.naumen.sanatoriumproject.dtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ShiftDTO {
    private Long id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isActive;
    private String description;
}