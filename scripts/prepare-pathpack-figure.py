"""Compose unchanged canvas outputs from the public PATHPACK documentation.
Run node scripts/export-pathpack-panels.mjs first. Requires Pillow.
The two panels are a worked illustration, not experimental benchmark data.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
canvas = Image.new("RGB", (1600, 850), "#f4f6fa")
draw = ImageDraw.Draw(canvas)
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 26)
for index, (label, x) in enumerate([("Graph · nested-dissection ordering", 30), ("Matrix · reordered sparse structure", 830)]):
    draw.text((x, 24), label, font=font, fill="#313c50")
    panel = Image.open(f"/tmp/pathpack-panel-{index}.png").convert("RGBA")
    panel = panel.resize((740, 740), Image.Resampling.LANCZOS)
    canvas.paste(panel, (x, 85), panel)
destination = Path("client/public/research/pathpack-project.webp")
canvas.save(destination, quality=88, method=6)
print(destination, canvas.size, destination.stat().st_size)
