# save this as app.py
import db
import json
import io
from flask import Flask, render_template, request, url_for, send_file


app = Flask(__name__)


@app.route('/')
def hello():
    return render_template("default.html")


@app.get('/markers-inbound=<p1>&<p2>')
def markers_inbound(p1, p2):
    p1 = tuple(float(p) for p in p1.split(','))
    p2 = tuple(float(p) for p in p2.split(','))
    points_in_area = db.get_recyclable_entity_in_area(p1, p2)
    points_in_area_dict = {'points': []}
    for point_index, point in enumerate(points_in_area):
        points_in_area_dict['points'].append({'id': point[0], 'coordinates': list(float(p) for p in point[1][1:-2].split(','))})
        points_in_area_dict['points'][point_index]['tags'] = db.get_recyclable_tags(point[0])
        points_in_area_dict['points'][point_index]['last_modified'] = str(db.get_recyclable_entity(point[0])[2])


    return json.dumps(points_in_area_dict, indent=2)


@app.get('/recyclabe-img=<recyclable_id>')
def recyclabe_img(recyclable_id):
    return send_file(
        io.BytesIO(db.get_recyclable_images(recyclable_id)[0][0]),
        mimetype='image/png',
        as_attachment=True,
        download_name=f'{recyclable_id}.png'
    )


db.__init_db()

