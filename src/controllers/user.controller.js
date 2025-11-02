import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} from "../services/user.services.js";

/**
 * Crea un usuario nuevo
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, username, password, phone, plan } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    const user = await createUserService({ name, email, username, password, phone, plan });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Obtiene todos los usuarios
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Obtiene un usuario por ID
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

/**
 * Actualiza un usuario
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedUser = await updateUserService(id, data);
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Elimina un usuario
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteUserService(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
