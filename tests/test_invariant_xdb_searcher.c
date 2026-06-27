#include <check.h>
#include <stdlib.h>
#include <string.h>
#include "xdb_searcher.h"

START_TEST(test_memcpy_bounds_invariant)
{
    // Invariant: memcpy must never read beyond allocated buffer boundaries
    const char *payloads[] = {
        "0xFFFFFFFF",  // Exploit: offset that would overflow
        "0x7FFFFFFF",  // Boundary: large positive offset
        "0x0"         // Valid: zero offset
    };
    int num_payloads = sizeof(payloads) / sizeof(payloads[0]);

    for (int i = 0; i < num_payloads; i++) {
        // Setup test structure with controlled buffer
        xdb_searcher_t searcher;
        xdb_content_t content;
        char test_buffer[256] = {0};
        char dest_buffer[256] = {0};
        
        content.buffer = test_buffer;
        content.length = sizeof(test_buffer);
        searcher.content = &content;
        
        // Parse offset from payload
        unsigned long offset = strtoul(payloads[i], NULL, 0);
        size_t length = 16;  // Fixed reasonable length
        
        // Security property: offset + length must not exceed buffer size
        ck_assert_msg(offset + length <= sizeof(test_buffer),
                     "Offset %lu + length %zu exceeds buffer size %zu",
                     offset, length, sizeof(test_buffer));
        
        // If invariant holds, memcpy should execute safely
        if (offset + length <= sizeof(test_buffer)) {
            memcpy(dest_buffer, searcher.content->buffer + offset, length);
            ck_assert_ptr_nonnull(dest_buffer);
        }
    }
}
END_TEST

Suite *security_suite(void)
{
    Suite *s;
    TCase *tc_core;

    s = suite_create("Security");
    tc_core = tcase_create("Core");

    tcase_add_test(tc_core, test_memcpy_bounds_invariant);
    suite_add_tcase(s, tc_core);

    return s;
}

int main(void)
{
    int number_failed;
    Suite *s;
    SRunner *sr;

    s = security_suite();
    sr = srunner_create(s);

    srunner_run_all(sr, CK_NORMAL);
    number_failed = srunner_ntests_failed(sr);
    srunner_free(sr);

    return (number_failed == 0) ? EXIT_SUCCESS : EXIT_FAILURE;
}