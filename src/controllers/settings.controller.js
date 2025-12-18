import {
  getCompanySettingsService,
  updateCompanyService,
  updateTeamMemberService,
  inviteUserService,
  removeUserFromCompanyService
} from "../services/settings.services.js";

/**
 * 🔹 Obtener detalles de la compañía y su equipo
 */
export const getCompanySettings = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ message: "companyId es obligatorio" });
    }

    const data = await getCompanySettingsService(Number(companyId));

    return res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error en getCompanySettings:", error);
    return res.status(500).json({
      message: "Error al obtener los ajustes de la compañía",
      error: error.message,
    });
  }
};

/**
 * 🔹 Actualizar datos de la compañía
 */
export const updateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const data = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "companyId es obligatorio" });
    }

    const updatedCompany = await updateCompanyService(Number(companyId), data);

    return res.status(200).json({
      message: "Compañía actualizada correctamente",
      company: updatedCompany,
    });
  } catch (error) {
    console.error("❌ Error en updateCompany:", error);
    return res.status(500).json({
      message: "Error al actualizar la compañía",
      error: error.message,
    });
  }
};

/**
 * 🔹 Actualizar rol / permisos de un miembro del equipo
 */
export const updateTeamMember = async (req, res) => {
  try {
    const { companyUserId } = req.params;
    const { role, enabled, canLogin } = req.body;

    if (!companyUserId) {
      return res.status(400).json({ message: "companyUserId es obligatorio" });
    }

    const updatedMember = await updateTeamMemberService(
      Number(companyUserId),
      { role, enabled, canLogin }
    );

    return res.status(200).json({
      message: "Miembro del equipo actualizado",
      data: updatedMember,
    });
  } catch (error) {
    console.error("❌ Error en updateTeamMember:", error);
    return res.status(500).json({
      message: "Error al actualizar el miembro del equipo",
      error: error.message,
    });
  }
};

/**
 * 🔹 Invitar usuario a la compañía
 */
export const inviteUser = async (req, res) => {
  try {
    const { companyId, email, title, type } = req.body;

    if (!companyId || !email) {
      return res.status(400).json({
        message: "companyId y email son obligatorios",
      });
    }

    const invitation = await inviteUserService({
      companyId,
      email,
      title,
      type,
    });

    return res.status(201).json({
      message: "Invitación enviada correctamente",
      data: invitation,
    });
  } catch (error) {
    console.error("❌ Error en inviteUser:", error);
    return res.status(500).json({
      message: error.message || "Error al invitar usuario",
    });
  }
};

/**
 * 🔹 Eliminar usuario de la compañía (NO eliminar user)
 */
export const removeUserFromCompany = async (req, res) => {
  try {
    const { companyUserId } = req.params;

    if (!companyUserId) {
      return res.status(400).json({ message: "companyUserId es obligatorio" });
    }

    await removeUserFromCompanyService(Number(companyUserId));

    return res.status(200).json({
      message: "Usuario eliminado de la compañía correctamente",
    });
  } catch (error) {
    console.error("❌ Error en removeUserFromCompany:", error);
    return res.status(500).json({
      message: "Error al eliminar el usuario de la compañía",
      error: error.message,
    });
  }
};
