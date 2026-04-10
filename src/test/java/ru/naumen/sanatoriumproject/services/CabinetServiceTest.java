package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.naumen.sanatoriumproject.dtos.CabinetDTO;
import ru.naumen.sanatoriumproject.models.Cabinet;
import ru.naumen.sanatoriumproject.repositories.CabinetRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CabinetServiceTest {

    @Mock
    private CabinetRepository cabinetRepository;

    @InjectMocks
    private CabinetService cabinetService;

    private Cabinet testCabinet;
    private CabinetDTO testCabinetDTO;

    @BeforeEach
    void setUp() {
        testCabinet = new Cabinet();
        testCabinet.setId(1L);
        testCabinet.setNumber("101");
        testCabinet.setName("Therapy Room");

        testCabinetDTO = new CabinetDTO();
        testCabinetDTO.setNumber("101");
        testCabinetDTO.setName("Therapy Room");
    }

    @Test
    void getAllCabinets_shouldReturnSortedList() {
        Cabinet cabinet1 = new Cabinet();
        cabinet1.setId(1L);
        cabinet1.setNumber("101");
        cabinet1.setName("Room A");

        Cabinet cabinet2 = new Cabinet();
        cabinet2.setId(2L);
        cabinet2.setNumber("102");
        cabinet2.setName("Room B");

        when(cabinetRepository.findAllByOrderByNumberAsc()).thenReturn(List.of(cabinet1, cabinet2));

        List<CabinetDTO> result = cabinetService.getAllCabinets();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getNumber()).isEqualTo("101");
        assertThat(result.get(1).getNumber()).isEqualTo("102");
        verify(cabinetRepository).findAllByOrderByNumberAsc();
    }

    @Test
    void createCabinet_shouldCreateSuccessfully() {
        when(cabinetRepository.existsByNumber("101")).thenReturn(false);
        when(cabinetRepository.save(any(Cabinet.class))).thenReturn(testCabinet);

        CabinetDTO result = cabinetService.createCabinet(testCabinetDTO);

        assertThat(result.getNumber()).isEqualTo("101");
        assertThat(result.getName()).isEqualTo("Therapy Room");
        verify(cabinetRepository).save(any(Cabinet.class));
    }

    @Test
    void createCabinet_shouldThrowWhenDuplicateNumber() {
        when(cabinetRepository.existsByNumber("101")).thenReturn(true);

        assertThatThrownBy(() -> cabinetService.createCabinet(testCabinetDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already exists");

        verify(cabinetRepository, never()).save(any());
    }

    @Test
    void deleteCabinet_shouldThrowWhenNotFound() {
        when(cabinetRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> cabinetService.deleteCabinet(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }
}
