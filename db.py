import psycopg2, tags


def connect_pg():
	return psycopg2.connect("dbname=rpii user=postgres password=postgres")


def insert_recyclable(coordinates, tags, images_files):
	pass


def insert_new_image(recyclable_id, image_file):
	pass


def remove_image(recyclable_id, image_id):
	pass


def add_tag_to_recyclable(tag, recyclable_id):
	pass


def remove_tag_from_recyclable(tag, recyclable_id):
	pass


# implement:
#def __import__():

