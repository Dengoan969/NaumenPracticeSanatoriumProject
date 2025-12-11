package ru.naumen.sanatoriumproject.repositories;

import ru.naumen.sanatoriumproject.models.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByShiftId(Long shiftId);
    List<Appointment> findByStudentId(Long studentId);
    List<Appointment> findByStudentIdAndShiftId(Long studentId, Long shiftId);
    List<Appointment> findByShiftIdAndProcedure_CabinetId(Long shiftId, Long cabinetId);
}