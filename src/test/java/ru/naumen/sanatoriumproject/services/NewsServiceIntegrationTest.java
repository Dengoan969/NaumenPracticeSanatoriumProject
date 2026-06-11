package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import ru.naumen.sanatoriumproject.dtos.NewsDTO;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Sql(scripts = "/sql/cleanup.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@Sql(scripts = "/sql/test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class NewsServiceIntegrationTest {

    @Autowired
    private NewsService newsService;

    @Test
    void getAllNews_shouldReturnAllNews() {
        List<NewsDTO> newsList = newsService.getAllNews();
        assertNotNull(newsList);
        assertEquals(5, newsList.size());
    }

    @Test
    void getNewsById_shouldReturnExistingNews() {
        NewsDTO news = newsService.getNewsById(1L);
        assertNotNull(news);
        assertEquals("Welcome to Summer Season", news.getTitle());
        assertNotNull(news.getCreatedAt());
    }

    @Test
    void getNewsById_withNonExistentId_shouldThrowException() {
        assertThrows(Exception.class, () -> newsService.getNewsById(999L));
    }

    @Test
    void deleteNews_shouldRemoveExistingNews() {
        assertDoesNotThrow(() -> newsService.deleteNews(1L));
        List<NewsDTO> newsList = newsService.getAllNews();
        assertEquals(4, newsList.size());
    }

    @Test
    void deleteNews_withNonExistentId_shouldThrowException() {
        assertThrows(Exception.class, () -> newsService.deleteNews(999L));
    }

    @Test
    void getAllNews_shouldReturnNewsInReverseChronologicalOrder() {
        List<NewsDTO> newsList = newsService.getAllNews();
        assertEquals(5, newsList.size());
        // The latest news (id=5) should be first
        assertEquals("New Dietary Options", newsList.get(0).getTitle());
    }
}
