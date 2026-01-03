package com.team2.passwordvault.backend.controller;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/breaches")
public class BreachController {

    private static final String DEFAULT_PWNED_RANGE_URL = "https://api.pwnedpasswords.com/range/";
    private static final String DEFAULT_HIBP_API_BASE = "https://haveibeenpwned.com/api/v3";
    private static final String DEFAULT_HIBP_TEST_API_KEY = "00000000000000000000000000000000";

    private final String pwnedRangeUrl = normalizeTrailingSlash(getConfig("PWNED_RANGE_URL", DEFAULT_PWNED_RANGE_URL));
    private final String hibpApiBase = normalizeNoTrailingSlash(getConfig("HIBP_API_BASE", DEFAULT_HIBP_API_BASE));
    private final String hibpApiKey = getConfig("HIBP_TEST_API_KEY", DEFAULT_HIBP_TEST_API_KEY);

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    @GetMapping(value = "/pwnedpasswords/range/{prefix}", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> pwnedPasswordsRange(@PathVariable String prefix) {
        String normalized = prefix == null ? "" : prefix.trim().toUpperCase();
        if (!normalized.matches("^[0-9A-F]{5}$")) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Invalid prefix. Expected 5 hex chars.");
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(pwnedRangeUrl + normalized))
                .timeout(Duration.ofSeconds(12))
                .header("Add-Padding", "true")
                .header("User-Agent", "PasswordVault/1.0")
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return ResponseEntity.ok()
                        .contentType(MediaType.TEXT_PLAIN)
                        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=300")
                        .body(response.body());
            }
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("HIBP range API error: HTTP " + response.statusCode());
        } catch (java.io.IOException | InterruptedException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("HIBP range API request failed: " + e.getMessage());
        }
    }

    @GetMapping(value = "/hibp/breachedaccount/{account:.+}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> breachedAccount(@PathVariable String account) {
        String normalized = account == null ? "" : account.trim();
        if (normalized.isEmpty() || normalized.length() > 320) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"Invalid account\"}");
        }

        String encoded = URLEncoder.encode(normalized, StandardCharsets.UTF_8);
        URI uri = URI.create(hibpApiBase + "/breachedaccount/" + encoded + "?truncateResponse=false");

        HttpRequest request = HttpRequest.newBuilder()
                .uri(uri)
                .timeout(Duration.ofSeconds(12))
                .header("hibp-api-key", hibpApiKey)
                .header("User-Agent", "PasswordVault/1.0")
                .header("Accept", "application/json")
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 404) {
                // HIBP uses 404 for "no breach found"
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"breaches\":[]}");
            }

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(response.body());
            }

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"HIBP v3 error\",\"status\":" + response.statusCode() + "}");
        } catch (java.io.IOException | InterruptedException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"HIBP v3 request failed\",\"message\":\"" + e.getMessage().replace("\"", "'") + "\"}");
        }
    }

    private static String getConfig(String key, String defaultValue) {
        String fromProps = System.getProperty(key);
        if (fromProps != null && !fromProps.isBlank()) return fromProps.trim();
        String fromEnv = System.getenv(key);
        if (fromEnv != null && !fromEnv.isBlank()) return fromEnv.trim();
        return defaultValue;
    }

    private static String normalizeTrailingSlash(String url) {
        if (url == null || url.isBlank()) return "/";
        String trimmed = url.trim();
        return trimmed.endsWith("/") ? trimmed : (trimmed + "/");
    }

    private static String normalizeNoTrailingSlash(String url) {
        if (url == null) return "";
        String trimmed = url.trim();
        while (trimmed.endsWith("/")) trimmed = trimmed.substring(0, trimmed.length() - 1);
        return trimmed;
    }
}
