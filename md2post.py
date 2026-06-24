import sys, os, json, re, base64, mimetypes, shutil
from pathlib import Path
from urllib.parse import urlparse

try:
    import markdown
except ImportError:
    print("[!] Missing 'markdown' library. Run: pip3 install markdown")
    sys.exit(1)

POSTS_JSON = Path(__file__).parent / "posts.json"
POSTS_DIR = Path(__file__).parent / "posts"

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terminal System - Post</title>
    <style>
        :root { --matrix-green: #00FF41; --bright-green: #52FF88; --dim-green: #004400; }
        body {
            background-color: #000; color: var(--matrix-green);
            font-family: 'Share Tech Mono', monospace; line-height: 1.6;
            margin: 0; padding: 10px; word-wrap: break-word;
        }
        h1, h2, h3 {
            color: var(--bright-green); border-bottom: 2px solid var(--matrix-green);
            text-transform: uppercase; font-size: clamp(1.4rem, 7vw, 2.5rem);
        }
        strong, b { color: #FFF; font-weight: bold; text-shadow: 0 0 5px rgba(255,255,255,0.4); }
        blockquote.subtle-note {
            border-left: 2px solid var(--dim-green);
            color: var(--dim-green); font-size: 0.8rem;
            margin: 10px 0; padding-left: 15px; text-shadow: none;
        }
        .codehilite { background: #000; border-left: 4px solid var(--matrix-green); padding: 15px; overflow-x: auto; }
            .codehilite .k { color: #00FF41; font-weight: bold; }
            .codehilite .s { color: #FFFFFF; }
            .codehilite .nf { color: #52FF88; }
            .codehilite .c1 { color: #008F11; font-style: italic; }
            .codehilite .m { color: #FFFFFF; }
        img { max-width: 100%; border: 1px solid var(--matrix-green); margin: 20px auto; display: block; }
    </style>
</head>
<body>
    <div class="container">BODY_CONTENT</div>
</body>
</html>"""


def derive_name(md_path: str) -> str:
    base = Path(md_path).stem
    name = re.sub(r"[^a-zA-Z0-9]+", "-", base).strip("-").lower()
    return name or "untitled-post"


def load_posts():
    if POSTS_JSON.exists():
        return json.loads(POSTS_JSON.read_text())
    return {"posts": []}


def save_posts(data):
    POSTS_JSON.write_text(json.dumps(data, indent=4, ensure_ascii=False) + "\n")


def get_existing_categories(posts):
    cats = set()
    for p in posts.get("posts", []):
        for c in p.get("categories", []):
            cats.add(c)
    return sorted(cats)


def ask_name(suggested: str) -> str:
    print(f"\n--- Name ---")
    print(f"Suggested: {suggested}")
    answer = input("Enter name (or press Enter to accept): ").strip()
    return answer if answer else suggested


def ask_categories(existing: list) -> list:
    print(f"\n--- Categories ---")
    if existing:
        print("Existing categories:")
        for i, cat in enumerate(existing, 1):
            print(f"  [{i}] {cat}")
        print("  [n] Add new category")
        print("  [d] Done")
    else:
        print("No existing categories found.")
        print("  [n] Add new category")
        print("  [d] Done")

    selected = []
    while True:
        choice = input("Choice: ").strip().lower()
        if choice == "d":
            break
        elif choice == "n":
            new_cat = input("  New category name: ").strip().upper()
            if new_cat and new_cat not in selected:
                selected.append(new_cat)
                print(f"  Added '{new_cat}'")
                existing.append(new_cat)
            continue
        else:
            try:
                idx = int(choice) - 1
                if 0 <= idx < len(existing):
                    cat = existing[idx]
                    if cat not in selected:
                        selected.append(cat)
                        print(f"  Selected '{cat}'")
                    else:
                        print(f"  Already selected '{cat}'")
                else:
                    print("  Invalid index.")
            except ValueError:
                print("  Invalid input.")
    return selected


def get_next_order(posts) -> int:
    orders = []
    for p in posts.get("posts", []):
        o = p.get("order", 0)
        try:
            orders.append(int(o))
        except (ValueError, TypeError):
            orders.append(0)
    return max(orders) + 1 if orders else 1


def obsidian_to_markdown(content: str, md_dir: str) -> str:
    def replace_obsidian(match):
        alt = match.group(1)
        fname = match.group(2)
        img_path = Path(md_dir) / fname
        if img_path.exists():
            return f"![{alt}]({fname})"
        return f"![{alt}]({fname})"
    content = re.sub(r'!\[\[([^\]]*)\]\]', r'![\1](\1)', content)
    return content


def md_to_html(md_content: str) -> str:
    return markdown.markdown(
        md_content,
        extensions=["fenced_code", "tables", "codehilite"],
    )


def is_url(path: str) -> bool:
    parsed = urlparse(path)
    return parsed.scheme in ("http", "https")


def image_to_b64(img_path: str) -> str:
    path = Path(img_path)
    if not path.exists():
        return None
    mime_type, _ = mimetypes.guess_type(str(path))
    if mime_type is None:
        mime_type = "image/png"
    data = path.read_bytes()
    b64 = base64.b64encode(data).decode("ascii")
    return f"data:{mime_type};base64,{b64}"


def process_images(html: str, md_dir: str) -> str:
    def replace_img(match):
        alt = match.group(1)
        src = match.group(2)
        rest = match.group(3) or ""

        if is_url(src):
            return f'<img alt="{alt}" src="{src}"{rest}>'

        img_full_path = os.path.join(md_dir, src)
        if os.path.exists(img_full_path):
            b64_src = image_to_b64(img_full_path)
            if b64_src:
                print(f"  -> Encoded {src} to base64 ({len(b64_src)} chars)")
                return f'<img alt="{alt}" src="{b64_src}"{rest}>'
            else:
                print(f"  [!] Could not encode {src}")
                return match.group(0)
        else:
            print(f"  [!] Image not found: {img_full_path}")
            return match.group(0)

    html = re.sub(
        r'<img\s+alt="([^"]*)"\s+src="([^"]+)"([^>]*)?>',
        replace_img,
        html,
    )
    return html


def build_post_entry(name: str, categories: list, order: int, file_: str) -> dict:
    return {"name": name, "categories": categories, "order": order, "file": file_}


def register_post(entry: dict):
    data = load_posts()
    data["posts"].append(entry)
    save_posts(data)
    print(f"  -> Registered in posts.json")


def main():
    if len(sys.argv) < 2:
        print("Usage: md2post.py <path/to/post.md>")
        sys.exit(1)

    md_path = os.path.abspath(sys.argv[1])
    if not os.path.isfile(md_path):
        print(f"[!] File not found: {md_path}")
        sys.exit(1)

    md_dir = os.path.dirname(md_path)

    posts_data = load_posts()
    existing_cats = get_existing_categories(posts_data)

    suggested_name = derive_name(md_path)
    name = ask_name(suggested_name)
    categories = ask_categories(existing_cats)
    order = get_next_order(posts_data)

    file_name = re.sub(r"[^a-zA-Z0-9]+", "-", name).strip("-").lower() + ".html"

    print(f"\n--- Summary ---")
    print(f"  Name:       {name}")
    print(f"  Categories: {categories}")
    print(f"  Order:      {order}")
    print(f"  File:       {file_name}")
    confirm = input("Proceed? [Y/n]: ").strip().lower()
    if confirm == "n":
        print("Aborted.")
        sys.exit(0)

    md_content = Path(md_path).read_text(encoding="utf-8")

    md_content = obsidian_to_markdown(md_content, md_dir)

    body_html = md_to_html(md_content)

    body_html = process_images(body_html, md_dir)

    page_title = name
    full_html = HTML_TEMPLATE.replace("BODY_CONTENT", f"<h1>{page_title}</h1>\n{body_html}")

    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = POSTS_DIR / file_name

    if out_path.exists():
        resp = input(f"  [!] {file_name} already exists. Overwrite? [y/N]: ").strip().lower()
        if resp != "y":
            print("Aborted.")
            sys.exit(0)

    out_path.write_text(full_html, encoding="utf-8")
    print(f"  -> Saved posts/{file_name}")

    entry = build_post_entry(name, categories, order, file_name)
    register_post(entry)

    print("\n[DONE] Post created and registered.")


if __name__ == "__main__":
    main()
