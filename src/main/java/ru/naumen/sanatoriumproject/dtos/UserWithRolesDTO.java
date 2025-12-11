package ru.naumen.sanatoriumproject.dtos;

import lombok.Data;
import java.time.LocalDate;
import java.util.Set;

@Data
public class UserWithRolesDTO {
    private Long id;
    private String email;
    private String fullName;
    private String login;
    private String password;
    private String phone;
    private LocalDate birthDate;
    private Set<String> roles;
}