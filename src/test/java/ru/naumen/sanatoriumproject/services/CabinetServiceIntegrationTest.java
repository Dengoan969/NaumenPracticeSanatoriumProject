package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import ru.naumen.sanatoriumproject.dtos.CabinetDTO;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Sql(scripts = "/sql/cleanup.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@Sql(scripts = "/sql/test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class CabinetServiceIntegrationTest {

    @Autowired
    private CabinetService cabinetService;

    @Test
    void getAllCabinets_shouldReturnAllCabinets() {
        var cabinets = cabinetService.getAllCabinets();
        assertNotNull(cabinets);
        assertEquals(5, cabinets.size());
    }

    @Test
    void getCabinetById_shouldReturnExistingCabinet() {
        CabinetDTO cabinet = cabinetService.getCabinetById(1L);
        assertNotNull(cabinet);
        assertEquals("101", cabinet.getNumber());
        assertEquals("Therapy Room", cabinet.getName());
    }

    @Test
    void getCabinetById_withNonExistentId_shouldThrowException() {
        assertThrows(Exception.class, () -> cabinetService.getCabinetById(999L));
    }

    @Test
    void createCabinet_shouldPersistAndReturnCabinet() {
        CabinetDTO dto = new CabinetDTO();
        dto.setNumber("401");
        dto.setName("New Cabinet");

        CabinetDTO created = cabinetService.createCabinet(dto);
        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals("401", created.getNumber());
    }

    @Test
    void createCabinet_withDuplicateNumber_shouldThrowException() {
        CabinetDTO dto = new CabinetDTO();
        dto.setNumber("101");
        dto.setName("Duplicate Cabinet");

        assertThrows(Exception.class, () -> cabinetService.createCabinet(dto));
    }

    @Test
    void updateCabinet_shouldModifyExistingCabinet() {
        CabinetDTO dto = new CabinetDTO();
        dto.setNumber("101-A");
        dto.setName("Updated Therapy Room");

        CabinetDTO updated = cabinetService.updateCabinet(1L, dto);
        assertNotNull(updated);
        assertEquals("101-A", updated.getNumber());
        assertEquals("Updated Therapy Room", updated.getName());
    }

    @Test
    void updateCabinet_withNonExistentId_shouldThrowException() {
        CabinetDTO dto = new CabinetDTO();
        dto.setNumber("999");
        dto.setName("Non Existent");

        assertThrows(Exception.class, () -> cabinetService.updateCabinet(999L, dto));
    }

    @Test
    void deleteCabinet_shouldRemoveExistingCabinet() {
        CabinetDTO dto = new CabinetDTO();
        dto.setNumber("999");
        dto.setName("Temp Cabinet");
        CabinetDTO created = cabinetService.createCabinet(dto);

        assertDoesNotThrow(() -> cabinetService.deleteCabinet(created.getId()));
    }

    @Test
    void deleteCabinet_withNonExistentId_shouldThrowException() {
        assertThrows(Exception.class, () -> cabinetService.deleteCabinet(999L));
    }

    @Test
    void cabinetExists_shouldReturnTrueForExisting() {
        assertTrue(cabinetService.cabinetExists("101"));
    }

    @Test
    void cabinetExists_shouldReturnFalseForNonExisting() {
        assertFalse(cabinetService.cabinetExists("NONEXIST"));
    }
}