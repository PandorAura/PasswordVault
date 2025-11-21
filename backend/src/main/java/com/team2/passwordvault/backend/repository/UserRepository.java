package com.team2.passwordvault.backend.repository;

import com.team2.passwordvault.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data JPA automatically provides methods like:
    // save(User)
    // findById(Long)
    // findAll()
    // delete(User)

    // You can add custom finders here if needed, eg:
    // Optional<User> findByEmail(String email);
}