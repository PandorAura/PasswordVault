package com.team2.passwordvault.backend.repository;

import com.team2.passwordvault.backend.model.Password;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordRepository extends JpaRepository<Password, Long> {

    // You can add methods here to fetch passwords for a specific user, e.g.:
    // List<Password> findAllByUser(User user);
}