const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const cors = require('cors');
const { json } = require('express');
const yaml = require('js-yaml');
const fs = require('fs');

const userdata = require("./MOCK_DATA.json");


const corsOptions = {
  origin: 'https://studio.apollographql.com',
    credentials: 'include',
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'apollo-require-preflight',
    ],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
};

const typeDefs = gql`
  type User {
    id: Int
    firstname: String
    lastname: String
    email: String
    password: String
  }

  type Query {
    getAllUser: [User]
  }

  type Mutation {
    createUser(firstname: String, lastname: String, email: String, password: String): User
  }
`;

const resolvers = {
  Query: {
    getAllUser: () => userdata,
  },
  Mutation: {
    createUser: (_, args) => {
      const newUser = {
        id: userdata.length + 1,
        firstname: args.firstname,
        lastname: args.lastname,
        email: args.email,
        password: args.password
      };
      userdata.push(newUser);
      return newUser;
    }
  }
};

async function startApolloServer() {
  const app = express();

  const server = new ApolloServer({ typeDefs, resolvers });

  app.use(cors(corsOptions)); // Terapkan middleware CORS di sini

  app.use(json());
  
  await server.start();
  server.applyMiddleware({
    app,
    cors: false, // Setel ke false karena middleware CORS sudah menangani ini
  });

  app.get('/getAllUser', (req, res) => {
    res.json(userdata);
  });

  const PORT = process.env.PORT || 4005;

  app.listen({ port: PORT }, () =>
    console.log(`Server berjalan di http://localhost:${PORT}${server.graphqlPath}`)
  );
}

startApolloServer();
