package com.mgmtp.cfu.v2.ai.repositories;

import com.mgmtp.cfu.v2.ai.models.AIMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface AIMessageRepository extends JpaRepository<AIMessage, Long> {
    List<AIMessage> findAllByThreadId(long id);
}
