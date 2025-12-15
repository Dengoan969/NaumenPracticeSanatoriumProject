package ru.naumen.sanatoriumproject.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.naumen.sanatoriumproject.models.FeedbackMessage;

import java.util.List;

@Repository
public interface FeedbackMessageRepository extends JpaRepository<FeedbackMessage, Long> {
    List<FeedbackMessage> findByIsReadFalseOrderByCreatedAtDesc();
    List<FeedbackMessage> findAllByOrderByCreatedAtDesc();
}