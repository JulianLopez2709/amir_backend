import prisma from "../config/db.js";

export async function authorizeCompanyAccess(req, res, next) {
  const companyId = Number(req.params.companyId);
  if (Number.isNaN(companyId)) {
    return res.status(400).json({ message: "companyId inválido" });
  }

  const membership = await prisma.userCompany.findFirst({
    where: { userId: req.userId, companyId, available: true },
  });

  if (!membership) {
    return res.status(403).json({ message: "Sin acceso a esta compañía" });
  }

  req.userCompanyRole = membership.role;
  next();
}

export function requireCompanyAdmin(req, res, next) {
  if (req.userCompanyRole !== "admin") {
    return res.status(403).json({
      message: "Solo el administrador de la empresa puede realizar esta acción",
    });
  }
  next();
}
