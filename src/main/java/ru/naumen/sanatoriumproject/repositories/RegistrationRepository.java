package ru.naumen.sanatoriumproject.repositories;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.sanatoriumproject.models.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByUserId(Long userId);

    @Query("SELECT r FROM Registration r " +
            "JOIN FETCH r.user " +
            "LEFT JOIN FETCH r.room " +
            "JOIN FETCH r.shift " +
            "WHERE r.shift.id = :shiftId")
    List<Registration> findByShiftIdWithDetails(@Param("shiftId") Long shiftId);

    long countByRoomIdAndShiftId(Long roomId, Long shiftId);
    boolean existsByUserIdAndShiftId(Long userId, Long shiftId);
    Optional<Registration> findByUserIdAndShiftId(Long userId, Long shiftId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Registration r WHERE r.user.id = :userId AND r.shift.id = :shiftId")
    void deleteByUserIdAndShiftId(Long userId, Long shiftId);
}