from PIL import Image, ImageDraw

def create_circular_logo(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    data = img.getdata()
    width, height = img.size
    
    # Find bounding box of non-white pixels
    min_x, min_y = width, height
    max_x, max_y = 0, 0
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = data[y * width + x]
            # Consider non-white if RGB sum is less than say 250*3 = 750
            if r + g + b < 720 and a > 0:
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
                
    if min_x > max_x or min_y > max_y:
        print("Could not find logo")
        return
        
    print(f"Bounding box: {min_x}, {min_y} to {max_x}, {max_y}")
    
    # Crop to bounding box but keep it square
    box_width = max_x - min_x
    box_height = max_y - min_y
    size = max(box_width, box_height)
    
    # Center the square box
    center_x = min_x + box_width // 2
    center_y = min_y + box_height // 2
    
    left = center_x - size // 2
    top = center_y - size // 2
    right = left + size
    bottom = top + size
    
    # Add a tiny bit of padding (e.g. 5 pixels)
    padding = 5
    left -= padding
    top -= padding
    right += padding
    bottom += padding
    size += padding * 2
    
    img_cropped = img.crop((left, top, right, bottom))
    
    # Create circular mask
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size, size), fill=255)
    
    # Apply mask
    result = Image.new('RGBA', (size, size), (0,0,0,0))
    result.paste(img_cropped, (0, 0), mask=mask)
    
    result.save(output_path, "PNG")
    print(f"Saved cleanly masked logo to {output_path}")

create_circular_logo("public/accessbelt-official-logo.png", "public/accessbelt-official-logo-rembg.png")
