package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    private FileStorageService fileStorageService;

    @BeforeEach
    void setUp() {
        fileStorageService = new FileStorageService();
        ReflectionTestUtils.setField(fileStorageService, "uploadDir", tempDir.toString());
    }

    @Test
    void storeFile_ValidImage_Success() throws IOException {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        // When
        String storedFileName = fileStorageService.storeFile(file);

        // Then
        assertThat(storedFileName).isNotNull();
        assertThat(storedFileName).endsWith(".jpg");
        assertThat(Files.exists(tempDir.resolve(storedFileName))).isTrue();
    }

    @Test
    void storeFile_EmptyFile_ReturnsFileName() throws IOException {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );

        // When — FileStorageService doesn't validate emptiness,
        // it copies the empty input stream (0 bytes) successfully
        String storedFileName = fileStorageService.storeFile(file);

        // Then
        assertThat(storedFileName).isNotNull();
        assertThat(storedFileName).endsWith(".jpg");
    }

    @Test
    void loadFile_ExistingFile_ReturnsPath() throws IOException {
        // Given
        Path testFile = tempDir.resolve("test-file.jpg");
        Files.write(testFile, "test content".getBytes());

        // When
        Path result = fileStorageService.loadFile("test-file.jpg");

        // Then
        assertThat(result).isEqualTo(testFile);
    }

    @Test
    void loadFile_NonExistentFile_ReturnsPath() {
        // When
        Path result = fileStorageService.loadFile("non-existent.jpg");

        // Then
        assertThat(result).isEqualTo(tempDir.resolve("non-existent.jpg"));
    }

    @Test
    void storeFile_GeneratesUniqueFileName() throws IOException {
        // Given
        MockMultipartFile file1 = new MockMultipartFile(
                "file",
                "photo.jpg",
                "image/jpeg",
                "content1".getBytes()
        );
        MockMultipartFile file2 = new MockMultipartFile(
                "file",
                "photo.jpg",
                "image/jpeg",
                "content2".getBytes()
        );

        // When
        String name1 = fileStorageService.storeFile(file1);
        String name2 = fileStorageService.storeFile(file2);

        // Then
        assertThat(name1).isNotEqualTo(name2);
        assertThat(name1).endsWith(".jpg");
        assertThat(name2).endsWith(".jpg");
    }
}