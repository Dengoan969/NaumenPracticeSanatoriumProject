package ru.naumen.sanatoriumproject.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "rooms",
        uniqueConstraints = @UniqueConstraint(columnNames = "number"))
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String number;

    @Column(nullable = false)
    private Integer capacity;

    @Column(length = 50)
    private String description;

    public Room(String number, Integer capacity) {
        this.number = number;
        this.capacity = capacity;
    }
}