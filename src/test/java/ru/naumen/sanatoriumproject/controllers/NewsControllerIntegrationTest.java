package ru.naumen.sanatoriumproject.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import ru.naumen.sanatoriumproject.dtos.NewsCreateDTO;
import ru.naumen.sanatoriumproject.dtos.NewsDTO;
import ru.naumen.sanatoriumproject.repositories.RoleRepository;
import ru.naumen.sanatoriumproject.repositories.UserRepository;
import ru.naumen.sanatoriumproject.services.NewsService;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NewsController.class)
@AutoConfigureMockMvc(addFilters = false)
class NewsControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NewsService newsService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private RoleRepository roleRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @Test
    @WithMockUser(roles = "USER")
    void getAllNews_ReturnsNewsList() throws Exception {
        // Given
        NewsDTO news1 = new NewsDTO();
        news1.setId(1L);
        news1.setTitle("Новость 1");
        news1.setContent("Содержание новости 1");
        news1.setImageUrl("/images/news1.jpg");
        news1.setCreatedAt(LocalDateTime.of(2026, 4, 10, 12, 0));

        NewsDTO news2 = new NewsDTO();
        news2.setId(2L);
        news2.setTitle("Новость 2");
        news2.setContent("Содержание новости 2");
        news2.setImageUrl("/images/news2.jpg");
        news2.setCreatedAt(LocalDateTime.of(2026, 4, 11, 14, 0));

        List<NewsDTO> newsList = Arrays.asList(news1, news2);

        when(newsService.getAllNews()).thenReturn(newsList);

        // When & Then
        mockMvc.perform(get("/api/news")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Новость 1"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].title").value("Новость 2"));

        verify(newsService).getAllNews();
    }

    @Test
    @WithMockUser(roles = "USER")
    void getNewsById_ExistingId_ReturnsNews() throws Exception {
        // Given
        NewsDTO news = new NewsDTO();
        news.setId(1L);
        news.setTitle("Тестовая новость");
        news.setContent("Тестовое содержание");
        news.setImageUrl("/images/test.jpg");
        news.setCreatedAt(LocalDateTime.of(2026, 4, 10, 12, 0));

        when(newsService.getNewsById(1L)).thenReturn(news);

        // When & Then
        mockMvc.perform(get("/api/news/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Тестовая новость"))
                .andExpect(jsonPath("$.content").value("Тестовое содержание"));

        verify(newsService).getNewsById(1L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createNews_ValidData_ReturnsOk() throws Exception {
        // Given
        NewsDTO createdNews = new NewsDTO();
        createdNews.setId(1L);
        createdNews.setTitle("Новая новость");
        createdNews.setContent("Содержание новой новости");
        createdNews.setImageUrl("/images/generated.jpg");
        createdNews.setCreatedAt(LocalDateTime.now());

        when(newsService.createNews(any(NewsCreateDTO.class)))
                .thenReturn(createdNews);

        MockMultipartFile image = new MockMultipartFile(
                "imageFile",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        // When & Then — NewsController uses @RequestParam for title, content, imageFile
        mockMvc.perform(multipart("/api/news")
                        .file(image)
                        .param("title", "Новая новость")
                        .param("content", "Содержание новой новости")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Новая новость"));

        verify(newsService).createNews(any(NewsCreateDTO.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createNews_MissingTitle_ReturnsBadRequest() throws Exception {
        // When & Then
        mockMvc.perform(multipart("/api/news")
                        .param("content", "Содержание без заголовка")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest());

        verify(newsService, never()).createNews(any());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteNews_ExistingId_ReturnsNoContent() throws Exception {
        // Given
        doNothing().when(newsService).deleteNews(1L);

        // When & Then
        mockMvc.perform(delete("/api/news/1"))
                .andExpect(status().isNoContent());

        verify(newsService).deleteNews(1L);
    }

}