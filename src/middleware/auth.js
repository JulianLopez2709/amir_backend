import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token1 = authHeader?.split(' ')[1];
  const token = req.cookies.token

  if (!token) return res.sendStatus(401);
  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403);
      req.userId = decoded.userId;
      next();
    });
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }

}
