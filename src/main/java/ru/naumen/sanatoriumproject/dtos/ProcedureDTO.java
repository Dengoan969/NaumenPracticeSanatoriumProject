package ru.naumen.sanatoriumproject.dtos;

import lombok.Data;

@Data
public class ProcedureDTO {
    private Long id;
    private String name;
    private Long cabinetId;
    private String cabinetNumber;
    private int defaultDuration;
    private String cabinetName;
}