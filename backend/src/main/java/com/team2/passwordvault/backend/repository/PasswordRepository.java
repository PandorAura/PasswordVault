package com.team2.passwordvault.backend.repository;

import com.team2.passwordvault.backend.model.Password;
import com.team2.passwordvault.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordRepository extends JpaRepository<Password, UUID> {

    List<Password> findByUser(User user);

    Optional<Password> findByIdAndUser(UUID id, User user);

    Page<Password> findAllByUser(User user, Pageable pageable);

    @Query("""
        SELECT p FROM Password p
        WHERE p.user = :user
          AND (:category = 'all' OR LOWER(CAST(p.category AS string)) = LOWER(:category))
          AND (
                :search IS NULL OR :search = '' OR
                LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.websiteUrl) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.usernameOrEmail) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.notes) LIKE LOWER(CONCAT('%', :search, '%'))
          )
    """)
    Page<Password> findFiltered(
            @Param("user") User user,
            @Param("search") String search,
            @Param("category") String category,
            Pageable pageable
    );
}