package ru.naumen.sanatoriumproject.dtos;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class NewsCreateDTO {
    private String title;
    private String content;
    private MultipartFile imageFile;
}
