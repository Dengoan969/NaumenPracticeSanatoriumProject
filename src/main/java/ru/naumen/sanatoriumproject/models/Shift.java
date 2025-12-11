package ru.naumen.sanatoriumproject.models;

import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "shifts")
@Data
@NoArgsConstructor
public class Shift {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private boolean isActive;

    @Column(nullable = false)
    private String description;

    @OneToMany(mappedBy = "shift", cascade = CascadeType.ALL)
    private Set<Registration> registrations = new HashSet<>();

    public Shift(String name, LocalDate startDate, LocalDate endDate, boolean active) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isActive = active;
    }
}