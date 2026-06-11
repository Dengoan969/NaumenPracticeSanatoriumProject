package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.naumen.sanatoriumproject.dtos.ProcedureDTO;
import ru.naumen.sanatoriumproject.models.Cabinet;
import ru.naumen.sanatoriumproject.models.Procedure;
import ru.naumen.sanatoriumproject.repositories.CabinetRepository;
import ru.naumen.sanatoriumproject.repositories.ProcedureRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProcedureServiceTest {

    @Mock
    private ProcedureRepository procedureRepository;

    @Mock
    private CabinetRepository cabinetRepository;

    @InjectMocks
    private ProcedureService procedureService;

    private Cabinet testCabinet;
    private Procedure testProcedure;
    private ProcedureDTO testProcedureDTO;

    @BeforeEach
    void setUp() {
        testCabinet = new Cabinet();
        testCabinet.setId(1L);
        testCabinet.setNumber("101");
        testCabinet.setName("Therapy Room");

        testProcedure = new Procedure();
        testProcedure.setId(1L);
        testProcedure.setName("Massage");
        testProcedure.setCabinet(testCabinet);
        testProcedure.setDefaultDuration(30);

        testProcedureDTO = new ProcedureDTO();
        testProcedureDTO.setName("Massage");
        testProcedureDTO.setCabinetId(1L);
        testProcedureDTO.setDefaultDuration(30);
    }

    @Test
    void createProcedure_shouldCreateSuccessfully() {
        when(cabinetRepository.findById(1L)).thenReturn(Optional.of(testCabinet));
        when(procedureRepository.save(any(Procedure.class))).thenReturn(testProcedure);

        ProcedureDTO result = procedureService.createProcedure(testProcedureDTO);

        assertThat(result.getName()).isEqualTo("Massage");
        assertThat(result.getDefaultDuration()).isEqualTo(30);
        verify(procedureRepository).save(any(Procedure.class));
    }

    @Test
    void createProcedure_shouldThrowWhenCabinetNotFound() {
        when(cabinetRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> procedureService.createProcedure(testProcedureDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Cabinet not found");
    }

    @Test
    void getProcedureById_shouldReturnProcedure() {
        when(procedureRepository.findById(1L)).thenReturn(Optional.of(testProcedure));

        ProcedureDTO result = procedureService.getProcedureById(1L);

        assertThat(result.getName()).isEqualTo("Massage");
        assertThat(result.getCabinetNumber()).isEqualTo("101");
    }

    @Test
    void getProcedureById_shouldThrowWhenNotFound() {
        when(procedureRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> procedureService.getProcedureById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Procedure not found");
    }

    @Test
    void getAllProcedures_shouldReturnSortedList() {
        Procedure proc2 = new Procedure();
        proc2.setId(2L);
        proc2.setName("Physiotherapy");
        proc2.setCabinet(testCabinet);
        proc2.setDefaultDuration(45);

        when(procedureRepository.findAllByOrderByNameAsc()).thenReturn(List.of(testProcedure, proc2));

        List<ProcedureDTO> result = procedureService.getAllProcedures();

        assertThat(result).hasSize(2);
    }

    @Test
    void getProceduresByCabinet_shouldReturnList() {
        when(procedureRepository.findByCabinetId(1L)).thenReturn(List.of(testProcedure));

        List<ProcedureDTO> result = procedureService.getProceduresByCabinet(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCabinetId()).isEqualTo(1L);
    }

    @Test
    void updateProcedure_shouldUpdateSuccessfully() {
        when(procedureRepository.findById(1L)).thenReturn(Optional.of(testProcedure));
        when(cabinetRepository.findById(1L)).thenReturn(Optional.of(testCabinet));
        when(procedureRepository.save(any(Procedure.class))).thenReturn(testProcedure);

        testProcedureDTO.setName("Updated Procedure");
        ProcedureDTO result = procedureService.updateProcedure(1L, testProcedureDTO);

        assertThat(result.getName()).isEqualTo("Updated Procedure");
        verify(procedureRepository).save(any(Procedure.class));
    }

    @Test
    void deleteProcedure_shouldDeleteSuccessfully() {
        when(procedureRepository.existsById(1L)).thenReturn(true);

        procedureService.deleteProcedure(1L);

        verify(procedureRepository).deleteById(1L);
    }

    @Test
    void deleteProcedure_shouldThrowWhenNotFound() {
        when(procedureRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> procedureService.deleteProcedure(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Procedure not found");
    }
}
