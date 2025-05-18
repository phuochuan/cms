package com.mgmtp.cfu.v2.ai.integration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeepSeek {
    private String message;

    private final String token = "sk-d535751eb7d444b09ff542a368dbb1f8";

    private RestTemplate restTemplate = new RestTemplate();

    public DeepSeek(final String message) {
        this.message = message;
    }

    public DeepSeekChatCompletionResponse chatCompletion() {
        String url = "https://api.deepseek.com/v1/chat/completions";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "deepseek-chat");
        requestBody.put("messages", new Object[]{
            Map.of("role", "user", "content", message)
        });

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<DeepSeekChatCompletionResponse> response = restTemplate.exchange(
            url,
            HttpMethod.POST,
            requestEntity,
            DeepSeekChatCompletionResponse.class
        );

        return response.getBody();
    }
}
