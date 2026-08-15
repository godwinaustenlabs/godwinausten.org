import re

with open("src/components/Loader.tsx", "r") as f:
    content = f.read()

# Extract paths
stroke_paths = re.findall(r'<path\s+className="loader-logo-path-stroke"\s+d="(.*?)"\s+fill="none"\s+stroke=\{primaryColor\}\s+strokeWidth="10"\s+strokeLinecap="round"\s+style=\{\{ opacity: 0 \}\}\s+transform="(.*?)"\s+/>', content, re.DOTALL)

fill_paths = re.findall(r'<path\s+className="loader-logo-path-fill"\s+d="(.*?)"\s+fill=\{primaryColor\}\s+style=\{\{ opacity: 0 \}\}\s+transform="(.*?)"\s+/>', content, re.DOTALL)

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 2000">
  <rect width="2000" height="2000" fill="#fdfbf7" rx="400" />
"""

for d, transform in stroke_paths:
    svg_content += f'  <path d="{d}" fill="none" stroke="#1b1b1a" stroke-width="10" stroke-linecap="round" transform="{transform}" />\n'

for d, transform in fill_paths:
    svg_content += f'  <path d="{d}" fill="#1b1b1a" transform="{transform}" />\n'

svg_content += "</svg>"

with open("public/icon.svg", "w") as f:
    f.write(svg_content)

print("Generated icon.svg")
