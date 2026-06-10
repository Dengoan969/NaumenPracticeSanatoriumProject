package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import ru.naumen.sanatoriumproject.dtos.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Sql(scripts = "/sql/cleanup.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@Sql(scripts = "/sql/test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class HeavyAppointmentSchedulingTest {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserService userService;

    @Autowired
    private ShiftService shiftService;

    @Autowired
    private CabinetService cabinetService;

    @Autowired
    private RegistrationService registrationService;

    private ShiftDTO testShift;
    private UserDTO doctor;
    private UserDTO nurse;
    private List<UserDTO> students;
    private List<CabinetDTO> cabinets;

    @BeforeEach
    void setUp() {
        ShiftDTO shiftDto = new ShiftDTO();
        shiftDto.setName("Heavy Appointment Shift");
        shiftDto.setStartDate(LocalDate.of(2026, 7, 1));
        shiftDto.setEndDate(LocalDate.of(2026, 7, 21));
        shiftDto.setActive(true);
        shiftDto.setDescription("Shift for heavy appointment tests");
        testShift = shiftService.createShift(shiftDto);

        UserDTO docDto = new UserDTO();
        docDto.setEmail("heavy_doctor_" + System.nanoTime() + "@test.com");
        docDto.setLogin("h_doc_" + (System.nanoTime() % 100000));
        docDto.setPassword("password123");
        docDto.setFullName("Heavy Doctor");
        docDto.setBirthDate(LocalDate.of(1980, 1, 1));
        doctor = userService.createUser(docDto);

        UserDTO nurseDto = new UserDTO();
        nurseDto.setEmail("heavy_nurse_" + System.nanoTime() + "@test.com");
        nurseDto.setLogin("h_nurse_" + (System.nanoTime() % 100000));
        nurseDto.setPassword("password123");
        nurseDto.setFullName("Heavy Nurse");
        nurseDto.setBirthDate(LocalDate.of(1985, 1, 1));
        nurse = userService.createUser(nurseDto);

        students = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            UserDTO studentDto = new UserDTO();
            studentDto.setEmail("heavy_student_" + i + "_" + System.nanoTime() + "@test.com");
            studentDto.setLogin("hs_" + i + "_" + (System.nanoTime() % 100000));
            studentDto.setPassword("password123");
            studentDto.setFullName("Heavy Student");
            studentDto.setBirthDate(LocalDate.of(2000 + (i % 10), 1 + (i % 12), 1 + (i % 28)));
            UserDTO student = userService.createUser(studentDto);
            students.add(student);
            RegistrationDTO regDto = new RegistrationDTO();
            regDto.setUserId(student.getId());
            regDto.setShiftId(testShift.getId());
            regDto.setCheckInDate(testShift.getStartDate());
            regDto.setCheckOutDate(testShift.getEndDate());
            registrationService.registerUser(regDto);
        }
        cabinets = cabinetService.getAllCabinets();
    }

    @ParameterizedTest
    @CsvSource({
            "50,  1,  1",
            "100, 2,  1",
            "150, 3,  1"
    })
    void bulkCreateAppointments_shouldCreateAll(int count, int cabinetIndex, int procedureId) {
        List<AppointmentDTO> created = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            AppointmentDTO dto = new AppointmentDTO();
            dto.setProcedureId((long) (1 + (i % 8)));
            dto.setStudentId(students.get(i % students.size()).getId());
            dto.setDoctorId(doctor.getId());
            dto.setShiftId(testShift.getId());
            dto.setAppointmentDate(testShift.getStartDate().plusDays(i % 20));
            dto.setNotes("Bulk appointment #" + i);
            AppointmentDTO appointment = appointmentService.createAppointment(dto);
            assertNotNull(appointment);
            assertNotNull(appointment.getId());
            created.add(appointment);
        }
        assertEquals(count, created.size());
        List<AppointmentDTO> byShift = appointmentService.getAppointmentsByShift(testShift.getId());
        assertEquals(count, byShift.size());
        long distinctIds = created.stream().map(AppointmentDTO::getId).distinct().count();
        assertEquals(count, distinctIds);
    }

    @Test
    void bulkCreateAppointments_withFiltering_shouldReturnCorrectSubsets() {
        List<AppointmentDTO> allAppointments = new ArrayList<>();
        for (int i = 0; i < 80; i++) {
            AppointmentDTO dto = new AppointmentDTO();
            dto.setProcedureId((long) (1 + (i % 8)));
            dto.setStudentId(students.get(i % students.size()).getId());
            dto.setDoctorId(doctor.getId());
            dto.setShiftId(testShift.getId());
            dto.setAppointmentDate(testShift.getStartDate().plusDays(i % 20));
            dto.setNotes("Filter test appointment #" + i);
            allAppointments.add(appointmentService.createAppointment(dto));
        }
        Long firstStudentId = students.get(0).getId();
        List<AppointmentDTO> byStudent = appointmentService.getAppointmentsByStudent(firstStudentId);
        int expectedForStudent = 80 / students.size();
        assertEquals(expectedForStudent, byStudent.size());
        byStudent.forEach(a -> assertEquals(firstStudentId, a.getStudentId()));
        List<AppointmentDTO> byStudentAndShift = appointmentService.getAppointmentsByStudentAndShift(
                firstStudentId, testShift.getId());
        assertEquals(expectedForStudent, byStudentAndShift.size());
        byStudentAndShift.forEach(a -> {
            assertEquals(firstStudentId, a.getStudentId());
            assertEquals(testShift.getId(), a.getShiftId());
        });
        if (!cabinets.isEmpty()) {
            Long firstCabinetId = cabinets.get(0).getId();
            List<AppointmentDTO> byShiftAndCabinet = appointmentService.getAppointmentsByShiftAndCabinet(
                    testShift.getId(), firstCabinetId);
            assertNotNull(byShiftAndCabinet);
            byShiftAndCabinet.forEach(a -> assertEquals(testShift.getId(), a.getShiftId()));
        }
    }

    @Test
    void bulkCreateAndUpdateNotes_shouldModifyAll() {
        List<AppointmentDTO> created = new ArrayList<>();
        for (int i = 0; i < 60; i++) {
            AppointmentDTO dto = new AppointmentDTO();
            dto.setProcedureId((long) (1 + (i % 8)));
            dto.setStudentId(students.get(i % students.size()).getId());
            dto.setDoctorId(doctor.getId());
            dto.setShiftId(testShift.getId());
            dto.setAppointmentDate(testShift.getStartDate().plusDays(i % 20));
            dto.setNotes("Original note #" + i);
            created.add(appointmentService.createAppointment(dto));
        }
        for (int i = 0; i < created.size(); i++) {
            AppointmentDTO updated = appointmentService.updateAppointmentNote(
                    created.get(i).getId(), "Updated note #" + i);
            assertNotNull(updated);
            assertEquals("Updated note #" + i, updated.getNotes());
        }
        List<AppointmentDTO> byShift = appointmentService.getAppointmentsByShift(testShift.getId());
        assertEquals(60, byShift.size());
        byShift.forEach(a -> assertTrue(a.getNotes().startsWith("Updated note")));
    }

    @Test
    void bulkDeleteAppointments_shouldRemoveAll() {
        List<Long> ids = new ArrayList<>();
        for (int i = 0; i < 40; i++) {
            AppointmentDTO dto = new AppointmentDTO();
            dto.setProcedureId((long) (1 + (i % 8)));
            dto.setStudentId(students.get(i % students.size()).getId());
            dto.setDoctorId(doctor.getId());
            dto.setShiftId(testShift.getId());
            dto.setAppointmentDate(testShift.getStartDate().plusDays(i % 20));
            dto.setNotes("To be deleted #" + i);
            AppointmentDTO created = appointmentService.createAppointment(dto);
            ids.add(created.getId());
        }
        for (Long id : ids) {
            assertDoesNotThrow(() -> appointmentService.deleteAppointment(id));
        }
        List<AppointmentDTO> remaining = appointmentService.getAppointmentsByShift(testShift.getId());
        assertTrue(remaining.isEmpty());
    }

    @Test
    void createAppointments_withDifferentDates_shouldPreserveDates() {
        List<LocalDate> dates = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            LocalDate date = testShift.getStartDate().plusDays(i);
            dates.add(date);
            AppointmentDTO dto = new AppointmentDTO();
            dto.setProcedureId((long) (1 + (i % 8)));
            dto.setStudentId(students.get(i % students.size()).getId());
            dto.setDoctorId(doctor.getId());
            dto.setShiftId(testShift.getId());
            dto.setAppointmentDate(date);
            dto.setNotes("Date test #" + i);
            AppointmentDTO created = appointmentService.createAppointment(dto);
            assertEquals(date, created.getAppointmentDate());
        }
        List<AppointmentDTO> byShift = appointmentService.getAppointmentsByShift(testShift.getId());
        assertEquals(30, byShift.size());
        List<LocalDate> savedDates = byShift.stream()
                .map(AppointmentDTO::getAppointmentDate)
                .distinct()
                .sorted()
                .toList();
        assertEquals(30, savedDates.size());
    }

    @Test
    void createAppointments_withNonExistentReferences_shouldThrow() {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setProcedureId(999L);
        dto.setStudentId(students.get(0).getId());
        dto.setDoctorId(doctor.getId());
        dto.setShiftId(testShift.getId());
        dto.setAppointmentDate(testShift.getStartDate());
        dto.setNotes("Should fail");
        assertThrows(Exception.class, () -> appointmentService.createAppointment(dto));
    }
}