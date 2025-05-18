package com.mgmtp.cfu.v2.ai.integration;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.util.List;

@Data
public class DeepSeekChatCompletionResponse {
    private String id;
    private String object;
    private long created;
    private String model;
    private List<Choice> choices;
    private Usage usage;
    private String system_fingerprint;

    @JsonIgnore
    public String getMessageContent() {
        String content = this.choices.get(0).getMessage().getContent();

        content = content.replaceAll("(?s)```json\\s*(.*?)\\s*```", "$1");

        content = content.replaceAll("(?s)```\\s*(.*?)\\s*```", "$1");

        return content.trim();
    }
}
