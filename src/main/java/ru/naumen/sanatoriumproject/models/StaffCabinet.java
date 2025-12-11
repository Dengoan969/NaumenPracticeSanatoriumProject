package ru.naumen.sanatoriumproject.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "staff_cabinets")
public class StaffCabinet {
    @EmbeddedId
    private StaffCabinetId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("cabinetId")
    @JoinColumn(name = "cabinet_id")
    private Cabinet cabinet;
}