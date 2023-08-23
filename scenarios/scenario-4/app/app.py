from flask import Flask, request, render_template
from jinja2 import Environment

app = Flask(__name__)
jinja_env = Environment()
@app.route("/page")
def page():
    name = request.args.get('name')
    if name:
        output = jinja_env.from_string('Hello ' + name + '!').render()
    else:
        output = "Please provide a name."
    return render_template('index.html', output=output)
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080)
