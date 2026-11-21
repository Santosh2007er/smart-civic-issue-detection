const { getPool, isMySQLConnected, inMemoryStore } = require('../config/db');

class UserModel {
  static async findByEmail(email) {
    if (isMySQLConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0] || null;
    } else {
      const user = inMemoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      return user || null;
    }
  }

  static async findById(id) {
    if (isMySQLConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?', [id]);
      return rows[0] || null;
    } else {
      const user = inMemoryStore.users.find(u => u.id === parseInt(id, 10));
      if (!user) return null;
      const { password, ...safeUser } = user;
      return safeUser;
    }
  }

  static async create({ fullName, email, phone, passwordHash, role = 'citizen' }) {
    if (isMySQLConnected()) {
      const pool = getPool();
      const [result] = await pool.query(
        'INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        [fullName, email, phone || null, passwordHash, role]
      );
      return {
        id: result.insertId,
        full_name: fullName,
        email,
        phone,
        role,
        created_at: new Date()
      };
    } else {
      const newId = inMemoryStore.users.length + 1;
      const newUser = {
        id: newId,
        full_name: fullName,
        email,
        phone,
        password: passwordHash,
        role,
        created_at: new Date()
      };
      inMemoryStore.users.push(newUser);
      const { password, ...safeUser } = newUser;
      return safeUser;
    }
  }
}

module.exports = UserModel;
