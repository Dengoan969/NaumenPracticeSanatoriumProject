package ru.naumen.sanatoriumproject.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import ru.naumen.sanatoriumproject.models.FeedbackMessage;
import ru.naumen.sanatoriumproject.repositories.FeedbackMessageRepository;

@Service
@RequiredArgsConstructor
public class FeedbackService {
    private final FeedbackMessageRepository feedbackMessageRepository;

    public FeedbackMessage createFeedback(String message, User user) {
        FeedbackMessage feedbackMessage = new FeedbackMessage(message, user);
        return feedbackMessageRepository.save(feedbackMessage);
    }

    public FeedbackMessage markAsRead(Long id) {
        FeedbackMessage message = feedbackMessageRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Feedback message not found with id: " + id));

        message.setRead(true);
        return feedbackMessageRepository.save(message);
    }

    public void deleteFeedback(Long id) {
        if (!feedbackMessageRepository.existsById(id)) {
            throw new EntityNotFoundException("Feedback message not found with id: " + id);
        }
        feedbackMessageRepository.deleteById(id);
    }
}