package ru.naumen.sanatoriumproject.dtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UserProfileDTO {
    private String fullName;
    private String email;
    private String phone;
    private LocalDate birthDate;
}
