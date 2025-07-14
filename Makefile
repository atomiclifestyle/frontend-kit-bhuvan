APP_NAME=my-app
PORT=8080

run:
	docker build -t $(APP_NAME) . && docker run -p $(PORT):$(PORT) $(APP_NAME)
