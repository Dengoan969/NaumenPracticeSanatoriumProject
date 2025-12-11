package ru.naumen.sanatoriumproject.dtos;

import lombok.Data;

@Data
public class RoomDTO {
    private Long id;
    private String number;
    private Integer capacity;
    private String description;
    private Integer currentOccupancy;
}