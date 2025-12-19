package com.team2.passwordvault.backend.repository;

import com.team2.passwordvault.backend.model.Password;
import com.team2.passwordvault.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordRepository extends JpaRepository<Password, UUID> {
    List<Password> findByUser(User user);
    Optional<Password> findByIdAndUser(UUID id, User user);
    Page<Password> findAllByUser(User user, Pageable pageable);
}

