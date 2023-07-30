import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.SECRET_JWT, function(err, decoded) {
    if (err) {
      // Handle the error here
      console.log(err);
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      // If verification is successful, attach the decoded data to the request object
      req.username = decoded.username;
      next();
    }
  });
};

export default authMiddleware;
