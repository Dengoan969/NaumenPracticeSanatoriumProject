package ru.naumen.sanatoriumproject.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import ru.naumen.sanatoriumproject.dtos.AppointmentDTO;
import ru.naumen.sanatoriumproject.dtos.CabinetDTO;
import ru.naumen.sanatoriumproject.dtos.ProcedureCompletionDTO;
import ru.naumen.sanatoriumproject.dtos.RegistrationDTO;
import ru.naumen.sanatoriumproject.dtos.ShiftDTO;
import ru.naumen.sanatoriumproject.dtos.UserDTO;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Sql(scripts = "/sql/cleanup.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@Sql(scripts = "/sql/test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class HeavyDataConsistencyTest {

    @Autowired
    private UserService userService;

    @Autowired
    private ShiftService shiftService;

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private CabinetService cabinetService;

    @Autowired
    private ProcedureCompletionService completionService;

    @Autowired
    private StaffCabinetService staffCabinetService;

    private ShiftDTO shift;
    private UserDTO doctor;
    private UserDTO nurse;
    private List<UserDTO> students;
    private List<CabinetDTO> cabinets;

    @BeforeEach
    void setUp() {
        ShiftDTO sdto = new ShiftDTO();
        sdto.setName("Consistency Shift");
        sdto.setStartDate(LocalDate.of(2026, 8, 1));
        sdto.setEndDate(LocalDate.of(2026, 8, 21));
        sdto.setActive(true);
        sdto.setDescription("Consistency test shift");
        shift = shiftService.createShift(sdto);

        UserDTO ddto = new UserDTO();
        ddto.setEmail("cons_doctor_" + System.nanoTime() + "@test.com");
        ddto.setLogin("c_doc_" + (System.nanoTime() % 100000));
        ddto.setPassword("password123");
        ddto.setFullName("Consistency Doctor");
        ddto.setBirthDate(LocalDate.of(1980, 1, 1));
        doctor = userService.createUser(ddto);

        UserDTO ndto = new UserDTO();
        ndto.setEmail("cons_nurse_" + System.nanoTime() + "@test.com");
        ndto.setLogin("c_nurse_" + (System.nanoTime() % 100000));
        ndto.setPassword("password123");
        ndto.setFullName("Consistency Nurse");
        ndto.setBirthDate(LocalDate.of(1985, 1, 1));
        nurse = userService.createUser(ndto);

        students = new ArrayList<>();
        for (int i = 0; i < 15; i++) {
            UserDTO sd = new UserDTO();
            sd.setEmail("cons_student_" + i + "_" + System.nanoTime() + "@test.com");
            sd.setLogin("cs_" + i + "_" + (System.nanoTime() % 100000));
            sd.setPassword("password123");
            sd.setFullName("Consistency Student");
            sd.setBirthDate(LocalDate.of(2000, 1, 1));
            UserDTO student = userService.createUser(sd);
            students.add(student);

            RegistrationDTO rdto = new RegistrationDTO();
            rdto.setUserId(student.getId());
            rdto.setShiftId(shift.getId());
            rdto.setCheckInDate(shift.getStartDate());
            rdto.setCheckOutDate(shift.getEndDate());
            registrationService.registerUser(rdto);
        }

        cabinets = cabinetService.getAllCabinets();

        for (CabinetDTO cab : cabinets) {
            staffCabinetService.assignCabinetToStaff(nurse.getId(), cab.getId());
        }
    }

    @ParameterizedTest
    @ValueSource(ints = {30, 60, 90})
    void fullCycle_registerAssignComplete_shouldMaintainConsistency(int appointmentCount) {
        List<AppointmentDTO> appointments = new ArrayList<>();
        for (int i = 0; i < appointmentCount; i++) {
            AppointmentDTO adto = new AppointmentDTO();
            adto.setProcedureId((long) (1 + (i % 8)));
            adto.setStudentId(students.get(i % students.size()).getId());
            adto.setDoctorId(doctor.getId());
            adto.setShiftId(shift.getId());
            adto.setAppointmentDate(shift.getStartDate().plusDays(i % 20));
            adto.setNotes("Cycle appointment #" + i);
            appointments.add(appointmentService.createAppointment(adto));
        }

        assertEquals(appointmentCount, appointments.size());

        List<ProcedureCompletionDTO> completions = new ArrayList<>();
        for (int i = 0; i < appointmentCount; i++) {
            ProcedureCompletionDTO completed = completionService.markProcedureAsCompleted(
                    appointments.get(i).getId(), nurse.getId(), "Completed #" + i);
            assertNotNull(completed);
            completions.add(completed);
        }

        assertEquals(appointmentCount, completions.size());

        for (int i = 0; i < appointmentCount; i++) {
            assertEquals(appointments.get(i).getId(), completions.get(i).getAppointmentId());
            assertEquals(nurse.getId(), completions.get(i).getCompletedById());
        }

        List<ProcedureCompletionDTO> nurseCompletions = completionService.getCompletionsByUser(nurse.getId());
        assertEquals(appointmentCount, nurseCompletions.size());

        List<ProcedureCompletionDTO> byShift = completionService.getCompletionsByUserAndShift(
                students.get(0).getId(), shift.getId());
        int expectedPerStudent = appointmentCount / students.size();
        assertTrue(byShift.size() >= expectedPerStudent - 1 && byShift.size() <= expectedPerStudent + 1);
    }

    @Test
    void deleteShiftWithRegistrations_shouldThrow() {
        assertThrows(Exception.class, () -> shiftService.deleteShift(shift.getId()),
                "Deleting shift with active registrations should throw");
    }

    @Test
    void deleteUserWithAppointments_shouldThrow() {
        AppointmentDTO adto = new AppointmentDTO();
        adto.setProcedureId(1L);
        adto.setStudentId(students.get(0).getId());
        adto.setDoctorId(doctor.getId());
        adto.setShiftId(shift.getId());
        adto.setAppointmentDate(shift.getStartDate());
        adto.setNotes("Protection test");
        appointmentService.createAppointment(adto);

        assertThrows(Exception.class, () -> userService.deleteUser(students.get(0).getId()),
                "Deleting user with appointments should throw");
    }

    @Test
    void bulkCreateAndVerifyCounts_shouldMatch() {
        int studentCount = 15;
        int appointmentsPerStudent = 5;
        int totalAppointments = studentCount * appointmentsPerStudent;

        for (int s = 0; s < studentCount; s++) {
            for (int a = 0; a < appointmentsPerStudent; a++) {
                AppointmentDTO adto = new AppointmentDTO();
                adto.setProcedureId((long) (1 + ((s * appointmentsPerStudent + a) % 8)));
                adto.setStudentId(students.get(s).getId());
                adto.setDoctorId(doctor.getId());
                adto.setShiftId(shift.getId());
                adto.setAppointmentDate(shift.getStartDate().plusDays(a));
                adto.setNotes("Bulk #" + s + "-" + a);
                appointmentService.createAppointment(adto);
            }
        }

        List<AppointmentDTO> allByShift = appointmentService.getAppointmentsByShift(shift.getId());
        assertEquals(totalAppointments, allByShift.size());

        for (int s = 0; s < studentCount; s++) {
            List<AppointmentDTO> byStudent = appointmentService.getAppointmentsByStudent(students.get(s).getId());
            assertEquals(appointmentsPerStudent, byStudent.size(),
                    "Student " + s + " should have " + appointmentsPerStudent + " appointments");
        }

        for (int s = 0; s < studentCount; s++) {
            List<AppointmentDTO> byBoth = appointmentService.getAppointmentsByStudentAndShift(
                    students.get(s).getId(), shift.getId());
            assertEquals(appointmentsPerStudent, byBoth.size());
        }
    }

    @Test
    void createAppointmentAndComplete_verifyRelations() {
        AppointmentDTO adto = new AppointmentDTO();
        adto.setProcedureId(1L);
        adto.setStudentId(students.get(0).getId());
        adto.setDoctorId(doctor.getId());
        adto.setShiftId(shift.getId());
        adto.setAppointmentDate(shift.getStartDate());
        adto.setNotes("Relation test");
        AppointmentDTO appointment = appointmentService.createAppointment(adto);

        assertNotNull(appointment.getProcedureName());
        assertNotNull(appointment.getCabinetNumber());
        assertNotNull(appointment.getDoctorName());
        assertNotNull(appointment.getStudentName());
        assertNotNull(appointment.getShiftName());

        ProcedureCompletionDTO completed = completionService.markProcedureAsCompleted(
                appointment.getId(), nurse.getId(), "Done");
        assertNotNull(completed.getProcedureName());
        assertNotNull(completed.getStudentName());
        assertNotNull(completed.getCabinetNumber());
        assertNotNull(completed.getCompletedByName());

        assertEquals(appointment.getProcedureName(), completed.getProcedureName());
        assertEquals(appointment.getStudentName(), completed.getStudentName());
        assertEquals(appointment.getCabinetNumber(), completed.getCabinetNumber());
    }

    @Test
    void createMultipleShiftsAndVerifyIsolation() {
        ShiftDTO shift2 = new ShiftDTO();
        shift2.setName("Isolation Shift B");
        shift2.setStartDate(LocalDate.of(2026, 9, 1));
        shift2.setEndDate(LocalDate.of(2026, 9, 21));
        shift2.setActive(true);
        shift2.setDescription("Isolation test B");
        shift2 = shiftService.createShift(shift2);

        for (int i = 0; i < 10; i++) {
            AppointmentDTO adto = new AppointmentDTO();
            adto.setProcedureId((long) (1 + (i % 8)));
            adto.setStudentId(students.get(i % students.size()).getId());
            adto.setDoctorId(doctor.getId());
            adto.setShiftId(shift2.getId());
            adto.setAppointmentDate(shift2.getStartDate().plusDays(i));
            adto.setNotes("Isolation B #" + i);
            appointmentService.createAppointment(adto);
        }

        List<AppointmentDTO> shift1Apps = appointmentService.getAppointmentsByShift(shift.getId());
        List<AppointmentDTO> shift2Apps = appointmentService.getAppointmentsByShift(shift2.getId());

        assertEquals(0, shift1Apps.size(), "Shift A should have no appointments");
        assertEquals(10, shift2Apps.size(), "Shift B should have 10 appointments");
    }
}