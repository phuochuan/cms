package com.mgmtp.cfu.v2.ai.repositories;

import com.mgmtp.cfu.v2.ai.models.AIThread;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AIThreadRepository extends JpaRepository<AIThread, Long> {
    List<AIThread> findAllByUserId(Long id);
}
