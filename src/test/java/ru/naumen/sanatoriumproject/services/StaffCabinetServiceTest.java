package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import ru.naumen.sanatoriumproject.dtos.StaffCabinetDTO;
import ru.naumen.sanatoriumproject.models.Cabinet;
import ru.naumen.sanatoriumproject.models.StaffCabinet;
import ru.naumen.sanatoriumproject.models.StaffCabinetId;
import ru.naumen.sanatoriumproject.models.User;
import ru.naumen.sanatoriumproject.repositories.CabinetRepository;
import ru.naumen.sanatoriumproject.repositories.StaffCabinetRepository;
import ru.naumen.sanatoriumproject.repositories.UserRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StaffCabinetServiceTest {

    @Mock
    private StaffCabinetRepository staffCabinetRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CabinetRepository cabinetRepository;

    @InjectMocks
    private StaffCabinetService staffCabinetService;

    private User testUser;
    private Cabinet testCabinet;
    private StaffCabinet testStaffCabinet;

    @BeforeEach
    void setUp() {
        testUser = new User("doctor@test.com", "doctor1", "pass", "Доктор Иванов", LocalDate.of(1980, 1, 1));
        testUser.setId(1L);

        testCabinet = new Cabinet();
        testCabinet.setId(1L);
        testCabinet.setNumber("101");
        testCabinet.setName("Терапевтический кабинет");

        StaffCabinetId scId = new StaffCabinetId();
        scId.setUserId(1L);
        scId.setCabinetId(1L);

        testStaffCabinet = new StaffCabinet();
        testStaffCabinet.setId(scId);
        testStaffCabinet.setUser(testUser);
        testStaffCabinet.setCabinet(testCabinet);
    }

    @Test
    void assignCabinetToStaff_ValidData_Success() {
        when(staffCabinetRepository.existsByUserIdAndCabinetId(1L, 1L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(cabinetRepository.findById(1L)).thenReturn(Optional.of(testCabinet));
        when(staffCabinetRepository.save(any(StaffCabinet.class))).thenReturn(testStaffCabinet);

        StaffCabinetDTO result = staffCabinetService.assignCabinetToStaff(1L, 1L);

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getCabinetId()).isEqualTo(1L);
        verify(staffCabinetRepository).save(any(StaffCabinet.class));
    }

    @Test
    void assignCabinetToStaff_AlreadyExists_ThrowsException() {
        when(staffCabinetRepository.existsByUserIdAndCabinetId(1L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> staffCabinetService.assignCabinetToStaff(1L, 1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Assignment already exists");
    }

    @Test
    void assignCabinetToStaff_UserNotFound_ThrowsException() {
        when(staffCabinetRepository.existsByUserIdAndCabinetId(999L, 1L)).thenReturn(false);
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> staffCabinetService.assignCabinetToStaff(999L, 1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void assignCabinetToStaff_CabinetNotFound_ThrowsException() {
        when(staffCabinetRepository.existsByUserIdAndCabinetId(1L, 999L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(cabinetRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> staffCabinetService.assignCabinetToStaff(1L, 999L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Cabinet not found");
    }

    @Test
    void getCabinetsByStaff_ValidUser_ReturnsList() {
        when(staffCabinetRepository.findByUserId(1L)).thenReturn(List.of(testStaffCabinet));

        List<StaffCabinetDTO> result = staffCabinetService.getCabinetsByStaff(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(1L);
        assertThat(result.get(0).getCabinetId()).isEqualTo(1L);
    }

    @Test
    void getCabinetsByStaff_NoAssignments_ReturnsEmptyList() {
        when(staffCabinetRepository.findByUserId(1L)).thenReturn(List.of());

        List<StaffCabinetDTO> result = staffCabinetService.getCabinetsByStaff(1L);

        assertThat(result).isEmpty();
    }

    @Test
    void getStaffByCabinet_ValidCabinet_ReturnsList() {
        when(staffCabinetRepository.findByCabinetId(1L)).thenReturn(List.of(testStaffCabinet));

        List<StaffCabinetDTO> result = staffCabinetService.getStaffByCabinet(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(1L);
    }

    @Test
    void getStaffByCabinet_NoAssignments_ReturnsEmptyList() {
        when(staffCabinetRepository.findByCabinetId(1L)).thenReturn(List.of());

        List<StaffCabinetDTO> result = staffCabinetService.getStaffByCabinet(1L);

        assertThat(result).isEmpty();
    }

    @Test
    void getAllAssignments_ReturnsAll() {
        when(staffCabinetRepository.findAll()).thenReturn(List.of(testStaffCabinet));

        List<StaffCabinetDTO> result = staffCabinetService.getAllAssignments();

        assertThat(result).hasSize(1);
    }

    @Test
    void removeCabinetFromStaff_ExistingAssignment_Success() {
        StaffCabinetId id = new StaffCabinetId();
        id.setUserId(1L);
        id.setCabinetId(1L);
        when(staffCabinetRepository.existsById(id)).thenReturn(true);

        staffCabinetService.removeCabinetFromStaff(1L, 1L);

        verify(staffCabinetRepository).deleteById(id);
    }

    @Test
    void removeCabinetFromStaff_NonExistentAssignment_ThrowsException() {
        StaffCabinetId id = new StaffCabinetId();
        id.setUserId(999L);
        id.setCabinetId(999L);
        when(staffCabinetRepository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> staffCabinetService.removeCabinetFromStaff(999L, 999L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Assignment not found");
    }

    @Test
    void convertToDto_ReturnsCorrectStructure() {
        when(staffCabinetRepository.findByUserId(1L)).thenReturn(List.of(testStaffCabinet));

        List<StaffCabinetDTO> result = staffCabinetService.getCabinetsByStaff(1L);

        assertThat(result.get(0)).isNotNull();
        assertThat(result.get(0).getUserId()).isEqualTo(1L);
        assertThat(result.get(0).getCabinetId()).isEqualTo(1L);
        assertThat(result.get(0).getUserFullName()).isEqualTo("Доктор Иванов");
        assertThat(result.get(0).getCabinetNumber()).isEqualTo("101");
        assertThat(result.get(0).getCabinetName()).isEqualTo("Терапевтический кабинет");
    }
}