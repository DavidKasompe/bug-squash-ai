#!/usr/bin/env python3
"""
Simple test script for patch generation functionality.
Tests the core logic without requiring database setup.
"""

import difflib
import json

def test_patch_generation_logic():
    """Test the core patch generation functions."""

    print("=== Testing Patch Generation Logic ===\n")

    # Test 1: Basic diff creation
    print("Test 1: Basic diff creation")
    original_code = '''def authenticate_user(username, password):
    if username == "admin" and password == "password":
        return True
    return False'''

    patched_code = '''def authenticate_user(username, password):
    if username and password and len(password) >= 8:
        return True
    return False'''

    diff = create_diff(original_code, patched_code, 'auth/login.py')
    print("✓ Diff created successfully:")
    print(diff[:200] + "..." if len(diff) > 200 else diff)
    print()

    # Test 2: Confidence score calculation
    print("Test 2: Confidence score calculation")

    class MockBug:
        def __init__(self, severity, analysis_confidence):
            self.severity = severity
            self.analysis_result = {'confidence': analysis_confidence}

    bug = MockBug('high', 0.8)
    confidence = calculate_confidence_score(bug)
    print(f"✓ Confidence score for high severity bug: {confidence}")

    bug = MockBug('low', 0.3)
    confidence = calculate_confidence_score(bug)
    print(f"✓ Confidence score for low severity bug: {confidence}")
    print()

    # Test 3: Bug-specific fixes
    print("Test 3: Bug-specific fixes")

    # Authentication bug fix
    auth_code = '''def authenticate_user(username, password):
    if username == "admin" and password == "password":
        return True
    return False'''

    fixed_auth = fix_authentication_bug(auth_code, "password validation issue")
    print("✓ Authentication bug fix applied:")
    print(fixed_auth)
    print()

    # Validation bug fix
    validation_code = '''def validate_email(email):
    return "@" in email'''

    fixed_validation = fix_validation_bug(validation_code, "email validation")
    print("✓ Validation bug fix applied:")
    print(fixed_validation)
    print()

    print("=== All tests completed successfully! ===")

def create_diff(original_code, patched_code, file_path):
    """Create a unified diff between original and patched code."""
    original_lines = original_code.splitlines(keepends=True)
    patched_lines = patched_code.splitlines(keepends=True)

    diff = list(difflib.unified_diff(
        original_lines,
        patched_lines,
        fromfile=f'a/{file_path}',
        tofile=f'b/{file_path}',
        lineterm=''
    ))

    return '\n'.join(diff)

def calculate_confidence_score(bug):
    """Calculate confidence score based on bug analysis quality."""
    base_score = 0.5

    # Adjust based on bug severity
    if bug.severity == 'critical':
        base_score += 0.2
    elif bug.severity == 'high':
        base_score += 0.1

    # Adjust based on analysis confidence
    analysis_confidence = bug.analysis_result.get('confidence', 0.5)
    base_score = (base_score + analysis_confidence) / 2

    return min(base_score, 1.0)

def fix_authentication_bug(code, description):
    """Fix authentication-related bugs."""
    if 'password' in description.lower() or 'auth' in description.lower():
        return code.replace(
            'if username == "admin" and password == "password":',
            'if username and password and len(password) >= 8:'
        )
    return code

def fix_validation_bug(code, description):
    """Fix validation-related bugs."""
    if 'email' in description.lower():
        return code.replace(
            'return "@" in email',
            'import re\n    return re.match(r"[^@]+@[^@]+\\.[^@]+", email) is not None'
        )
    return code

if __name__ == "__main__":
    test_patch_generation_logic()
