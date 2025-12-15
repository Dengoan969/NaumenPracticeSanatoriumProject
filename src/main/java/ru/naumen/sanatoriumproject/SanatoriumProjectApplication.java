package ru.naumen.sanatoriumproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import ru.naumen.sanatoriumproject.models.ERole;
import ru.naumen.sanatoriumproject.models.Role;
import ru.naumen.sanatoriumproject.models.User;
import ru.naumen.sanatoriumproject.repositories.RoleRepository;
import ru.naumen.sanatoriumproject.repositories.UserRepository;

import java.util.Set;

@SpringBootApplication
public class SanatoriumProjectApplication {
    public static void main(String[] args) {
        SpringApplication.run(SanatoriumProjectApplication.class, args);
    }

    @Bean
    CommandLineRunner init(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder) {
        return args -> {


            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setEmail("admin@polytechnik.ru");
                admin.setLogin("admin123");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setFullName("Администратор Системы");
                admin.setPhone("+79991234567");

                Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                        .orElseThrow(() -> new RuntimeException("Роль ADMIN не найдена"));
                admin.setRoles(Set.of(adminRole));

                userRepository.save(admin);

                System.out.println("\nАдминистратор создан:");
                System.out.println("Email: admin@polytechnik.ru");
                System.out.println("Логин: admin");
                System.out.println("Пароль: admin123");
                System.out.println("ФИО: Администратор Системы");
                System.out.println("Телефон: +7 (123) 456-78-90");
            }
        };
    }
}
