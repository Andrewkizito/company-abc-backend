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

#### `npm run test`
Runs all tests present in the application `/tests` folder.

API Endpoints
This API application exposes the following endpoints:

### Api Endpoints
`/products`: This handles all the requests that involve creation, and updating of products that in mongodb database.

#### Methods
*GET* - This will return a list of all procts in the database

*POST* - This will create A new product by passing in a payload inform of formData with the following fields accompanied with an Authorization header with the auth token.
- productName: The name of the product
- description: Short sumamry about product
- image: Name of the image file to be used
- uploadFile: Javascript file Object
- rating: Rating of the product
- stock: Total amount in stock
- unit: Units used to measure the product

*PATCH* - This will update the product by passing in a payload inform of json with the following fields `_id: string, newStock: number` accompanied with an Authorization header with the auth token.

`/orders`: Handlers all order related actions such as placing an order, deleting an order, approving and order and also rejecting an order

#### Methods
*GET /orders*: Gets all orders from the database.
*POST /orders*: Added a new order to the database.
*PATCH /orders/reject*: Changes the order status to REJECTED given an id of the order
*PATCH /orders/approve*: Approves an order given an id of the order and changes its status to APPROVED
*PATCH /orders/approve*: Takes an id of the order and changes its status to COMPLETED

`/auth`: Handles authentication which includes login, registration and token validation.

#### Methods
*POST /auth/register* - This will create a new user by passing in a payload inform of json with `username and password`.
*POST /auth/login* - This will generate an auth token for a user by passing in a payload inform of json with `username and password`
*GET /auth/status* - This will validate an auth token which is found in the `Authoriozation header`