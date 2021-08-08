from flask import Flask,request, render_template

import subprocess
app = Flask(__name__)


@app.route('/')
def my_form():
    return render_template('home.html')
    
@app.route('/' , methods=['POST'])
def my_form_post():
 url= request.form['url']
 header=request.form['header']
 process = subprocess.Popen(['curl', url,'-H',header], stdout=subprocess.PIPE)
 stdout = process.communicate()[0]    
 return stdout


if __name__ == '__main__':
    app.run(host ='0.0.0.0', port = 80, debug = True)
