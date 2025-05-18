package com.mgmtp.cfu.v2.ai.integration;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mgmtp.cfu.v2.ai.representation_models.DeepSeekCourseResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class DeepSeekRecommendedCoursesResponse {
    String mainRequirement;

    String assistantResponseGreetingMessage;

    List<DeepSeekCourseResponse> deepSeekCourseResponses;

}
