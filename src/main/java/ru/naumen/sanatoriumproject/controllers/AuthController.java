package ru.naumen.sanatoriumproject.controllers;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import ru.naumen.sanatoriumproject.dtos.JwtResponse;
import ru.naumen.sanatoriumproject.dtos.LoginRequest;
import ru.naumen.sanatoriumproject.security.JwtUtils;
import ru.naumen.sanatoriumproject.security.UserDetailsImpl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("Попытка аутентификации пользователя: {}", loginRequest.getLogin());
        logger.debug("Детали запроса на аутентификацию - вход в систему: {}, длина пароля: {}",
                loginRequest.getLogin(),
                loginRequest.getPassword() != null ? loginRequest.getPassword().length() : 0);

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getLogin(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            logger.info("Пользователь {} успешно прошел проверку подлинности. Роли: {}", userDetails.getUsername(), roles);
            logger.debug("Сгенерированный токен JWT для пользователя {}: {}", userDetails.getUsername(), jwt);

            return ResponseEntity.ok(new JwtResponse(jwt,
                    userDetails.getId(),
                    userDetails.getEmail(),
                    roles));

        } catch (Exception e) {
            logger.error("Не удалось выполнить аутентификацию пользователя: {}. Причина: {}", loginRequest.getLogin(), e.getMessage());
            throw e;
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('NURSE') or hasRole('REGISTRAR')")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Попытка несанкционированного доступа к конечной точке /me");
            return ResponseEntity.status(401).build();
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        logger.info("Получение текущих сведений о пользователе для: {}", userDetails.getUsername());
        logger.debug("Запрос сведений о пользователе - идентификатор: {}, Роли: {}",
                userDetails.getId(),
                userDetails.getAuthorities());

        Map<String, Object> response = new HashMap<>();
        response.put("id", userDetails.getId());
        response.put("login", userDetails.getUsername());
        response.put("email", userDetails.getEmail());
        response.put("roles", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        logger.debug("Подготовленные данные об ответах пользователей для {}: {}", userDetails.getUsername(), response);

        return ResponseEntity.ok(response);
    }
}