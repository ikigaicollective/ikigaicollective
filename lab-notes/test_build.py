"""Tests for build.py. Run from the repo root: python3 -m unittest lab-notes/test_build.py"""
import importlib.util
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("build", Path(__file__).with_name("build.py"))
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)


class EscapingTest(unittest.TestCase):
    def test_title_and_description_are_escaped(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            (root / "src").mkdir()
            (root / "src" / "2026-01-01-q.md").write_text(
                'title: Ice & "Gas"\ndate: 2026-01-01\nweek: 1\n---\n'
                'He kept miming "can you hear me" at <four friends. Then more.\n',
                encoding="utf-8",
            )
            build.ROOT, build.SRC = root, root / "src"
            build.md_to_html = lambda md: "<p>body</p>"
            build.main()
            page = (root / "2026-01-01-q.html").read_text(encoding="utf-8")
            index = (root / "index.html").read_text(encoding="utf-8")
        self.assertIn('<meta name="description" content="He kept miming &quot;can you hear me&quot; at &lt;four friends.">', page)
        self.assertIn('<meta property="og:title" content="Ice &amp; &quot;Gas&quot; — Ikigai Collective Lab Notes">', page)
        self.assertIn('alt="Ice &amp; &quot;Gas&quot; — Lab Notes cover"', page)
        self.assertIn('<h1>Ice &amp; &quot;Gas&quot;</h1>', page)
        self.assertIn('>Ice &amp; &quot;Gas&quot;</a></li>', index)


if __name__ == "__main__":
    unittest.main()
