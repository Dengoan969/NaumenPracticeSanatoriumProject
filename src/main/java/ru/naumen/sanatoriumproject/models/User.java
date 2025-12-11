package ru.naumen.sanatoriumproject.models;

import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email"),
                @UniqueConstraint(columnNames = "login")
        })
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(max = 100)
    @Pattern(regexp = "^[\\p{L} \\-']+$",
            message = "ФИО может содержать только буквы, пробелы, дефисы и апострофы")
    private String fullName;

    @NotBlank
    @Size(min = 3, max = 20)
    @Column(unique = true)
    private String login;

    @NotBlank
    @Size(max = 120)
    private String password;

    @Size(max = 20)
    @Pattern(regexp = "^\\+?[0-9\\s-]+$", message = "Invalid phone number format")
    private String phone;

    @Past
    private LocalDate birthDate;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    public User(String email, String login, String password, String fullName, LocalDate birthDate) {
        this.email = email;
        this.login = login;
        this.password = password;
        this.birthDate = birthDate;
        this.fullName = fullName;
    }

    public boolean hasRole(ERole roleName) {
        return roles.stream().anyMatch(role -> role.getName() == roleName);
    }
}