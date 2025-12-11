package ru.naumen.sanatoriumproject.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.naumen.sanatoriumproject.dtos.NewsCreateDTO;
import ru.naumen.sanatoriumproject.dtos.NewsDTO;
import ru.naumen.sanatoriumproject.services.NewsService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {
    private final NewsService newsService;

    @GetMapping
    public ResponseEntity<List<NewsDTO>> getAllNews() {
        return ResponseEntity.ok(newsService.getAllNews());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsDTO> getNewsById(@PathVariable Long id) {
        return ResponseEntity.ok(newsService.getNewsById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NewsDTO> createNews(
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam MultipartFile imageFile) throws IOException {

        NewsCreateDTO newsCreateDTO = new NewsCreateDTO();
        newsCreateDTO.setTitle(title);
        newsCreateDTO.setContent(content);
        newsCreateDTO.setImageFile(imageFile);

        return ResponseEntity.ok(newsService.createNews(newsCreateDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NewsDTO> updateNews(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(required = false) MultipartFile imageFile) throws IOException {

        NewsCreateDTO newsCreateDTO = new NewsCreateDTO();
        newsCreateDTO.setTitle(title);
        newsCreateDTO.setContent(content);
        newsCreateDTO.setImageFile(imageFile);

        return ResponseEntity.ok(newsService.updateNews(id, newsCreateDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteNews(@PathVariable Long id) {
        newsService.deleteNews(id);
        return ResponseEntity.noContent().build();
    }
}