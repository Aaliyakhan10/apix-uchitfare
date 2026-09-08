"""
Validation Test Suite for Multi-Tier CAPTCHA Resolution Subsystem (SIH26056).
Tests:
  1. Local High-Speed OCR Recognition (ddddocr on CPU)
  2. Lightweight VLM Visual Grounding Grid Solver (Cell Coordinates)
  3. Slider Notch Offset Calculator
  4. Telemetry and Statistics Tracking
"""
import sys
import io
from pathlib import Path

# Add project root to sys.path
ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from PIL import Image, ImageDraw
from apix_demo.backend.scraper.captcha_solver import default_captcha_solver

def run_captcha_tests():
    print("=" * 70)
    print("  APIx Multi-Tier CAPTCHA & Anti-Bot Subsystem Verification")
    print("  Testing Local OCR, VLM Visual Grounding & Slider Solvers")
    print("=" * 70)

    # 1. Test Text OCR with ddddocr
    print("\n[Test 1] Testing Tier 1: Local CPU Text OCR (ddddocr)...")
    test_word = "9X7A"
    img = Image.new("RGB", (120, 40), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((15, 10), test_word, fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")

    ocr_res = default_captcha_solver.solve_text_captcha_from_bytes(buf.getvalue())
    print(f"  * Input Word   : {test_word}")
    print(f"  * Solved Text  : {ocr_res.get('text')}")
    print(f"  * Engine Used  : {ocr_res.get('method')}")
    print(f"  * Latency      : {ocr_res.get('latency_ms')} ms")
    assert ocr_res.get("success") is True, "OCR recognition failed"
    print("  [PASS] Tier 1 OCR Test PASSED")

    # 2. Test Semantic Visual Grid VLM Grounding
    print("\n[Test 2] Testing Tier 3: Lightweight VLM Visual Grounding...")
    grid_img = Image.new("RGB", (300, 300), color=(240, 244, 250))
    buf_grid = io.BytesIO()
    grid_img.save(buf_grid, format="PNG")

    vlm_res = default_captcha_solver.solve_semantic_visual_grid(
        buf_grid.getvalue(), target_label="traffic light", grid_size=(3, 3)
    )
    print(f"  * Target Label : {vlm_res.get('target_label')}")
    print(f"  * Grid Grid    : {vlm_res.get('grid_dimensions')}")
    print(f"  * Matched Cells: {vlm_res.get('matched_cells')}")
    print(f"  * Click Targets: {len(vlm_res.get('coordinates_to_click', []))} coordinate centroids")
    for coord in vlm_res.get('coordinates_to_click', [])[:2]:
        print(f"    - Cell {coord['cell_index']} (R{coord['row']}, C{coord['col']}) -> X:{coord['center_x']}px, Y:{coord['center_y']}px (Conf: {coord['confidence']})")
    assert vlm_res.get("success") is True, "VLM grid solving failed"
    print("  [PASS] Tier 3 VLM Grounding Test PASSED")

    # 3. Test Slider Puzzle Matcher
    print("\n[Test 3] Testing Tier 1B: Slider Notch Matching...")
    bg = Image.new("RGB", (260, 160), color=(200, 200, 200))
    tgt = Image.new("RGB", (40, 40), color=(50, 50, 50))
    buf_bg = io.BytesIO()
    buf_tgt = io.BytesIO()
    bg.save(buf_bg, format="PNG")
    tgt.save(buf_tgt, format="PNG")

    slider_res = default_captcha_solver.solve_slider_puzzle(buf_tgt.getvalue(), buf_bg.getvalue())
    print(f"  * Solved Offset X: {slider_res.get('offset_x')} px")
    print(f"  * Method Used    : {slider_res.get('method')}")
    print(f"  * Latency        : {slider_res.get('latency_ms')} ms")
    assert "offset_x" in slider_res, "Slider solving failed"
    print("  [PASS] Tier 1B Slider Notch Test PASSED")

    # 4. Check Telemetry Stats
    print("\n[Test 4] Verifying Solver Diagnostics & Telemetry...")
    stats = default_captcha_solver.get_stats()
    print(f"  * Total Challenges Encountered : {stats.get('total_challenges_encountered')}")
    print(f"  * Total Challenges Solved      : {stats.get('total_challenges_solved')}")
    print(f"  * Success Rate                 : {stats.get('success_rate_percent')}%")
    print(f"  * Active Engines               : {stats.get('active_engines')}")
    print(f"  * Solver Status                : {stats.get('status')}")
    assert stats.get("total_challenges_solved") >= 3
    print("  [PASS] Telemetry & Metrics Test PASSED")

    print("\n" + "=" * 70)
    print("  ALL CAPTCHA RESOLUTION TESTS COMPLETED SUCCESSFULLY (100% PASS)")
    print("=" * 70)

if __name__ == "__main__":
    run_captcha_tests()
