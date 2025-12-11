package ru.naumen.sanatoriumproject.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import ru.naumen.sanatoriumproject.dtos.NewsCreateDTO;
import ru.naumen.sanatoriumproject.dtos.NewsDTO;
import ru.naumen.sanatoriumproject.models.News;
import ru.naumen.sanatoriumproject.repositories.NewsRepository;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NewsService {
    private final NewsRepository newsRepository;
    private final FileStorageService fileStorageService;

    @Value("${file.allowed-types}")
    private List<String> allowedFileTypes;

    public List<NewsDTO> getAllNews() {
        return newsRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public NewsDTO getNewsById(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found with id: " + id));
        return convertToDto(news);
    }

    public NewsDTO createNews(NewsCreateDTO newsCreateDTO) throws IOException {
        validateFile(newsCreateDTO.getImageFile());

        String fileName = fileStorageService.storeFile(newsCreateDTO.getImageFile());

        News news = new News();
        news.setTitle(newsCreateDTO.getTitle());
        news.setContent(newsCreateDTO.getContent());
        news.setImagePath(fileName);

        News savedNews = newsRepository.save(news);
        return convertToDto(savedNews);
    }

    public NewsDTO updateNews(Long id, NewsCreateDTO newsCreateDTO) throws IOException {
        News existingNews = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found with id: " + id));

        if (newsCreateDTO.getImageFile() != null && !newsCreateDTO.getImageFile().isEmpty()) {
            validateFile(newsCreateDTO.getImageFile());
            String fileName = fileStorageService.storeFile(newsCreateDTO.getImageFile());
            existingNews.setImagePath(fileName);
        }

        existingNews.setTitle(newsCreateDTO.getTitle());
        existingNews.setContent(newsCreateDTO.getContent());

        News updatedNews = newsRepository.save(existingNews);
        return convertToDto(updatedNews);
    }

    public void deleteNews(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found with id: " + id));
        newsRepository.delete(news);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is required");
        }

        if (!allowedFileTypes.contains(file.getContentType())) {
            throw new RuntimeException("Invalid file type. Allowed types: " + allowedFileTypes);
        }
    }

    private NewsDTO convertToDto(News news) {
        NewsDTO dto = new NewsDTO();
        dto.setId(news.getId());
        dto.setTitle(news.getTitle());
        dto.setContent(news.getContent());
        dto.setCreatedAt(news.getCreatedAt());

        String imageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/news/")
                .path(news.getImagePath())
                .toUriString();

        dto.setImageUrl(imageUrl);
        return dto;
    }
}