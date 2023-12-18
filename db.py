import psycopg2, tags
from datetime import datetime


conn = None
cur  = None


def connect_db():
	return psycopg2.connect(dbname='rpii', user='postgres', password='postgres')


def get_recyclable_tags(recyclable_id):
	cur.execute(
		f"""
		SELECT tag
			FROM main.recyclable_tags
			WHERE recyclable_id = {recyclable_id}
		"""
		)
	recyclable_tags_list = cur.fetchall()
	return recyclable_tags_list[0]


def get_recyclable_entity(recyclable_id):
	cur.execute(
		f"""
		SELECT id, coordinates, update_timestamp
			FROM main.recyclable
			WHERE id = {recyclable_id};
		"""
		)
	recyclable = cur.fetchone()
	return recyclable


def get_recyclable_entity_in_area(point_1, point_2):
	
	min_lat = min(point_1[0], point_2[0])
	min_lon = min(point_1[1], point_2[1])
	max_lat = max(point_1[0], point_2[0])
	max_lon = max(point_1[1], point_2[1])
	cur.execute(
		f"""
		SELECT id, coordinates
			FROM main.recyclable
			WHERE coordinates[0] > {min_lat} AND coordinates[0] < {max_lat} AND coordinates[1] > {min_lon} AND coordinates[1] < {max_lon}
		"""
		)
	recyclable_list = cur.fetchall()
	return recyclable_list


def get_recyclable_images(recyclable_id):
	cur.execute(
		f"""
		SELECT image_blob
			FROM main.recyclable_image
			WHERE recyclable_id = {recyclable_id};
		"""
		)
	recyclable_image_list = cur.fetchall()
	return recyclable_image_list


def remove_image(recyclable_id, image_id):
	pass


def remove_tag_from_recyclable(tag, recyclable_id):
	pass


def insert_new_image(image_file, recyclable_id):

	binary_image_str = image_file.read()
	binary_data = psycopg2.Binary(binary_image_str) 
	cur.execute(
		'INSERT INTO main.recyclable_image (recyclable_id, image_blob) VALUES ' +
		f"({recyclable_id}, {binary_data});"
	)
	conn.commit()
	image_file.close()


def insert_tag_to_recyclable(tag, recyclable_id):

	cur.execute(
		'INSERT INTO main.recyclable_tags (recyclable_id, tag) VALUES ' +
		f"({recyclable_id}, '{str(tag).upper()}');"
	)
	conn.commit()


def insert_recyclable(coordinates, tags, images_files):

	recyclable_id = None

	cur.execute("SELECT nextval(pg_get_serial_sequence('main.recyclable', 'id'))")
	new_id = cur.fetchone()[0]
	conn.rollback()
	cur.execute(
		'INSERT INTO main.recyclable (id, coordinates, update_timestamp) VALUES ' +
		f"({new_id}, point({coordinates['lat']}, {coordinates['lon']}), '{str(datetime.now().astimezone())}');"
	)
	conn.commit()
	[insert_tag_to_recyclable(tag, new_id) for tag in tags]
	[insert_new_image(image_file, new_id) for image_file in images_files]
	
	return recyclable_id


def __init_db():

	global conn, cur
	conn = connect_db()
	cur  = conn.cursor()	

