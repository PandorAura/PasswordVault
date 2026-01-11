package com.team2.passwordvault.backend.controller;

import com.team2.passwordvault.backend.model.User;
import com.team2.passwordvault.backend.model.VaultMetadata;
import com.team2.passwordvault.backend.repository.UserRepository;
import com.team2.passwordvault.backend.repository.VaultMetadataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vault")
@RequiredArgsConstructor
public class VaultController {

    private final UserRepository userRepository;
    private final VaultMetadataRepository vaultMetadataRepository;

    @PostMapping("/setup")
    public ResponseEntity<?> setupVault(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody VaultSetupRequest request
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        VaultMetadata metadata = VaultMetadata.builder()
                .user(user)
                .kdfSalt(request.salt())
                .authHash(request.authHash())
                .build();

        vaultMetadataRepository.save(metadata);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/params")
    public ResponseEntity<VaultParamsResponse> getVaultParams(@RequestParam String email) {
        return vaultMetadataRepository.findByUser_Email(email)
                .map(meta -> ResponseEntity.ok(new VaultParamsResponse(meta.getKdfSalt(), meta.getAuthHash())))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/salt")
    public ResponseEntity<VaultSaltResponse> getVaultSalt(@RequestParam String email) {
        return vaultMetadataRepository.findByUser_Email(email)
                .map(meta -> ResponseEntity.ok(new VaultSaltResponse(meta.getKdfSalt())))
                .orElse(ResponseEntity.notFound().build());
    }

    public record VaultSetupRequest(String salt, String authHash) {}
    public record VaultParamsResponse(String salt, String authHash) {}
    public record VaultSaltResponse(String salt) {}
}