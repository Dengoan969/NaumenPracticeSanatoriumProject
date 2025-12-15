package ru.naumen.sanatoriumproject.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.sanatoriumproject.dtos.RoomDTO;
import ru.naumen.sanatoriumproject.models.Room;
import ru.naumen.sanatoriumproject.repositories.RegistrationRepository;
import ru.naumen.sanatoriumproject.repositories.RoomRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final RegistrationRepository registrationRepository;

    @Transactional
    public RoomDTO createRoom(RoomDTO roomDTO) {
        if (roomRepository.existsByNumber(roomDTO.getNumber())) {
            throw new IllegalArgumentException("Room with this number already exists");
        }

        Room room = new Room();
        room.setNumber(roomDTO.getNumber());
        room.setCapacity(roomDTO.getCapacity());
        room.setDescription(roomDTO.getDescription());

        Room savedRoom = roomRepository.save(room);
        return convertToDto(savedRoom);
    }

    public List<RoomDTO> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public RoomDTO getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        return convertToDto(room);
    }

    @Transactional
    public RoomDTO updateRoom(Long id, RoomDTO roomDTO) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        if (!room.getNumber().equals(roomDTO.getNumber()) &&
                roomRepository.existsByNumber(roomDTO.getNumber())) {
            throw new IllegalArgumentException("Room with this number already exists");
        }

        room.setNumber(roomDTO.getNumber());
        room.setCapacity(roomDTO.getCapacity());
        room.setDescription(roomDTO.getDescription());

        Room updatedRoom = roomRepository.save(room);
        return convertToDto(updatedRoom);
    }

    @Transactional
    public void deleteRoom(Long id) {
        if (!roomRepository.existsById(id)) {
            throw new IllegalArgumentException("Room not found");
        }
        roomRepository.deleteById(id);
    }

    public List<RoomDTO> getAvailableRooms(Long shiftId) {
        return roomRepository.findAll().stream()
                .map(room -> {
                    RoomDTO dto = convertToDto(room);
                    long occupied = registrationRepository.countByRoomIdAndShiftId(room.getId(), shiftId);
                    dto.setCurrentOccupancy((int) occupied);
                    return dto;
                })
                .filter(room -> room.getCurrentOccupancy() < room.getCapacity())
                .collect(Collectors.toList());
    }

    private RoomDTO convertToDto(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setNumber(room.getNumber());
        dto.setCapacity(room.getCapacity());
        dto.setDescription(room.getDescription());
        return dto;
    }
}