# Security Specification for 24HRPG

## Data Invariants
1. A UserProfile can only be read/written by the authenticated user with the matching `uid`.
2. A Character can only be read/written by the user whose email matches `email_dono`.
3. ChatMessages should be readable by authorized campaign members (for now, assume global read for simple setup, restrict to campaign later).

## Dirty Dozen Payloads
1. UserProfile: Update `uid` to another user's `uid`. (FAIL)
2. Character: Create a character with `email_dono` as someone else's email. (FAIL)
3. Character: Update `email_dono` to someone else's email. (FAIL)
4. Character: Update `hp_max` with a string. (FAIL)
5. UserProfile: Inject a ghost field `isAdmin: true`. (FAIL)
6. ChatMessage: Update an existing chat message. (FAIL - messages should be immutable)
7. Character: Create a character with a 1MB name. (FAIL)
8. UserProfile: Create a profile without a `role`. (FAIL)
9. Character: Update `nivel` to a negative number. (FAIL)
10. ChatMessage: Create a message with an invalid type. (FAIL)
11. UserProfile: Read another user's profile. (FAIL)
12. Character: Read another user's character. (FAIL)

## Test Runner (firestore.rules.test.ts)
*To be implemented in the testing phase.*
