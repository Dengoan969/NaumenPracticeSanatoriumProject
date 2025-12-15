package ru.naumen.sanatoriumproject.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ru.naumen.sanatoriumproject.dtos.FeedbackMessageDTO;
import ru.naumen.sanatoriumproject.models.FeedbackMessage;
import ru.naumen.sanatoriumproject.models.User;
import ru.naumen.sanatoriumproject.repositories.FeedbackMessageRepository;
import ru.naumen.sanatoriumproject.repositories.UserRepository;
import ru.naumen.sanatoriumproject.services.FeedbackService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {
    private final FeedbackService feedbackService;
    private final FeedbackMessageRepository feedbackMessageRepository;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FeedbackMessageDTO> createFeedback(@RequestBody FeedbackMessageDTO feedbackMessageDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userRepository.findByLogin(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FeedbackMessage createdMessage = feedbackService.createFeedback(feedbackMessageDTO.getMessage(), user);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(createdMessage));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<FeedbackMessageDTO> getAllFeedback() {
        return feedbackMessageRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/unread")
    @PreAuthorize("hasRole('ADMIN')")
    public List<FeedbackMessageDTO> getUnreadFeedback() {
        return feedbackMessageRepository.findByIsReadFalseOrderByCreatedAtDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeedbackMessageDTO> markAsRead(@PathVariable Long id) {
        FeedbackMessage updatedMessage = feedbackService.markAsRead(id);
        return ResponseEntity.ok(convertToDto(updatedMessage));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }

    private FeedbackMessageDTO convertToDto(FeedbackMessage message) {
        FeedbackMessageDTO dto = new FeedbackMessageDTO();
        dto.setId(message.getId());
        dto.setMessage(message.getMessage());
        dto.setUserId(message.getUser().getId());
        dto.setUserFullName(message.getUser().getFullName());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setRead(message.isRead());
        return dto;
    }
}