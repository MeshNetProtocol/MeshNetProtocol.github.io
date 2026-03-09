# Mandatory Three-Phase Verification for All Code Modifications

**Category:** Development Practice Specification  
**Priority:** Critical  
**Applies To:** All code modifications (CSS, JavaScript, HTML, Configuration files)

---

## Purpose

Ensure quality control for all code modifications through mandatory three-phase verification process. This skill exists because the AI has a pattern of making incorrect changes on the first attempt.

---

## The Three-Phase Verification Process

### Phase 1 - First Modification
- [ ] Make the initial change using `search_replace` or appropriate tool
- [ ] **IMMEDIATELY** read the modified file to verify the change was applied correctly
- [ ] Check for:
  - Syntax errors
  - Unintended changes
  - Missing modifications
  - Incorrect replacements
- [ ] If any issues found, proceed to Phase 2

### Phase 2 - Second Modification
- [ ] Review the context and impact of the first change
- [ ] Make necessary corrections or improvements
- [ ] **READ THE FILE AGAIN** to verify the second change
- [ ] Cross-reference with related files if applicable
- [ ] Verify:
  - The change matches the user's requirements
  - No breaking changes introduced
  - Consistent with existing code patterns
- [ ] If still not perfect, proceed to Phase 3

### Phase 3 - Final Verification
- [ ] Review the complete change set
- [ ] Verify all related files are consistent
- [ ] Check for any side effects or breaking changes
- [ ] Validate the solution addresses the root cause, not just symptoms
- [ ] **ONLY THEN** present the result to the user

---

## Critical Rules

1. **NEVER** present a change after only one modification attempt
2. **ALWAYS** read the file after each `search_replace` to verify
3. **MANDATORY** to check for unintended changes in the diff
4. If the user says "it's still wrong", it means verification steps were skipped
5. This process applies to **ALL** modifications without exception

---

## When to Use

This skill should be activated for **EVERY** code modification task, including:
- CSS style changes
- JavaScript logic updates
- HTML structure modifications
- Configuration file edits
- Any search_replace operation

---

## Example Workflow

```
User: "Change the DNS strategy default to prefer_ipv4"

Phase 1:
  ✅ Execute search_replace to change default from '' to 'prefer_ipv4'
  ✅ Read the file to verify the change was applied
  ✅ Check no syntax errors introduced

Phase 2:
  ✅ Review the change - is the description still accurate?
  ✅ Improve the description to be more detailed
  ✅ Read again to confirm both changes are correct

Phase 3:
  ✅ Verify the complete modification
  ✅ Check related files (no breaking changes)
  ✅ Confirm solution matches user requirements
  ✅ Present result to user
```

---

## Trigger

This skill should **AUTOMATICALLY** activate for every code modification task. It is not optional - it is mandatory for quality assurance.

---

**Created:** 2026-03-08  
**Reason:** User requested explicit three-verification process to ensure modification quality
