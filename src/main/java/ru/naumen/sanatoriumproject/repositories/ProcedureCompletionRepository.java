package ru.naumen.sanatoriumproject.repositories;

import ru.naumen.sanatoriumproject.models.ProcedureCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcedureCompletionRepository extends JpaRepository<ProcedureCompletion, Long> {
    List<ProcedureCompletion> findByAppointmentId(Long appointmentId);
    List<ProcedureCompletion> findByCompletedById(Long userId);
    List<ProcedureCompletion> findByAppointment_StudentIdAndAppointment_ShiftId(Long studentId, Long shiftId);
    boolean existsByAppointmentId(Long appointmentId);
}
