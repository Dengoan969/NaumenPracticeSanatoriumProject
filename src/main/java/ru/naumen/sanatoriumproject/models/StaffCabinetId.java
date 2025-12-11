package ru.naumen.sanatoriumproject.models;

import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;

@Data
@Embeddable
public class StaffCabinetId implements Serializable {
    private Long userId;
    private Long cabinetId;
}
