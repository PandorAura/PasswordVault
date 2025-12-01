package com.team2.passwordvault.backend.controller.dto;

public record RegisterRequest(
        String name,
        String email,
        String password
) {}