package ru.naumen.sanatoriumproject.repositories;

import ru.naumen.sanatoriumproject.models.Procedure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcedureRepository extends JpaRepository<Procedure, Long> {
    List<Procedure> findAllByOrderByNameAsc();
    List<Procedure> findByCabinetId(Long cabinetId);
    Optional<Procedure> findById(Long id);
}
