const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const cors = require('cors');
const { ApolloServerPluginLandingPageGraphQLPlayground } = require("apollo-server-core");

const userdata = require("./MOCK_DATA.json");

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
  const server = new ApolloServer({ 
    typeDefs, 
    resolvers,
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground({
        settings: {
          'request.credentials': 'include' // Set credentials ke 'include'
        }
      })
    ],
  });
  await server.start();

  const app = express();
  app.use(cors()); // Mengizinkan CORS dari semua asal

  // Middleware Apollo
  server.applyMiddleware({ 
    app,
    // Menangani header WWW-Authenticate jika otentikasi diperlukan
    onHealthCheck: () => {
      return new Promise((resolve, reject) => {
        // Di sini Anda dapat menambahkan logika untuk memeriksa otentikasi
        // Jika otentikasi diperlukan, Anda dapat menolak permintaan dengan menetapkan reject
        resolve();
      });
    }
  });

  // Middleware untuk menangani permintaan yang tidak cocok dengan endpoint apa pun
  app.use((req, res, next) => {
    res.status(404).json({ message: "Endpoint not found" });
  });

  const PORT = process.env.PORT || 4006;
  const initialEndpoint = 'https://server-graphql-42305a.bridevstudio.bbri.io/proxy/4000/graphql';

  app.listen({ port: PORT }, () =>
    console.log(`Server berjalan di http://localhost:${PORT}${server.graphqlPath}`)
  );

  // Menambahkan endpoint untuk Sandbox Apollo
  app.get('/sandbox', (req, res) => {
    res.send(`
      <div id="root"></div>
      <script src="https://unpkg.com/@apollo/sandbox@latest/dist/sandbox.js"></script>
      <script>
        const sandbox = new ApolloSandbox({
          initialEndpoint: '${initialEndpoint}',
          root: document.getElementById('root')
        });
        sandbox.start();
      </script>
    `);
  });
}

startApolloServer();
