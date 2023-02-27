# Project Overview

This is an API application built using Express, a popular Node.js web framework for building web applications and APIs. The API is designed to manage a frontend react [application that sells agricultural procucts](https://github.com/Andrewkizito/company-abc-frontend). The API is built with the following technologies:

- Express
- Node.js
- Typescript
- AWS-SDK
- Mongodb

To run this API locally, follow the steps below:

Clone this repository to your local machine
Navigate to the cloned directory using cd [repository-name]
Install the required dependencies using npm install
Start the development server using npm run dev
Open the web application (https://github.com/Andrewkizito/company-abc-frontend)

### Available scripts
#### `npm install`

Installs all the projects dependencies.
This will install all the dependencies and external libraries that the project utilises.

#### `npm start`

Runs the app in the production mode.
This only works after running `npm run build` which compiles all files from typescript to javascript into the `/build` folder.

#### `npm run build`

Builds the app for production to the `build` folder.
This will compile all the typescript files into javascript which can the de deployed onto a server.
Note: Always copy `/public` into `/build/public` since the ites our static folder which is is required but the application but it is not copied by the build command.

#### `npm run eslint`
Runs eslint to confirm if application code follows recommended specifications.

API Endpoints
This API application exposes the following endpoints:

### Api Endpoints
`/products`: This handles all the requests that involve creation, and updating of products that in mongodb database.

`/orders`: Handlers all order related actions such as placing an order, deleting an order, approving and order and also rejecting an order

`/auth`: Deletes with authentication which includes login, registration and token validation.
