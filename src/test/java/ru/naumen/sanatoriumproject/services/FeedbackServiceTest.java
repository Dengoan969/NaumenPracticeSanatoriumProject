package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import ru.naumen.sanatoriumproject.dtos.FeedbackMessageDTO;
import ru.naumen.sanatoriumproject.models.FeedbackMessage;
import ru.naumen.sanatoriumproject.models.User;
import ru.naumen.sanatoriumproject.repositories.FeedbackMessageRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeedbackServiceTest {

    @Mock
    private FeedbackMessageRepository feedbackMessageRepository;

    @InjectMocks
    private FeedbackService feedbackService;

    private User testUser;
    private FeedbackMessage testMessage;

    @BeforeEach
    void setUp() {
        testUser = new User("user@test.com", "user1", "pass", "Test User", LocalDate.of(1990, 1, 1));
        testUser.setId(1L);

        testMessage = new FeedbackMessage("Great service!", testUser);
        testMessage.setId(1L);
    }

    @Test
    void createFeedback_shouldCreateSuccessfully() {
        FeedbackMessage savedMessage = new FeedbackMessage("Great service!", testUser);
        savedMessage.setId(1L);

        when(feedbackMessageRepository.save(any(FeedbackMessage.class))).thenReturn(savedMessage);

        FeedbackMessage result = feedbackService.createFeedback("Great service!", testUser);

        assertThat(result.getMessage()).isEqualTo("Great service!");
        verify(feedbackMessageRepository).save(any(FeedbackMessage.class));
    }

    @Test
    void markAsRead_shouldUpdateReadStatus() {
        testMessage.setRead(false);
        when(feedbackMessageRepository.findById(1L)).thenReturn(Optional.of(testMessage));
        when(feedbackMessageRepository.save(any(FeedbackMessage.class))).thenReturn(testMessage);

        FeedbackMessage result = feedbackService.markAsRead(1L);

        assertThat(result.isRead()).isTrue();
        verify(feedbackMessageRepository).save(testMessage);
    }

    @Test
    void markAsRead_shouldThrowWhenNotFound() {
        when(feedbackMessageRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> feedbackService.markAsRead(999L))
                .isInstanceOf(jakarta.persistence.EntityNotFoundException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void deleteFeedback_shouldDeleteSuccessfully() {
        when(feedbackMessageRepository.existsById(1L)).thenReturn(true);

        feedbackService.deleteFeedback(1L);

        verify(feedbackMessageRepository).deleteById(1L);
    }

    @Test
    void deleteFeedback_shouldThrowWhenNotFound() {
        when(feedbackMessageRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> feedbackService.deleteFeedback(999L))
                .isInstanceOf(jakarta.persistence.EntityNotFoundException.class)
                .hasMessageContaining("not found");
    }
}
