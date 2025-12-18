import { Router } from "express";
import {
  getCompanySettings,
  updateCompany,
  updateTeamMember,
  inviteUser,
  removeUserFromCompany
} from "../controllers/settings.controller.js";

const router = Router();

/**
 * 🔹 Obtener detalles de la compañía y equipo
 */
router.get("/:companyId", getCompanySettings);

/**
 * 🔹 Actualizar información de la compañía
 */
router.put("/:companyId", updateCompany);
router.patch("/:companyId", updateCompany);

/**
 * 🔹 Actualizar rol / permisos de un miembro
 */
router.put("/team/:companyUserId", updateTeamMember);
router.patch("/team/:companyUserId", updateTeamMember);

/**
 * 🔹 Invitar usuario a la compañía
 */
router.post("/invite", inviteUser);

/**
 * 🔹 Eliminar usuario de la compañía (solo relación)
 */
router.delete("/team/:companyUserId", removeUserFromCompany);

export default router;
