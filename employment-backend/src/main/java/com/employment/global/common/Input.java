package com.employment.global.common;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public final class Input {

    private Input() {}

    public static String text(Map<String, Object> body, String key, int max, boolean required) {
        Object value = body.get(key);
        String result = value == null ? "" : value.toString();
        if (result.length() > max || (required && result.isBlank())) {
            throw new Problem(400, key + " 입력값을 확인해 주세요.");
        }
        return result;
    }

    public static String password(Map<String, Object> body, String key) {
        String value = text(body, key, 64, true);
        if (
            value.length() < 8 ||
            value.getBytes(StandardCharsets.UTF_8).length > 72 ||
            value.codePoints().anyMatch(Character::isWhitespace)
        ) {
            throw new Problem(400, "비밀번호는 공백 없이 8~64자, UTF-8 72바이트 이하여야 합니다.");
        }
        return value;
    }

    public static String url(Map<String, Object> body, String key) {
        String value = text(body, key, 500, false);
        if (!value.isEmpty()) {
            URI uri = URI.create(value);
            if (
                !("http".equalsIgnoreCase(uri.getScheme()) ||
                    "https".equalsIgnoreCase(uri.getScheme())) ||
                uri.getHost() == null
            ) {
                throw new Problem(400, "HTTP 또는 HTTPS 주소를 입력해 주세요.");
            }
        }
        return value;
    }

    public static long id(Map<String, Object> body, String key) {
        try {
            long value = Long.parseLong(String.valueOf(body.get(key)));
            if (value < 1) throw new IllegalArgumentException();
            return value;
        } catch (RuntimeException ex) {
            throw new Problem(400, key + " 값을 확인해 주세요.");
        }
    }
}
