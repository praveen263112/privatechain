# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Installation

Run npm install for getting all the dependent packages
```
npm install

```
## API End points
The webservices are created using the Hapi framework. The following endpoints are available so far.

- To get the details about a block using block height.
/GET  http://localhost:8000/block/[blockheight]

- To add a new block to the chain with the data provided by the user.
/POST http://localhost:8000/block/

Data constraints
----------------
Provide the data in the body.

{
    "body": "Sample data"
}

## Testing

To test code:
1: Uncomment the code from 184-196 in simpleChain.js and run simpleChain.js using node command. This will create a chain with 10 test blocks.This is only necessary if you need these many test blocks, else by performing step 2  would give you a chain with genesis block.
```
node simpleChain.js
```
2: The application uses Hapi for creating webservices. Open a terminal in the project path and run the app.js file using node command.
```
node app.js
```
3: The server will get started at port 8000.
4: API endpoints mentioned above can be tested either using Postman or Curl.
