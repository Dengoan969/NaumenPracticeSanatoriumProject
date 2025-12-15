package ru.naumen.sanatoriumproject.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.naumen.sanatoriumproject.models.StaffCabinet;
import ru.naumen.sanatoriumproject.models.StaffCabinetId;

import java.util.List;

@Repository
public interface StaffCabinetRepository extends JpaRepository<StaffCabinet, StaffCabinetId> {
    List<StaffCabinet> findByUserId(Long userId);
    List<StaffCabinet> findByCabinetId(Long cabinetId);
    boolean existsByUserIdAndCabinetId(Long userId, Long cabinetId);
}