import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './configs/mongodb.js'

// app config
const PORT = process.env.PORT || 4000
const app = express()

// database connect
await connectDB()

// middleware
app.use(express.json())
app.use(cors())

// test route
app.get('/', (req, res) => res.send("API working"))

app.listen(PORT, () => console.log("Server Running on port " + PORT))
