// ============================================
// ARCHIVO: backend/src/scripts/seed-admin.ts
// ============================================

import bcrypt from 'bcrypt';
import pool from '../config/database';

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');

    // Verificar si ya existe un admin
    const existingAdmin = await pool.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email: admin@courseplatform.com');
      console.log('🔑 Password: admin123456');
      return;
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash('admin123456', 10);

    // Crear usuario admin
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, first_name, last_name, role`,
      [
        'admin@courseplatform.com',
        passwordHash,
        'Admin',
        'Platform',
        'admin',
        true,
        true
      ]
    );

    // Crear también un tutor de prueba
    const tutorPasswordHash = await bcrypt.hash('tutor123456', 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'tutor@courseplatform.com',
        tutorPasswordHash,
        'Juan',
        'Profesor',
        'tutor',
        true,
        true
      ]
    );

    // Crear también un estudiante de prueba
    const studentPasswordHash = await bcrypt.hash('student123456', 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'student@courseplatform.com',
        studentPasswordHash,
        'María',
        'Estudiante',
        'student',
        true,
        true
      ]
    );

    console.log('');
    console.log('✅ Demo users created successfully!');
    console.log('');
    console.log('========================================');
    console.log('📋 CREDENTIALS FOR TESTING');
    console.log('========================================');
    console.log('');
    console.log('👨‍💼 ADMIN:');
    console.log('   Email: admin@courseplatform.com');
    console.log('   Password: admin123456');
    console.log('');
    console.log('👨‍🏫 TUTOR:');
    console.log('   Email: tutor@courseplatform.com');
    console.log('   Password: tutor123456');
    console.log('');
    console.log('👨‍🎓 STUDENT:');
    console.log('   Email: student@courseplatform.com');
    console.log('   Password: student123456');
    console.log('');
    console.log('========================================');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();

// ============================================
// AÑADIR AL: backend/package.json
// ============================================
// En la sección "scripts", añade:
// "seed:admin": "ts-node src/scripts/seed-admin.ts"