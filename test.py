import tags, db, random


p1 = (-23.411275904642284, -46.998686760589010) # ponto 1 do retângulo sobre SP
p2 = (-23.753708940452846, -46.276644361319400) # ponto 2 do retângulo sobre SP

'''
SELECT id, coordinates
	FROM main.recyclable
	WHERE 
	earth_distance(ll_to_earth(coordinates[1], coordinates[0]), ll_to_earth(-46.52134431513462, -23.476940304830933)) < earth_distance(ll_to_earth(-46.52134431513462, -23.476940304830933), ll_to_earth(-46.479269146843580, -23.488966811450332))
	AND
	earth_distance(ll_to_earth(coordinates[1], coordinates[0]), ll_to_earth(-46.479269146843580, -23.488966811450332)) < earth_distance(ll_to_earth(-46.52134431513462, -23.476940304830933), ll_to_earth(-46.479269146843580, -23.488966811450332))
'''


def test_1():

	db.__init_db()
	img_file = open("C:\\Users\\Bruno\\dev\\RPII\\static\\Logo_EACH-USP.svg", 'rb')
	db.insert_recyclable(coordinates={"lat": -23.518178, "lon": -46.4760899}, tags=[tags.Tag.PET], images_files=[img_file])


def fake_location(material_type):
	
	random_point = (min(p1[0], p2[0]) + random.random() * abs(p1[0] - p2[0]), min(p1[1], p2[1]) + random.random() * abs(p1[1] - p2[1]))
	return random_point, material_type


if __name__ == '__main__':
	print(*[fake_location(random.choice([str(elem).upper() for elem in list(tags.Tag)])) for _ in range(20)], sep='\n')

