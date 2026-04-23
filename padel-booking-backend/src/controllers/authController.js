import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { normalizeText } from "../utils/validation.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase().slice(0, 120);
}

export async function login(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password || String(password).length > 128) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Error en login" });
  }
}

export async function register(req, res) {
  try {
    if (process.env.ALLOW_ADMIN_REGISTER !== "true") {
      return res.status(403).json({ message: "Registro deshabilitado" });
    }

    const name = normalizeText(req.body.name, 40);
    const lastName = normalizeText(req.body.lastName, 40);
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password || String(password).length < 8 || String(password).length > 128) {
      return res.status(400).json({ message: "Datos invalidos" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name || "Admin",
      lastName,
      email,
      password: hashedPassword,
      role: "admin",
    });

    return res.status(201).json({
      message: "Usuario creado correctamente",
      user: {
        id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ message: "Error al registrar usuario" });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("get me error:", err);
    return res.status(500).json({ message: "Error obteniendo usuario" });
  }
}

export async function updateMe(req, res) {
  try {
    const name = normalizeText(req.body.name, 40);
    const email = normalizeEmail(req.body.email);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Ese correo ya esta en uso" });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    return res.json({
      message: "Datos actualizados correctamente",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("update me error:", err);
    return res.status(500).json({ message: "Error actualizando usuario" });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    if (String(newPassword).length < 8 || String(newPassword).length > 128) {
      return res.status(400).json({ message: "La nueva contraseña debe tener al menos 8 caracteres" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "La contraseña actual es incorrecta" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("change password error:", err);
    return res.status(500).json({ message: "Error cambiando contraseña" });
  }
}
