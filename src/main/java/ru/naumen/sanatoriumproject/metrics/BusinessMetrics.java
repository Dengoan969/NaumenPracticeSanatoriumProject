package ru.naumen.sanatoriumproject.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

@Component
public class BusinessMetrics {

    private final Counter appointmentsCreated;
    private final Counter registrationsCompleted;
    private final Counter usersRegistered;

    public BusinessMetrics(MeterRegistry registry) {
        this.appointmentsCreated = Counter.builder("appointments.created.total")
            .description("Total number of appointments created")
            .register(registry);

        this.registrationsCompleted = Counter.builder("registrations.completed.total")
            .description("Total number of registrations completed")
            .register(registry);

        this.usersRegistered = Counter.builder("users.registered.total")
            .description("Total number of users registered")
            .register(registry);
    }

    public void incrementAppointments() {
        appointmentsCreated.increment();
    }

    public void incrementRegistrations() {
        registrationsCompleted.increment();
    }

    public void incrementUsersRegistered() {
        usersRegistered.increment();
    }
}