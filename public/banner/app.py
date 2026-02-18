from PIL import Image
import os

def convert_to_webp(input_path, output_path, target_size_kb=30):
    img = Image.open(input_path).convert("RGB")

    quality = 90  # start high
    step = 5

    while quality > 5:
        img.save(output_path, "WEBP", quality=quality, method=6)
        size_kb = os.path.getsize(output_path) / 1024

        if size_kb <= target_size_kb:
            print(f"Done! Size: {round(size_kb,2)} KB | Quality used: {quality}")
            return
        
        quality -= step

    print("Couldn't reach target size, lowest quality used.")

# usage
convert_to_webp("banner4.png", "output.webp", 30)
