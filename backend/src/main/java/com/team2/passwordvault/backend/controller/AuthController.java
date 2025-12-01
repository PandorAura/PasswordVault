package com.team2.passwordvault.backend.controller;

import com.team2.passwordvault.backend.controller.dto.AuthResponse;
import com.team2.passwordvault.backend.controller.dto.LoginRequest;
import com.team2.passwordvault.backend.controller.dto.RegisterRequest;
import com.team2.passwordvault.backend.model.User;
import com.team2.passwordvault.backend.repository.UserRepository;
import com.team2.passwordvault.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {

        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        // Create and save user
        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();

        user = userRepository.save(user);

        // Build UserDetails for JWT generation
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(Collections.emptyList()) // no roles yet
                .build();

        String token = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {

        var authToken = new UsernamePasswordAuthenticationToken(
                request.email(),
                request.password()
        );
        authenticationManager.authenticate(authToken); // throws if invalid


        User user = userRepository.findByEmail(request.email())
                .orElseThrow();

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(Collections.emptyList())
                .build();

        String token = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(token));
    }
}