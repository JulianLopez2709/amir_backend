import prisma from "../config/db.js";

/**
 * 🔹 Obtener detalles de la compañía y su equipo
 */
export const getCompanySettingsService = async (companyId) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      users: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
            },
          },
        },
      },
    },
  });

  if (!company) {
    throw new Error("La compañía no existe");
  }

  return company;
};

/**
 * 🔹 Actualizar información de la compañía
 */
export const updateCompanyService = async (companyId, data) => {
  const company = await prisma.company.update({
    where: { id: companyId },
    data: {
      name: data.name,
      logo: data.logo,
      address: data.address,
      phone: data.phone,
      description: data.description,
    },
  });

  return company;
};

/**
 * 🔹 Actualizar rol / permisos de un miembro del equipo
 */
export const updateTeamMemberService = async (companyUserId, data) => {
  const updatedMember = await prisma.companyUser.update({
    where: { id: companyUserId },
    data: {
      role: data.role,
      enabled: data.enabled,
      canLogin: data.canLogin,
    },
  });

  return updatedMember;
};

/**
 * 🔹 Invitar usuario a la compañía
 */
export const inviteUserService = async ({ companyId, email, title, type }) => {
  // 1️⃣ Validar que el usuario exista
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("El usuario no existe");
  }

  // 2️⃣ Validar que NO pertenezca a la compañía
  const existingRelation = await prisma.companyUser.findFirst({
    where: {
      companyId,
      userId: user.id,
    },
  });

  if (existingRelation) {
    throw new Error("El usuario ya pertenece a esta compañía");
  }

  // 3️⃣ Crear invitación
  const invitation = await prisma.invitation.create({
    data: {
      companyId,
      userId: user.id,
      title,
      type,
      status: "pending",
    },
  });

  return invitation;
};

/**
 * 🔹 Eliminar usuario de la compañía (solo relación)
 */
export const removeUserFromCompanyService = async (companyUserId) => {
  await prisma.companyUser.delete({
    where: { id: companyUserId },
  });

  return true;
};
