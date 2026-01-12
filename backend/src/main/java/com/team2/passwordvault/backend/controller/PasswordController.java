package com.team2.passwordvault.backend.controller;

import com.team2.passwordvault.backend.controller.dto.PasswordRequest;
import com.team2.passwordvault.backend.controller.dto.PasswordResponse;
import com.team2.passwordvault.backend.model.Password;
import com.team2.passwordvault.backend.service.PasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/passwords")
@RequiredArgsConstructor
public class PasswordController {

    private final PasswordService passwordService;

    @GetMapping
    public ResponseEntity<Page<PasswordResponse>> getAllPasswords(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "all") String category
    ) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<PasswordResponse> result =
                passwordService.getAllPasswords(authentication.getName(), pageable, search, category);

        return ResponseEntity.ok(result);
    }


    @PostMapping
    public ResponseEntity<Password> addPassword(
            @Valid @RequestBody PasswordRequest request,
            Authentication authentication
    ) {
        Password saved = passwordService.saveNewPassword(
                request,
                authentication.getName()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePassword(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        passwordService.deletePassword(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Password> updatePassword(
            @PathVariable UUID id,
            @Valid @RequestBody PasswordRequest request,
            Authentication authentication
    ) {
        Password updated = passwordService.updatePassword(id, request, authentication.getName());
        return ResponseEntity.ok(updated);

    }

}

