package ru.naumen.sanatoriumproject.repositories;

import ru.naumen.sanatoriumproject.models.Cabinet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CabinetRepository extends JpaRepository<Cabinet, Long> {
    List<Cabinet> findAllByOrderByNumberAsc();
    boolean existsByNumber(String number);
}