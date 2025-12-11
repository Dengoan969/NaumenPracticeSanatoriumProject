package ru.naumen.sanatoriumproject.dtos;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RegistrationDTO {
    private Long id;
    private Long userId;
    private Long roomId;
    private Long shiftId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private String userFullName;
    private String roomNumber;
    private String shiftName;
    private String userPhone;
    private String userEmail;
}