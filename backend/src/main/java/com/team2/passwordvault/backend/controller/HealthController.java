package com.team2.passwordvault.backend.controller;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {
    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping
    public String status() {
        try {
            Query query = entityManager.createNativeQuery("SELECT text FROM test_table WHERE id = 1");
            Object result = query.getSingleResult();
            return "Backend running - Found record with id=1: text=" + result;
        } catch (Exception e) {
            return "Backend running - Error querying database: " + e.getMessage();
        }
    }
}