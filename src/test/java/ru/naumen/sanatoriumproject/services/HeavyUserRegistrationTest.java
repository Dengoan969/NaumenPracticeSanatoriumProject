package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import ru.naumen.sanatoriumproject.dtos.RegistrationDTO;
import ru.naumen.sanatoriumproject.dtos.ShiftDTO;
import ru.naumen.sanatoriumproject.dtos.UserDTO;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Sql(scripts = "/sql/cleanup.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@Sql(scripts = "/sql/test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class HeavyUserRegistrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private ShiftService shiftService;

    @Autowired
    private RegistrationService registrationService;

    private ShiftDTO targetShift;
    private List<Long> createdUserIds;

    @BeforeEach
    void setUp() {
        ShiftDTO dto = new ShiftDTO();
        dto.setName("Heavy Test Shift");
        dto.setStartDate(LocalDate.of(2026, 6, 1));
        dto.setEndDate(LocalDate.of(2026, 6, 21));
        dto.setActive(true);
        dto.setDescription("Shift for heavy registration tests");
        targetShift = shiftService.createShift(dto);
        createdUserIds = new ArrayList<>();
    }

    @ParameterizedTest
    @ValueSource(ints = {50, 100, 150})
    void bulkCreateUsers_shouldCreateAllUsers(int count) {
        List<UserDTO> createdUsers = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            UserDTO dto = new UserDTO();
            dto.setEmail("heavy_user_" + i + "_" + System.nanoTime() + "@test.com");
            dto.setLogin("hu_" + i + "_" + (System.nanoTime() % 100000));
            dto.setPassword("password123");
            dto.setFullName("Heavy User");
            dto.setBirthDate(LocalDate.of(1990 + (i % 30), 1 + (i % 12), 1 + (i % 28)));
            dto.setPhone("+7-999-" + String.format("%03d-%04d", i / 1000, i % 10000));
            UserDTO created = userService.createUser(dto);
            assertNotNull(created);
            assertNotNull(created.getId());
            createdUsers.add(created);
            createdUserIds.add(created.getId());
        }
        assertEquals(count, createdUsers.size());
        long distinctIds = createdUsers.stream().map(UserDTO::getId).distinct().count();
        assertEquals(count, distinctIds);
        long distinctEmails = createdUsers.stream().map(UserDTO::getEmail).distinct().count();
        assertEquals(count, distinctEmails);
    }

    @Test
    void bulkCreateUsers_withDuplicateEmails_shouldThrowForEach() {
        UserDTO dto = new UserDTO();
        dto.setEmail("duplicate_test@test.com");
        dto.setLogin("dup_login_" + (System.nanoTime() % 100000));
        dto.setPassword("password123");
        dto.setFullName("Original User");
        dto.setBirthDate(LocalDate.of(2000, 1, 1));
        userService.createUser(dto);
        int errorCount = 0;
        for (int i = 0; i < 20; i++) {
            UserDTO dup = new UserDTO();
            dup.setEmail("duplicate_test@test.com");
            dup.setLogin("uniq_" + i + "_" + (System.nanoTime() % 100000));
            dup.setPassword("password123");
            dup.setFullName("Duplicate User");
            dup.setBirthDate(LocalDate.of(2000, 1, 1));
            try {
                userService.createUser(dup);
            } catch (Exception e) {
                errorCount++;
            }
        }
        assertEquals(20, errorCount);
    }

    @Test
    void bulkRegisterUsersOnShift_shouldRegisterAll() {
        List<UserDTO> users = new ArrayList<>();
        for (int i = 0; i < 50; i++) {
            UserDTO dto = new UserDTO();
            dto.setEmail("reg_user_" + i + "_" + System.nanoTime() + "@test.com");
            dto.setLogin("reg_" + i + "_" + (System.nanoTime() % 100000));
            dto.setPassword("password123");
            dto.setFullName("Registration User");
            dto.setBirthDate(LocalDate.of(1990, 1, 1));
            UserDTO created = userService.createUser(dto);
            users.add(created);
            createdUserIds.add(created.getId());
        }
        List<RegistrationDTO> registrations = new ArrayList<>();
        for (UserDTO user : users) {
            RegistrationDTO regDto = new RegistrationDTO();
            regDto.setUserId(user.getId());
            regDto.setShiftId(targetShift.getId());
            regDto.setCheckInDate(targetShift.getStartDate());
            regDto.setCheckOutDate(targetShift.getEndDate());
            RegistrationDTO reg = registrationService.registerUser(regDto);
            assertNotNull(reg);
            registrations.add(reg);
        }
        assertEquals(50, registrations.size());
        List<RegistrationDTO> fetched = registrationService.getRegistrationsByShift(targetShift.getId());
        assertEquals(50, fetched.size());
        long distinctUserIds = fetched.stream().map(RegistrationDTO::getUserId).distinct().count();
        assertEquals(50, distinctUserIds);
    }

    @Test
    void bulkRegisterAndUnregister_shouldHandleCorrectly() {
        List<UserDTO> users = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            UserDTO dto = new UserDTO();
            dto.setEmail("bulk_reg_" + i + "_" + System.nanoTime() + "@test.com");
            dto.setLogin("br_" + i + "_" + (System.nanoTime() % 100000));
            dto.setPassword("password123");
            dto.setFullName("Bulk User");
            dto.setBirthDate(LocalDate.of(1990, 1, 1));
            UserDTO created = userService.createUser(dto);
            users.add(created);
            createdUserIds.add(created.getId());
        }
        for (UserDTO user : users) {
            RegistrationDTO regDto = new RegistrationDTO();
            regDto.setUserId(user.getId());
            regDto.setShiftId(targetShift.getId());
            regDto.setCheckInDate(targetShift.getStartDate());
            regDto.setCheckOutDate(targetShift.getEndDate());
            registrationService.registerUser(regDto);
        }
        assertEquals(30, registrationService.getRegistrationsByShift(targetShift.getId()).size());
        for (int i = 0; i < users.size(); i += 2) {
            registrationService.unregisterUser(users.get(i).getId(), targetShift.getId());
        }
        List<RegistrationDTO> remaining = registrationService.getRegistrationsByShift(targetShift.getId());
        assertEquals(15, remaining.size());
        for (int i = 0; i < users.size(); i += 2) {
            Long unregisteredId = users.get(i).getId();
            boolean stillRegistered = remaining.stream().anyMatch(r -> r.getUserId().equals(unregisteredId));
            assertFalse(stillRegistered);
        }
    }

    @Test
    void concurrentRegistration_shouldHandleThreadSafety() throws InterruptedException {
        List<UserDTO> users = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            UserDTO dto = new UserDTO();
            dto.setEmail("concurrent_" + i + "_" + System.nanoTime() + "@test.com");
            dto.setLogin("cr_" + i + "_" + (System.nanoTime() % 100000));
            dto.setPassword("password123");
            dto.setFullName("Concurrent User");
            dto.setBirthDate(LocalDate.of(1990, 1, 1));
            UserDTO created = userService.createUser(dto);
            users.add(created);
            createdUserIds.add(created.getId());
        }
        int threadCount = 4;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        ConcurrentHashMap<Long, Boolean> results = new ConcurrentHashMap<>();
        AtomicInteger errors = new AtomicInteger(0);
        for (UserDTO user : users) {
            Long userId = user.getId();
            executor.submit(() -> {
                try {
                    RegistrationDTO regDto = new RegistrationDTO();
                    regDto.setUserId(userId);
                    regDto.setShiftId(targetShift.getId());
                    regDto.setCheckInDate(targetShift.getStartDate());
                    regDto.setCheckOutDate(targetShift.getEndDate());
                    RegistrationDTO reg = registrationService.registerUser(regDto);
                    results.put(userId, reg != null);
                } catch (Exception e) {
                    errors.incrementAndGet();
                }
            });
        }
        executor.shutdown();
        boolean finished = executor.awaitTermination(30, TimeUnit.SECONDS);
        assertTrue(finished);
        assertEquals(0, errors.get());
        assertEquals(20, results.size());
        List<RegistrationDTO> fetched = registrationService.getRegistrationsByShift(targetShift.getId());
        assertEquals(20, fetched.size());
    }

    @Test
    void bulkCreateUsers_withPagination_shouldReturnCorrectCounts() {
        for (int i = 0; i < 75; i++) {
            UserDTO dto = new UserDTO();
            dto.setEmail("page_user_" + i + "_" + System.nanoTime() + "@test.com");
            dto.setLogin("pu_" + i + "_" + (System.nanoTime() % 100000));
            dto.setPassword("password123");
            dto.setFullName("Page User");
            dto.setBirthDate(LocalDate.of(1990, 1, 1));
            UserDTO created = userService.createUser(dto);
            createdUserIds.add(created.getId());
        }
        List<UserDTO> regularUsers = userService.getRegularUsers();
        assertTrue(regularUsers.size() >= 75);
    }
}