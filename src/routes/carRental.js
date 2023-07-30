import express from 'express';
const router = express.Router();
import connectToDatabase from '../services/Database'
import RegisterValidator from '../validators/RegisterValidator'
import UserController from '../controllers/UserController';
import authMiddleware from '../middleware/auth'
const Redis = require("ioredis");
//let database = connectDatabase();

let databaseConnection = null;
let redisClientConnection = null;


async function connectFromServer() {

  databaseConnection = await connectToDatabase()
}



async function connectToRedis() {
  try {
    redisClientConnection = new Redis({
    });

  

    

  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
}

// Call the function to connect to Redis
connectToRedis();
connectFromServer()

router.get('/', (req, res) => {
  res.send({ message: 'Car Rental API!!' });
});

router.post('/register', RegisterValidator, async (req, res) => {

  try {

    const userController = new UserController(databaseConnection);

    await userController.registerUser(req.body);

    res.send({ message: "User registred succesfuly" })

  } catch (error) {
    res.send({ message: error.message })
  }

});

router.post('/login', async (req, res) => {
  try {

    const userController = new UserController(databaseConnection);

    let token = await userController.loginUser(req.body);
    
    res.send({ token })

  } catch (error) {
    res.send({ message: error.message })
  }
});

router.get('/myprofile', authMiddleware, async (req, res) => {

  try {
    const userController = new UserController(databaseConnection);

    let userProfile = await userController.getAuthenticatedUser(req.username);

    return res.send({ userProfile })

  } catch (error) {
    res.send("Something went wrong!");
  }
});


router.get('/rental-cars', async (req, res) => {
  try {

    const userController = new UserController(databaseConnection);

    let cars = await userController.getRentalCars(req.query);
    res.send({ cars })

  } catch (error) {
    res.send({ message: error.message })
  }
});

router.get('/cached-rental-cars', async (req, res) => {
  try {

    const userController = new UserController(databaseConnection, redisClientConnection);

    let cars = await userController.getRentalCarsCached(req.query);
    res.send({ cars })
  } catch (error) {
    res.send({ message: error.message })
  }
});

export default router;