import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
class UserController {
  constructor(databaseConnection, redisClient) {
    this.databaseConnection = databaseConnection;
    this.redisClient = redisClient;
  }

  async registerUser(body) {
    const { fullname, email, username, password } = body;


    const hashedPassword = await bcrypt.hash(password, 10);
    const usersCollection = this.databaseConnection.collection('users');
    const existingUser = await usersCollection.findOne({ username });

    if (existingUser) {
      throw new Error("User already exists!");
    }

    const newUser = { username, fullname, email, password: hashedPassword };
    await usersCollection.insertOne(newUser);
  }

  async loginUser(body) {
    const { username, password } = body;

    const user = await this.databaseConnection.collection('users').findOne({ username });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    try {
      const result = await new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err || !result) {
            reject(new Error('Invalid credentials'));
          }
          resolve(result);
        });
      });

      if (!result) {
        throw new Error('Invalid credentials');
      }


      const token = jwt.sign({ username: user.username }, process.env.SECRET_JWT, { expiresIn: '12h' });

      return token;
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  }


  async getAuthenticatedUser(username) {

    const user = await this.databaseConnection.collection('users').findOne(
      { username },
      { projection: { _id: 0, password: 0 } }
    );

    return user;
  }

  async getRentalCars(query) {
    const match = await this.constructFilterObject(query);
    const cars = await this.databaseConnection.collection('cars').find(
      match,
    ).toArray();
    return cars;
  }

  async getRentalCarsCached(query) {
    const match = await this.constructFilterObject(query);
    let carRedisKey = "carsCached"
    let carsCached = await this.getRedisData("carRedisKey");

    if (!carsCached) {
      carsCached = await this.databaseConnection.collection('cars').find(
        match,
      ).toArray();

      await this.saveCarsToRedis(carRedisKey,carsCached);
    }


    return carsCached
  }

  async constructFilterObject(query) {
    let match = {}
    for (let queryFilter of Object.keys(query)) {
      match[queryFilter] = query[queryFilter]
    }
    return match;
  }

  async getRedisData(key) {
    return new Promise((resolve, reject) => {
      this.redisClient.get(key, (err, value) => {
        if (err) {
          console.error('Error getting value from Redis:', err);
          reject(err);
        } else if (!value) {
          resolve(null);
        } else {
          resolve(value);
        }
      });
    });
  }
  
  async saveCarsToRedis(key, value) {
    return new Promise((resolve, reject) => {
      this.redisClient.set(key, JSON.stringify(value), (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
  
  }



export default UserController;
