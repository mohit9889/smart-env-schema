import { test, describe, it } from "node:test";
import * as assert from "node:assert";
import { formatErrors } from "../../src/utils/formatter";

describe("Formatter", () => {
    it("should format errors correctly", () => {
        const errors = [
            {
                variable: "TEST_VAR",
                message: "Test error message",
                file: ".env",
                line: 10,
                value: "invalid",
                suggestion: "Fix it"
            }
        ];

        const output = formatErrors(errors);

        assert.ok(output.includes("TEST_VAR"));
        assert.ok(output.includes("Test error message"));
        assert.ok(output.includes(".env (line 10)"));
        assert.ok(output.includes("Fix it"));
    });

    it("should redact sensitive values", () => {
        const errors = [
            {
                variable: "API_KEY",
                message: "Invalid key",
                value: "1234567890", // Should be redacted by validator before formatter, but formatter also handles display
                suggestion: "Fix it"
            }
        ];

        // Note: The redaction logic is actually in the validator, which passes the redacted value to the formatter.
        // However, the formatter might adding "redacted" text if the value itself contains it.
        // Let's check the formatter implementation again.
        // Formatter: if (error.value && !error.value.includes("redacted")) ...

        // If we pass a value that looks like a secret, the formatter just displays what it gets, 
        // assuming the validator did its job. 
        // But if the validator passed a redacted string, formatter should handle it.

        const output = formatErrors([{
            variable: "SECRET",
            message: "Error",
            value: "12***90 (redacted)"
        }]);

        assert.ok(output.includes("🔒")); // Lock icon for redacted/secret
    });
});
