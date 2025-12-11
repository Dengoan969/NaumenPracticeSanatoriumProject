package ru.naumen.sanatoriumproject.config;

import org.springframework.security.core.userdetails.UserDetailsService;
import ru.naumen.sanatoriumproject.security.JwtAuthEntryPoint;
import ru.naumen.sanatoriumproject.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthEntryPoint unauthorizedHandler;
    private final UserDetailsService userDetailsService;

    @Bean
    public JwtAuthFilter authenticationJwtTokenFilter() {
        return new JwtAuthFilter();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .userDetailsService(userDetailsService)
                .securityMatchers(matchers -> matchers
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/news",
                                "/api/news/**",
                                "/api/shifts",
                                "/api/shifts/active",
                                "/api/cabinets",
                                "/api/procedures",
                                "/api/procedures/by-cabinet/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-resources/**",
                                "/webjars/**"
                        )
                )
                .authorizeHttpRequests(auth -> auth
                        // Публичные эндпоинты
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/news",
                                "/api/news/**",
                                "/api/shifts",
                                "/api/shifts/active",
                                "/api/cabinets",
                                "/api/procedures",
                                "/api/procedures/by-cabinet/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).permitAll()

                        // Управление новостями
                        .requestMatchers("/api/news/**").hasRole("ADMIN")

                        // Управление пользователями
                        .requestMatchers("/api/users/regular").hasAnyRole("ADMIN", "REGISTRAR")
                        .requestMatchers("/api/users").hasRole("ADMIN")
                        .requestMatchers("/api/users/**").hasAnyRole("ADMIN", "REGISTRAR")
                        .requestMatchers("/api/users/roles").hasRole("ADMIN")

                        // Управление сменами
                        .requestMatchers("/api/shifts").hasRole("ADMIN")
                        .requestMatchers("/api/shifts/**").hasRole("ADMIN")

                        // Управление кабинетами
                        .requestMatchers("/api/cabinets/**").hasRole("ADMIN")

                        // Управление процедурами
                        .requestMatchers("/api/procedures/**").hasRole("ADMIN")

                        // Управление комнатами
                        .requestMatchers("/api/rooms").hasRole("ADMIN")
                        .requestMatchers("/api/rooms/**").hasRole("ADMIN")

                        // Управление закреплением кабинетов
                        .requestMatchers("/api/staff-cabinets").hasRole("ADMIN")
                        .requestMatchers("/api/staff-cabinets/assignments").hasRole("ADMIN")
                        .requestMatchers("/api/staff-cabinets/by-user/**").hasAnyRole("NURSE", "ADMIN")
                        .requestMatchers("/api/staff-cabinets/by-cabinet/**").hasAnyRole("NURSE", "ADMIN")

                        // Эндпоинты для докторов
                        .requestMatchers("/api/appointments/**").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers("/api/registrations/shift/**").hasAnyRole("DOCTOR", "ADMIN")

                        // Эндпоинты для медработников
                        .requestMatchers("/api/procedure-completions/**").hasAnyRole("NURSE", "ADMIN")
                        .requestMatchers("/api/staff-cabinets/**").hasAnyRole("NURSE", "ADMIN")

                        // Все остальные запросы требуют аутентификации
                        .anyRequest().authenticated()
                )
                .addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
