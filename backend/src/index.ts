import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'TaskSultan backend running' }))

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`TaskSultan backend listening on port ${port}`)
})
