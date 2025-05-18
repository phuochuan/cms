package com.mgmtp.cfu.v2.ai.representation_models;

import com.mgmtp.cfu.v2.ai.models.AIFakeRegistration;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CourseRecommendationResponse {
    String assistantResponseGreetingMessage;

    List<AIFakeRegistration> aiFakeRegistrations;
}
