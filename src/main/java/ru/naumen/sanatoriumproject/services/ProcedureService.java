package ru.naumen.sanatoriumproject.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.sanatoriumproject.dtos.ProcedureDTO;
import ru.naumen.sanatoriumproject.models.Cabinet;
import ru.naumen.sanatoriumproject.models.Procedure;
import ru.naumen.sanatoriumproject.repositories.CabinetRepository;
import ru.naumen.sanatoriumproject.repositories.ProcedureRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProcedureService {
    private final ProcedureRepository procedureRepository;
    private final CabinetRepository cabinetRepository;

    public List<ProcedureDTO> getAllProcedures() {
        return procedureRepository.findAllByOrderByNameAsc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ProcedureDTO getProcedureById(Long id) {
        Procedure procedure = procedureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Procedure not found"));
        return convertToDto(procedure);
    }

    public List<ProcedureDTO> getProceduresByCabinet(Long cabinetId) {
        return procedureRepository.findByCabinetId(cabinetId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProcedureDTO createProcedure(ProcedureDTO procedureDTO) {
        Cabinet cabinet = cabinetRepository.findById(procedureDTO.getCabinetId())
                .orElseThrow(() -> new RuntimeException("Cabinet not found"));

        Procedure procedure = new Procedure();
        procedure.setName(procedureDTO.getName());
        procedure.setCabinet(cabinet);
        procedure.setDefaultDuration(procedureDTO.getDefaultDuration());

        Procedure savedProcedure = procedureRepository.save(procedure);
        return convertToDto(savedProcedure);
    }

    @Transactional
    public ProcedureDTO updateProcedure(Long id, ProcedureDTO procedureDTO) {
        Procedure procedure = procedureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Procedure not found"));

        Cabinet cabinet = cabinetRepository.findById(procedureDTO.getCabinetId())
                .orElseThrow(() -> new RuntimeException("Cabinet not found"));

        procedure.setName(procedureDTO.getName());
        procedure.setCabinet(cabinet);
        procedure.setDefaultDuration(procedureDTO.getDefaultDuration());

        Procedure updatedProcedure = procedureRepository.save(procedure);
        return convertToDto(updatedProcedure);
    }

    @Transactional
    public void deleteProcedure(Long id) {
        if (!procedureRepository.existsById(id)) {
            throw new RuntimeException("Procedure not found");
        }
        procedureRepository.deleteById(id);
    }

    private ProcedureDTO convertToDto(Procedure procedure) {
        ProcedureDTO dto = new ProcedureDTO();
        dto.setId(procedure.getId());
        dto.setName(procedure.getName());
        dto.setCabinetId(procedure.getCabinet().getId());
        dto.setCabinetNumber(procedure.getCabinet().getNumber());
        dto.setDefaultDuration(procedure.getDefaultDuration());
        dto.setCabinetName(procedure.getCabinet().getName());
        return dto;
    }
}