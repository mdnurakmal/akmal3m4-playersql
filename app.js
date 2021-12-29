const express = require('express');
const mysql = require('promise-mysql');
require('dotenv').config();
const fs = require('fs');
const app = express()
const port = 8080

app.enable('trust proxy');

// Automatically parse request body as form data.
app.use(express.urlencoded({extended: false}));
// This middleware is available in Express v4.16.0 onwards
app.use(express.json());

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const ensureSchema = async pool => {
    // Wait for tables to be created (if they don't already exist).
    await pool.query(
      `CREATE TABLE IF NOT EXISTS Players (
        Email varchar(255),
        Slot1 int,
        Slot2 int,
        Slot3 int,
        Slot4 int,
        Slot5 int,
        Slot6 int
    );`
    );
    console.log("Ensured that table 'votes' exists");
  };
  

const createTcpPool = async config => {
    // Extract host and port from socket address

    // Establish a connection to the database
    return mysql.createPool({
      user: "root", // e.g. 'my-db-user'
      password: "root", // e.g. 'my-db-password'
      database: "players", // e.g. 'my-database'
      host: '10.10.51.5', // e.g. '127.0.0.1'
      port: '3306', // e.g. '3306'
      // ... Specify additional properties here.
    });
  };

  const createPool = async () => {
    const config = {
      // [START cloud_sql_mysql_mysql_limit]
      // 'connectionLimit' is the maximum number of connections the pool is allowed
      // to keep at once.
      connectionLimit: 5,
      // [END cloud_sql_mysql_mysql_limit]
  
      // [START cloud_sql_mysql_mysql_timeout]
      // 'connectTimeout' is the maximum number of milliseconds before a timeout
      // occurs during the initial connection to the database.
      connectTimeout: 10000, // 10 seconds
      // 'acquireTimeout' is the maximum number of milliseconds to wait when
      // checking out a connection from the pool before a timeout error occurs.
      acquireTimeout: 10000, // 10 seconds
      // 'waitForConnections' determines the pool's action when no connections are
      // free. If true, the request will queued and a connection will be presented
      // when ready. If false, the pool will call back with an error.
      waitForConnections: true, // Default: true
      // 'queueLimit' is the maximum number of requests for connections the pool
      // will queue at once before returning an error. If 0, there is no limit.
      queueLimit: 0, // Default: 0
      // [END cloud_sql_mysql_mysql_timeout]
  
      // [START cloud_sql_mysql_mysql_backoff]
      // The mysql module automatically uses exponential delays between failed
      // connection attempts.
      // [END cloud_sql_mysql_mysql_backoff]
    };


    return createTcpPool(config);

  };

  const createPoolAndEnsureSchema = async () =>
  await createPool()
    .then(async pool => {
      await ensureSchema(pool);
      return pool;
    })
    .catch(err => {
      console.log("error here 2");
      throw err;
    });

    let pool;

    app.use(async (req, res, next) => {
        if (pool) {
          return next();
        }
        try {
          pool = await createPoolAndEnsureSchema();
          next();
        } catch (err) {
          console.log("error here");
          res.status(500).send('Health check did not pass');
          return next(err);
        }
      });
      

      app.get('/', async (req, res) => {
        pool = pool || (await createPoolAndEnsureSchema());
        console.log(req.query.id);
        try {
          // Get the 5 most recent votes.
          const recentVotesQuery = pool.query(
            'SELECT Email, Slot1 ,Slot2,Slot3,Slot4,Slot5,Slot6 FROM Players WHERE Email="'+req.query.id+'";'
          );
      
          
          const recentVotes = await recentVotesQuery;

          if (req.query.id)
          res.json(recentVotes);
          console.log(recentVotes);

        } catch (err) {
 
          res
            .status(500)
            .send(
              'Unable to load page. Please check the application logs for more details.'
            )
            .end();
        }
      });