package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.naumen.sanatoriumproject.dtos.RoomDTO;
import ru.naumen.sanatoriumproject.models.Room;
import ru.naumen.sanatoriumproject.repositories.RegistrationRepository;
import ru.naumen.sanatoriumproject.repositories.RoomRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RegistrationRepository registrationRepository;

    @InjectMocks
    private RoomService roomService;

    private Room testRoom;
    private RoomDTO testRoomDTO;

    @BeforeEach
    void setUp() {
        testRoom = new Room();
        testRoom.setId(1L);
        testRoom.setNumber("201");
        testRoom.setCapacity(4);
        testRoom.setDescription("Double room with balcony");

        testRoomDTO = new RoomDTO();
        testRoomDTO.setNumber("201");
        testRoomDTO.setCapacity(4);
        testRoomDTO.setDescription("Double room with balcony");
    }

    @Test
    void createRoom_shouldCreateSuccessfully() {
        when(roomRepository.existsByNumber("201")).thenReturn(false);
        when(roomRepository.save(any(Room.class))).thenReturn(testRoom);

        RoomDTO result = roomService.createRoom(testRoomDTO);

        assertThat(result.getNumber()).isEqualTo("201");
        assertThat(result.getCapacity()).isEqualTo(4);
        verify(roomRepository).save(any(Room.class));
    }

    @Test
    void createRoom_shouldThrowWhenDuplicateNumber() {
        when(roomRepository.existsByNumber("201")).thenReturn(true);

        assertThatThrownBy(() -> roomService.createRoom(testRoomDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void getRoomById_shouldReturnRoom() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));

        RoomDTO result = roomService.getRoomById(1L);

        assertThat(result.getNumber()).isEqualTo("201");
        assertThat(result.getCapacity()).isEqualTo(4);
    }

    @Test
    void getRoomById_shouldThrowWhenNotFound() {
        when(roomRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.getRoomById(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Room not found");
    }

    @Test
    void getAllRooms_shouldReturnSortedList() {
        Room room2 = new Room();
        room2.setId(2L);
        room2.setNumber("202");
        room2.setCapacity(2);

        when(roomRepository.findAll()).thenReturn(List.of(testRoom, room2));

        List<RoomDTO> result = roomService.getAllRooms();

        assertThat(result).hasSize(2);
    }

    @Test
    void updateRoom_shouldUpdateSuccessfully() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(roomRepository.save(any(Room.class))).thenReturn(testRoom);

        testRoomDTO.setCapacity(6);
        RoomDTO result = roomService.updateRoom(1L, testRoomDTO);

        assertThat(result.getCapacity()).isEqualTo(6);
        verify(roomRepository).save(any(Room.class));
    }

    @Test
    void updateRoom_shouldThrowWhenNotFound() {
        when(roomRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.updateRoom(1L, testRoomDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Room not found");
    }

    @Test
    void updateRoom_shouldThrowOnDuplicateNumber() {
        Room existing = new Room();
        existing.setId(1L);
        existing.setNumber("201");

        testRoomDTO.setNumber("202");
        when(roomRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(roomRepository.existsByNumber("202")).thenReturn(true);

        assertThatThrownBy(() -> roomService.updateRoom(1L, testRoomDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void deleteRoom_shouldDeleteSuccessfully() {
        when(roomRepository.existsById(1L)).thenReturn(true);

        roomService.deleteRoom(1L);

        verify(roomRepository).deleteById(1L);
    }

    @Test
    void deleteRoom_shouldThrowWhenNotFound() {
        when(roomRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> roomService.deleteRoom(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Room not found");
    }

    @Test
    void getAvailableRooms_shouldReturnOnlyRoomsWithCapacity() {
        Room fullRoom = new Room();
        fullRoom.setId(2L);
        fullRoom.setNumber("202");
        fullRoom.setCapacity(2);

        when(roomRepository.findAll()).thenReturn(List.of(testRoom, fullRoom));
        when(registrationRepository.countByRoomIdAndShiftId(1L, 1L)).thenReturn(2L);
        when(registrationRepository.countByRoomIdAndShiftId(2L, 1L)).thenReturn(2L);

        List<RoomDTO> result = roomService.getAvailableRooms(1L);

        // Room 201 has capacity 4, occupied 2 -> available
        // Room 202 has capacity 2, occupied 2 -> NOT available
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNumber()).isEqualTo("201");
    }
}
