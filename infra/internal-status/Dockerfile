FROM python:alpine 
COPY . /app
WORKDIR /app
RUN apk add curl
RUN pip install flask
EXPOSE 80 
ENTRYPOINT [ "python" ] 
CMD [ "app.py" ]
