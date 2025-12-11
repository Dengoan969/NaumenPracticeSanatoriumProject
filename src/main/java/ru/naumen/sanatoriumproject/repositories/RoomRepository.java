package ru.naumen.sanatoriumproject.repositories;

import ru.naumen.sanatoriumproject.models.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByNumber(String number);
    boolean existsByNumber(String number);
}
