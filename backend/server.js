import express from 'express'
import cors from 'cors'
import 'dotenv/config' 
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import authRouter from './routes/authRoutes.js'

// App config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.get('/', (req,res) => {
    res.send("API working")
})

//Routes
app.use('/api/auth', authRouter)


app.listen(port, () => {
    console.log("Server started on port: ", port)
})