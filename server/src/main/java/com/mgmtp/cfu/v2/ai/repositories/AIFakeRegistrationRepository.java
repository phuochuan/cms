package com.mgmtp.cfu.v2.ai.repositories;

import com.mgmtp.cfu.v2.ai.models.AIFakeRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AIFakeRegistrationRepository extends JpaRepository<AIFakeRegistration, Long> {
    List<AIFakeRegistration> findByAiMessageId(long id);
}
