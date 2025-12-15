package ru.naumen.sanatoriumproject.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.sanatoriumproject.dtos.CabinetDTO;
import ru.naumen.sanatoriumproject.models.Cabinet;
import ru.naumen.sanatoriumproject.repositories.CabinetRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CabinetService {
    private final CabinetRepository cabinetRepository;

    public List<CabinetDTO> getAllCabinets() {
        return cabinetRepository.findAllByOrderByNumberAsc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public CabinetDTO getCabinetById(Long id) {
        Cabinet cabinet = cabinetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cabinet not found"));
        return convertToDto(cabinet);
    }

    @Transactional
    public CabinetDTO createCabinet(CabinetDTO cabinetDTO) {
        if (cabinetRepository.existsByNumber(cabinetDTO.getNumber())) {
            throw new RuntimeException("Cabinet with this number already exists");
        }

        Cabinet cabinet = new Cabinet();
        cabinet.setNumber(cabinetDTO.getNumber());
        cabinet.setName(cabinetDTO.getName());
        Cabinet savedCabinet = cabinetRepository.save(cabinet);
        return convertToDto(savedCabinet);
    }

    @Transactional
    public CabinetDTO updateCabinet(Long id, CabinetDTO cabinetDTO) {
        Cabinet cabinet = cabinetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cabinet not found"));

        if (!cabinet.getNumber().equals(cabinetDTO.getNumber()) &&
                cabinetRepository.existsByNumber(cabinetDTO.getNumber())) {
            throw new RuntimeException("Cabinet with this number already exists");
        }

        cabinet.setNumber(cabinetDTO.getNumber());
        cabinet.setName(cabinetDTO.getName());
        Cabinet updatedCabinet = cabinetRepository.save(cabinet);
        return convertToDto(updatedCabinet);
    }

    @Transactional
    public void deleteCabinet(Long id) {
        if (!cabinetRepository.existsById(id)) {
            throw new RuntimeException("Cabinet not found");
        }
        cabinetRepository.deleteById(id);
    }

    public boolean cabinetExists(String number) {
        return cabinetRepository.existsByNumber(number);
    }

    private CabinetDTO convertToDto(Cabinet cabinet) {
        CabinetDTO dto = new CabinetDTO();
        dto.setId(cabinet.getId());
        dto.setNumber(cabinet.getNumber());
        dto.setName(cabinet.getName());
        return dto;
    }
}