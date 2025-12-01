package com.team2.passwordvault.backend.controller.dto;

public record LoginRequest(
        String email,
        String password
) {}