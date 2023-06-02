const express = require('express')
const morgan = require('morgan')
const { Pool } = require('pg')

const app = express()

app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))

// https://gist.githubusercontent.com/meech-ward/1723b2df87eae8bb6382828fba649d64/raw/ee52637cc953df669d95bb4ab68ac2ad1a96cd9f/lotr.sql
const pool = new Pool({
  host: 'terraform-20230602101730172600000003.cjhrqy0ejiqm.us-east-1.rds.amazonaws.com',
  user: 'postgress',
  port: 5432,
  password: 'postgress',
  database: 'postgress',
})


// Check PostgreSQL connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack)
  }
  console.log('Connected to PostgreSQL')
  release()
})

// Test route to check database connection
app.get("/", async (req, res) => {
  try {
    const query = 'SELECT 1';
    const result = await pool.query(query);
    res.send({ status: 'Connected to PostgreSQL' });
  } catch (error) {
    console.error('Error querying database:', error.stack);
    res.status(500).send({ error: 'Failed to connect to PostgreSQL' });
  }
});

function getRandomInt(max) {
  return 1 + Math.floor(Math.random() * (max-1))
}

async function getCharacter(id) {
  const query = 'SELECT * FROM characters WHERE id = $1';
  const { rows } = await pool.query(query, [id]);
  const characters = rows;
  return characters[0]
}
async function randomId() {
  const query = 'SELECT COUNT(*) as totalCharacters FROM characters';
  const { rows } = await pool.query(query);
  const { totalCharacters } = rows[0]
  const randomId = getRandomInt(totalCharacters)
  return randomId
}

app.get("/test", (req, res) => {
  res.send("<h1>It's working 🤗</h1>")
})


app.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id) || await randomId()
    const character = await getCharacter(id)
    res.send(character)
  } catch (error) {
    res.send(error)
  }
})

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Listening on port ${port}`))