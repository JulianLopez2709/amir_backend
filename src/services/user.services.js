import prisma from "../config/db.js";
import bcrypt from "bcrypt";

/**
 * 🔹 Crea un nuevo usuario
 */
export const createUserService = async ({ name, email, username, password, phone, plan = "basic" }) => {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new Error("El correo o nombre de usuario ya están registrados.");
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        phone,
        plan,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        plan: true,
        phone: true,
        createdAt: true,
      },
    });

    return newUser;
  } catch (error) {
    console.error("❌ Error en createUserService:", error.message);
    throw new Error("No se pudo crear el usuario. Verifica los datos enviados.");
  }
};

/**
 * 🔹 Obtiene todos los usuarios
 */
export const getAllUsersService = async () => {
  try {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        plan: true,
        phone: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error.message);
    throw new Error("Error al obtener los usuarios.");
  }
};

/**
 * 🔹 Obtiene un usuario por ID
 */
export const getUserByIdService = async (id) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        companies: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!user) throw new Error("Usuario no encontrado.");
    return user;
  } catch (error) {
    console.error("❌ Error en getUserByIdService:", error.message);
    throw new Error("No se pudo obtener el usuario.");
  }
};

/**
 * 🔹 Actualiza un usuario
 */
export const updateUserService = async (id, data) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data,
    });
    return updatedUser;
  } catch (error) {
    console.error("❌ Error en updateUserService:", error.message);
    throw new Error("No se pudo actualizar el usuario.");
  }
};

/**
 * 🔹 Elimina un usuario
 */
export const deleteUserService = async (id) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    return { message: "Usuario eliminado correctamente." };
  } catch (error) {
    console.error("❌ Error en deleteUserService:", error.message);
    throw new Error("No se pudo eliminar el usuario.");
  }
};


