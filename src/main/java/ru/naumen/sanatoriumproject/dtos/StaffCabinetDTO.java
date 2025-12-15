package ru.naumen.sanatoriumproject.dtos;

import lombok.Data;

@Data
public class StaffCabinetDTO {
    private Long userId;
    private Long cabinetId;
    private String userFullName;
    private String cabinetNumber;
    private String cabinetName;
}