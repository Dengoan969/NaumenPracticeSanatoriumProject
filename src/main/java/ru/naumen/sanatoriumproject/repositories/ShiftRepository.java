package ru.naumen.sanatoriumproject.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.naumen.sanatoriumproject.models.Shift;

import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByIsActiveTrue();
    List<Shift> findAllByOrderByStartDateDesc();
}
