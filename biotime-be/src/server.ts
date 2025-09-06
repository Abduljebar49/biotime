// // import { buildServer } from './app';
// import app from './app';
// import { AppDataSource } from './config/data-source';

// const PORT = process.env.PORT || '3000';

// AppDataSource.initialize()
//   .then(async () => {
//     const server = await app();

//     try {
//       const address = await server.listen({ port: Number(PORT), host: '0.0.0.0' });
//       console.log(`Server running at ${address}`);
//     } catch (err) {
//       server.log.error(err, 'Error starting server');
//       process.exit(1);
//     }
//   })
//   .catch((error: Error) => {
//     console.error('Error during Data Source initialization:', error);
//   });
