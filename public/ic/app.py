import os
from PIL import Image

# 📂 Input & Output folders
INPUT_FOLDER = "./"
OUTPUT_FOLDER = "output_webp"

# Agar output folder nahi hai to bana do
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Resize size
SIZE = (80, 80)

# WebP quality (0-100) -> kam karoge to size aur kam hoga
QUALITY = 100  

for filename in os.listdir(INPUT_FOLDER):
    if filename.lower().endswith(".webp"):
        input_path = os.path.join(INPUT_FOLDER, filename)
        output_path = os.path.join(OUTPUT_FOLDER, filename)

        try:
            with Image.open(input_path) as img:
                
                # Convert to RGBA (transparency safe)
                img = img.convert("RGBA")
                
                # Resize
                img = img.resize(SIZE, Image.LANCZOS)

                # Save optimized WebP
                img.save(
                    output_path,
                    "WEBP",
                    quality=QUALITY,
                    optimize=True,
                    method=6  # best compression
                )

                print(f"✅ Done: {filename}")

        except Exception as e:
            print(f"❌ Error in {filename}: {e}")

print("🎉 All images processed!")