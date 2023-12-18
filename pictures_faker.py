from PIL import Image, ImageDraw


background_color = (223, 235, 234)
foreground_color = (44, 51, 50)
resolution       = (768, 1024)
material_types   = {'PAPER', 'PLASTIC', 'GLASS', 'METAL', 'ORGANIC', 'PET', 'COOKING OIL', 'ALUMINIUM', 'IRON', 'FURNITURE/FIXTURE'}

def new_image(material_type):
	image = Image.new('RGB', resolution, background_color)
	draw = ImageDraw.Draw(image)
	draw.text(tuple(int(p/2) for p in resolution), material_type, anchor='mm', align='middle', fill=foreground_color, font_size=64)
	return image

	
[new_image(material).save(f'static/fake_images/{material.replace(" ", "-").replace("/", "-")}.png') for material in material_types] 
