#!/usr/bin/env python3
"""Verify that accessibility and SEO features were added correctly."""

import re
from pathlib import Path

REPO_ROOT = Path(__file__).parent

def check_skip_link(content):
    """Check if skip-link is present."""
    return 'class="skip-link"' in content and 'href="#main-content"' in content

def check_skip_link_css(content):
    """Check if skip-link CSS is present."""
    return '.skip-link' in content and 'position:absolute' in content

def check_main_id(content):
    """Check if main has id="main-content"."""
    return 'id="main-content"' in content

def check_breadcrumb(content):
    """Check if BreadcrumbList schema is present."""
    return 'BreadcrumbList' in content

def is_top_level(file_path):
    """Check if file is top-level."""
    rel_path = file_path.relative_to(REPO_ROOT)
    parts = rel_path.parts
    if len(parts) == 1:
        return True
    if len(parts) == 2 and parts[0] in ['es', 'fr', 'it', 'ja', 'ko', 'ru']:
        return True
    return False

def is_index_or_404(file_path):
    """Check if file is index.html or 404.html."""
    return file_path.name in ['index.html', '404.html']

def verify_file(file_path):
    """Verify a single HTML file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        results = {
            'skip_link': check_skip_link(content),
            'skip_link_css': check_skip_link_css(content),
            'main_id': check_main_id(content),
            'breadcrumb': check_breadcrumb(content),
            'is_component': file_path.parent.name == 'components',
            'is_top_level': is_top_level(file_path),
            'is_index_404': is_index_or_404(file_path),
        }
        return results
    except Exception as e:
        return {'error': str(e)}

def main():
    """Main function."""
    html_files = sorted(REPO_ROOT.glob('**/*.html'))
    print(f"Verifying {len(html_files)} HTML files\n")

    skip_link_count = 0
    skip_link_css_count = 0
    main_id_count = 0
    breadcrumb_count = 0
    
    component_count = 0
    top_level_count = 0
    index_404_count = 0

    for file_path in html_files:
        results = verify_file(file_path)

        if 'error' in results:
            print(f"ERROR {file_path.relative_to(REPO_ROOT)}: {results['error']}")
            continue

        # Count skip-link features
        if results['skip_link']:
            skip_link_count += 1
        if results['skip_link_css']:
            skip_link_css_count += 1
        if results['main_id']:
            main_id_count += 1

        # Count breadcrumbs (only if not top-level, not index/404, not component)
        if results['breadcrumb']:
            breadcrumb_count += 1

        # Count exclusions
        if results['is_component']:
            component_count += 1
        if results['is_top_level']:
            top_level_count += 1
        if results['is_index_404']:
            index_404_count += 1

    print("=== TASK 1: Skip-to-Content Links ===")
    print(f"Files with skip-link HTML: {skip_link_count}")
    print(f"Files with skip-link CSS: {skip_link_css_count}")
    print(f"Files with main id=\"main-content\": {main_id_count}")

    print(f"\n=== TASK 2: BreadcrumbList JSON-LD ===")
    print(f"Files with BreadcrumbList schema: {breadcrumb_count}")

    print(f"\n=== EXCLUSIONS ===")
    print(f"Component files (excluded): {component_count}")
    print(f"Top-level files (excluded from breadcrumbs): {top_level_count}")
    print(f"Index/404 files (excluded from breadcrumbs): {index_404_count}")

    print(f"\n=== TOTAL ===")
    print(f"Total HTML files: {len(html_files)}")

if __name__ == '__main__':
    main()
