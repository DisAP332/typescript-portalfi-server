# Enable nodemon to restart server / Use concurrently / rimraf to delete old dist folder on rebuild.

# download types for express and node

npm i -D express typescript @types/express @types/node nodemon rimraf concurrently

add to scripts in package.json

    "build": "rimraf dist && npx tsc",
    "prestart": "npm run build",
    "start": "node dist/index.js",
    "predev": "npm run build",
    "dev": "concurrently \"npx tsc -w\" \"nodemon dist/index.js\""

# now download cors along with types & dotenv for hidden enviorment variables.

npm i cors dotenv
npm i -D @types/cors

# create your enviorment variables in .env: touch .env

add to .env:
HTTPS_PORT = 8443
HTTP_PORT = 8080

# create .gitignore and place node_modules and .env inside.

touch .gitignore
.gitignore:
.env
node_modules

/// this is to make sure now that you dont upload sensitive data to your github ///

# create your index.ts file and import express, cors, configDotenv.

import express, { Express, Request, Response } from "express";
import cors from "cors"
import "dotenv/config";

# add Express to initilize under the app constant. You will use this a moniker for the express function

# create a '/' route on a GET endpoint as a test for the server is up.

const app: Express = express();

app.use(cors())
app.use(express.json())

app.get("/", (req: Request, res: Response) => {
res.send("server is online");
});

# have your app listen on a http port and https port 8080 and 8443 respsectivly.

# use your .env file to keep these ports hidden. pull them from there with process.env.VARIABLE HERE

const httpPort = process.env.HTTP_PORT
const httpsPort = process.env.HTTPS_PORT

app.listen(httpPort, () => {
console.log(`HTTP server running on httpPort`);
});
app.listen(httpsPort, () => {
console.log(`HTTPS server running on httpsPort}`);
});

# lets create our database connection via mongoose

npm i mongoose

mkdir database
cd database
touch index.ts

# we are going to formulate our mongoose connection to redirect

# to different database dependent on what user is logged in.

add your mongodb URI from mongoDB atlas. You can find this in your DB.
only add the part before ?retryWrites have it like this.
URI = process.env.DATABASE + `${requestor}?retryWrites=true&w=majority`;
this will allow you to use the requestor paramater to indicate what databaase to log into.

import { createConnection } from "mongoose";

create a function called Connection, make it async, with a parameter requestor that is type: string

create error handling for if requestor is not present,

wrap your connection in a try catch for error handling of mongoose connection and return
either connection: true / false message: "error message" "connected success"

# lets impliment a JSON Web Token authentication.

-- i am not currently allowing users to sign up on this app or on this server as a added layer of security. 

Therfore we go foward with the assumption users have already been created.

lets install our depedencies:

npm i passport passport-local jsonwebtoken bcrypt cookie-parser

npm i -D @types/passport @types/passport-local @types/bcrypt @types/jsonwebtoken @types/cookie--parser

