package com.team2.passwordvault.backend.repository;

import com.team2.passwordvault.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Spring Data JPA automatically provides methods like:
    // save(User)
    // findById(UUID)
    // findAll()
    // delete(User)

    // You can add custom finders here if needed, eg:
    // Optional<User> findByEmail(String email);
}