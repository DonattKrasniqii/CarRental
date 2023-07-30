
import express from 'express';
import routes from './routes/carRental';
require('dotenv').config();
const app = express();

app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));



import bodyParser from 'body-parser';
app.use('/', routes);




const server = app.listen(3000, () => {
  const {address, port} = server.address();
  console.log(`app listening at http://${address}:${port}`);
});