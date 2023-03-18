# MY-WIZARD API

API app powered by chat-gpt-3 that anables multiple db provisioning for different users. Each user would have full control over the stored documents (questiosn and response), delete their documents and so on. 

## Endpoints

### POST:
```javascript
/api/auth
```

Generates a JSON web token (JWT) using the `authorization` header of the request.

### POST:
 ```javascript
 /raybags/v1/wizard/ask-me
 ```

Validates a JWT using the `authorization` header, then calls the `GPT_5` function with the question from the request body, and finally save the result to the GPT_RESPONSE model in mongodb and return the response.

### GET:
```javascript
/raybags/v1/wizard/data
```

 Get paginated results:
```javascript
?page=page-number ie. ?page=1
```

For all results.

```javascript
-all
```

Get one item based on its id
```javascript
/raybags/v1/wizard/item/:id
```

### DELETE:
 ```javascript
 /raybags/v1/wizard/delete-item/:id
 ```

### GET :
Handles unsupported routes.

```javascript
'*'
```
## Getting Started

1. Clone the repository:
```javascript
git clone  https://github.com/raybags-web-dev/my-wizard-chat-gpt.git
```

2. Install the dependencies:
```javascript
npm install
```

3. Start the server:
```javascript
npm start
```

4. Test the endpoints using a tool like Postman or curl.
## Built With

* [Express.js](https://expressjs.com/) - The web framework used
* [Node.js](https://nodejs.org/) - The JavaScript runtime
* [Jest](https://jestjs.io/) - The testing framework
* [Mongoose](https://mongoosejs.com/) - The MongoDB object modeling tool and Database


## DOCKER

1. Build docker image
```javascript
docker build -t my-wizard-chat-gpt .
```

2. Run Docker container
```javascript
docker run -p 8080:4200 my-wizard-chat-gpt
```

3. You can pull the image from docker hub with 
```javascript
docker pull revraymondbaguma/wizard-chat:1.0.0
```

This will start the server inside the Docker container and map it to port 8080 on your local machine

## Author

* **Raymond Baguma** - *Initial work* - [raybags-web-dev](https://github.com/raybags-web-dev?tab=repositories)

This project is powered by chatGPT

