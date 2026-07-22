from PIL import Image

# Open the favicon
img = Image.open("favicon.png").convert("RGBA")
data = img.getdata()

new_data = []
for item in data:
    # Convert dark/black background pixels to transparent
    if item[0] < 20 and item[1] < 20 and item[2] < 20:
        new_data.append((0, 0, 0, 0))
    else:
        new_data.append(item)

img.putdata(new_data)
img.save("favicon.png", "PNG")
print("✨ Favicon background stripped to transparent!")