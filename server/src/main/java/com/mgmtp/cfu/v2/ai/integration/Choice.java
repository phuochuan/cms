package com.mgmtp.cfu.v2.ai.integration;

import lombok.Data;

@Data
public class Choice {
    private int index;
    private Message message;
    private Object logprobs; // hoặc Map<String, Object> nếu bạn muốn chi tiết
    private String finish_reason;
}
