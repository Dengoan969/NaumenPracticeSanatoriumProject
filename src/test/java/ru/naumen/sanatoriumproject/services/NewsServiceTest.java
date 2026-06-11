package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import ru.naumen.sanatoriumproject.dtos.NewsCreateDTO;
import ru.naumen.sanatoriumproject.dtos.NewsDTO;
import ru.naumen.sanatoriumproject.models.News;
import ru.naumen.sanatoriumproject.repositories.NewsRepository;

import java.io.IOException;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NewsServiceTest {

    @Mock
    private NewsRepository newsRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private NewsService newsService;

    private News testNews;
    private MockedStatic<ServletUriComponentsBuilder> uriBuilderMock;

    @BeforeEach
    void setUp() {
        testNews = new News();
        testNews.setId(1L);
        testNews.setTitle("Test News");
        testNews.setContent("Test content");
        testNews.setImagePath("test.jpg");
        testNews.setCreatedAt(LocalDateTime.of(2026, 4, 10, 12, 0));

        ReflectionTestUtils.setField(newsService, "allowedFileTypes",
                List.of("image/jpeg", "image/png", "image/gif"));

        // Mock ServletUriComponentsBuilder to avoid "No current ServletRequestAttributes"
        // Using lenient() so tests that don't call convertToDto() don't fail with UnnecessaryStubbing
        uriBuilderMock = mockStatic(ServletUriComponentsBuilder.class);
        ServletUriComponentsBuilder builder = mock(ServletUriComponentsBuilder.class);
        lenient().when(ServletUriComponentsBuilder.fromCurrentContextPath()).thenReturn(builder);
        lenient().when(builder.path(anyString())).thenReturn(builder);
        lenient().when(builder.toUriString()).thenReturn("http://localhost/uploads/news/test.jpg");
    }

    @AfterEach
    void tearDown() {
        if (uriBuilderMock != null) {
            uriBuilderMock.close();
        }
    }

    @Test
    void getAllNews_shouldReturnSortedList() {
        when(newsRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(testNews));

        List<NewsDTO> result = newsService.getAllNews();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Test News");
    }

    @Test
    void getNewsById_shouldReturnNews() {
        when(newsRepository.findById(1L)).thenReturn(Optional.of(testNews));

        NewsDTO result = newsService.getNewsById(1L);

        assertThat(result.getTitle()).isEqualTo("Test News");
        assertThat(result.getContent()).isEqualTo("Test content");
    }

    @Test
    void getNewsById_shouldThrowWhenNotFound() {
        when(newsRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> newsService.getNewsById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("News not found");
    }

    @Test
    void createNews_shouldCreateSuccessfully() throws IOException {
        MockMultipartFile file = new MockMultipartFile("image", "test.jpg", "image/jpeg", "data".getBytes());
        NewsCreateDTO dto = new NewsCreateDTO();
        dto.setTitle("New News");
        dto.setContent("New content");
        dto.setImageFile(file);

        when(fileStorageService.storeFile(file)).thenReturn("test.jpg");
        when(newsRepository.save(any(News.class))).thenAnswer(inv -> {
            News n = inv.getArgument(0);
            n.setId(1L);
            n.setCreatedAt(LocalDateTime.now());
            return n;
        });

        NewsDTO result = newsService.createNews(dto);

        verify(fileStorageService).storeFile(file);
        verify(newsRepository).save(any(News.class));
        assertThat(result.getTitle()).isEqualTo("New News");
    }

    @Test
    void createNews_shouldThrowOnInvalidFileType() {
        MockMultipartFile file = new MockMultipartFile("image", "test.pdf", "application/pdf", "data".getBytes());
        NewsCreateDTO dto = new NewsCreateDTO();
        dto.setTitle("Bad News");
        dto.setContent("Bad content");
        dto.setImageFile(file);

        assertThatThrownBy(() -> newsService.createNews(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid file type");
    }

    @Test
    void deleteNews_shouldDeleteSuccessfully() {
        when(newsRepository.findById(1L)).thenReturn(Optional.of(testNews));

        newsService.deleteNews(1L);

        verify(newsRepository).delete(testNews);
    }

    @Test
    void deleteNews_shouldThrowWhenNotFound() {
        when(newsRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> newsService.deleteNews(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("News not found");
    }
}
