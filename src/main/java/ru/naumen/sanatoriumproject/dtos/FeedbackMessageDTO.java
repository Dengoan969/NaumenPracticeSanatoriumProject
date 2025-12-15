package ru.naumen.sanatoriumproject.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FeedbackMessageDTO {
    private Long id;
    private String message;
    private Long userId;
    private String userFullName;
    private LocalDateTime createdAt;
    private boolean isRead;
}