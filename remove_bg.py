from PIL import Image

# Open the image from the public folder
img = Image.open("public/knight_only.png").convert("RGBA")
data = img.getdata()

new_data = []
for item in data:
    # Convert dark background pixels to transparent
    if item[0] < 20 and item[1] < 20 and item[2] < 20:
        new_data.append((0, 0, 0, 0))
    else:
        new_data.append(item)

img.putdata(new_data)
img.save("public/knight_only.png", "PNG")
print("✨ Background removed successfully!")