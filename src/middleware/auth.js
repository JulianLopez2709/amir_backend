import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader?.split(' ')[1];
  const tokenFromCookie = req.cookies?.token;

  const token = tokenFromHeader || tokenFromCookie;

  if (!token) return res.sendStatus(401);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(403).json({ message: "Token inválido o expirado" });
    }

    req.userId = decoded.userId;
    req.companyId = decoded.companyId;

    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }

}

export const authorizeCompany = async (req, res, next) => {
  const { companyId } = req.body;
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader?.split(' ')[1];
  const tokenFromCookie = req.cookies?.token;

  const token = tokenFromHeader || tokenFromCookie;

  try {
    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado." });
    }

    if (!companyId) {
      return res.status(400).json({ message: "No se ha seleccionado ninguna compañía." });
    }

    // ✅ Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Aquí está la corrección
    const userId = decoded.userId;

    const companyIdNumber = Number(companyId);
    if (isNaN(companyIdNumber)) {
      return res.status(400).json({ message: "El ID de compañía no es válido." });
    }


    // ✅ Verificar relación en BD
    const userCompany = await prisma.userCompany.findFirst({
      where: { userId, companyId: companyIdNumber, available: true },
    });


    if (!userCompany) {
      return res.status(403).json({
        message: "No tienes acceso a esta compañía o fue deshabilitada.",
      });
    }

    // Añadir los datos al request para usarlos después
    req.userId = userId;
    req.companyId = companyId;

    next();
  } catch (error) {
    console.error("Error en authorizeCompany:", error);
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};



export const generateToken = (user, companyId,role, expiresIn = "12h") => {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,  
    companyId,
    role
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};