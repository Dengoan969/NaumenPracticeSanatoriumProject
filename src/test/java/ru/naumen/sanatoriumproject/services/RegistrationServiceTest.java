package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import ru.naumen.sanatoriumproject.dtos.RegistrationDTO;
import ru.naumen.sanatoriumproject.models.*;
import ru.naumen.sanatoriumproject.repositories.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock
    private RegistrationRepository registrationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private ShiftRepository shiftRepository;

    @InjectMocks
    private RegistrationService registrationService;

    private User testUser;
    private Room testRoom;
    private Shift testShift;
    private RegistrationDTO testDTO;

    @BeforeEach
    void setUp() {
        testUser = new User("user@test.com", "user1", "pass", "Test User", LocalDate.of(1990, 1, 1));
        testUser.setId(1L);

        testRoom = new Room();
        testRoom.setId(1L);
        testRoom.setNumber("101");
        testRoom.setCapacity(3);

        testShift = new Shift();
        testShift.setId(1L);
        testShift.setName("Summer Shift");

        testDTO = new RegistrationDTO();
        testDTO.setUserId(1L);
        testDTO.setRoomId(1L);
        testDTO.setShiftId(1L);
        testDTO.setCheckInDate(LocalDate.of(2026, 6, 1));
        testDTO.setCheckOutDate(LocalDate.of(2026, 6, 14));
    }

    @Test
    void registerUser_shouldCreateSuccessfully() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(shiftRepository.findById(1L)).thenReturn(Optional.of(testShift));
        when(registrationRepository.countByRoomIdAndShiftId(1L, 1L)).thenReturn(1L);
        when(registrationRepository.findByUserIdAndShiftId(1L, 1L)).thenReturn(Optional.empty());
        when(registrationRepository.save(any(Registration.class))).thenAnswer(inv -> {
            Registration r = inv.getArgument(0);
            r.setId(1L);
            return r;
        });

        RegistrationDTO result = registrationService.registerUser(testDTO);

        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getShiftId()).isEqualTo(1L);
        verify(registrationRepository).save(any(Registration.class));
    }

    @Test
    void registerUser_shouldThrowWhenUserNotFound() {
        testDTO.setUserId(999L);
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> registrationService.registerUser(testDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void registerUser_shouldThrowWhenShiftNotFound() {
        testDTO.setShiftId(999L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        // roomId is still 1L, so roomRepository.findById(1L) must be mocked too
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(shiftRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> registrationService.registerUser(testDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Shift not found");
    }

    @Test
    void registerUser_shouldThrowWhenRoomIsFull() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(shiftRepository.findById(1L)).thenReturn(Optional.of(testShift));
        when(registrationRepository.countByRoomIdAndShiftId(1L, 1L)).thenReturn(3L);

        assertThatThrownBy(() -> registrationService.registerUser(testDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Room is full");
    }

    @Test
    void registerUser_shouldAllowWithoutRoom() {
        testDTO.setRoomId(null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(shiftRepository.findById(1L)).thenReturn(Optional.of(testShift));
        when(registrationRepository.findByUserIdAndShiftId(1L, 1L)).thenReturn(Optional.empty());
        when(registrationRepository.save(any(Registration.class))).thenAnswer(inv -> {
            Registration r = inv.getArgument(0);
            r.setId(1L);
            return r;
        });

        RegistrationDTO result = registrationService.registerUser(testDTO);

        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getRoomId()).isNull();
    }

    @Test
    void registerUser_shouldUpdateExistingRegistration() {
        Registration existing = new Registration(testUser, testRoom, testShift);
        existing.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(shiftRepository.findById(1L)).thenReturn(Optional.of(testShift));
        when(registrationRepository.countByRoomIdAndShiftId(1L, 1L)).thenReturn(1L);
        when(registrationRepository.findByUserIdAndShiftId(1L, 1L)).thenReturn(Optional.of(existing));
        when(registrationRepository.save(any(Registration.class))).thenReturn(existing);

        RegistrationDTO result = registrationService.registerUser(testDTO);

        assertThat(result).isNotNull();
        verify(registrationRepository).save(existing);
    }

    @Test
    void getUserRegistrations_shouldReturnList() {
        Registration reg = new Registration(testUser, testRoom, testShift);
        reg.setId(1L);
        when(registrationRepository.findByUserId(1L)).thenReturn(List.of(reg));

        var result = registrationService.getUserRegistrations(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(1L);
    }

    @Test
    void getRegistrationsByShift_shouldReturnList() {
        Registration reg = new Registration(testUser, testRoom, testShift);
        reg.setId(1L);
        when(registrationRepository.findByShiftIdWithDetails(1L)).thenReturn(List.of(reg));

        var result = registrationService.getRegistrationsByShift(1L);

        assertThat(result).hasSize(1);
    }

    @Test
    void unregisterUser_shouldDeleteSuccessfully() {
        when(registrationRepository.existsByUserIdAndShiftId(1L, 1L)).thenReturn(true);

        registrationService.unregisterUser(1L, 1L);

        verify(registrationRepository).deleteByUserIdAndShiftId(1L, 1L);
    }

    @Test
    void unregisterUser_shouldThrowWhenNotFound() {
        when(registrationRepository.existsByUserIdAndShiftId(1L, 1L)).thenReturn(false);

        assertThatThrownBy(() -> registrationService.unregisterUser(1L, 1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Registration not found");
    }
}
