import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader?.split(' ')[1];
  const tokenFromCookie = req.cookies?.token;

  const token = tokenFromHeader || tokenFromCookie;

  if (!token) return res.sendStatus(401);
  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403);

      req.userId = decoded.userId;
      req.companyId = decoded.companyId;

      console.log(`Usuario ${req.userId} de la empresa ${req.companyId} autenticado.`);

      next();
    });
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }

}


export const generateToken = (payload, expiresIn = "7d") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};