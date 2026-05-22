import sqlite from "sqlite3";
import crypto from "crypto";
import { Student, Course } from "./models.js";

// *** USER DAO **************
const db = new sqlite.Database("database.sqlite", (err) => {
  if (err) throw err;
});

// used by passport for login
export const getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    db.get(sql, [email], (err, row) => {
      if (err) reject(err);
      else if (row === undefined) resolve(false);
      else {
        const student = new Student(row.studentId, row.email, row.name, row.surname, row.planType);
        
        crypto.scrypt(password, row.salt, 16, function(err, hashedPassword) {
          if (err) reject(err);
          if (!crypto.timingSafeEqual(Buffer.from(row.hashedpassword, "hex"), hashedPassword))
            resolve(false);
          else
            resolve(student);
        });
      }
    });
  });
};

export const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users WHERE studentId = ?";
    db.get(sql, [id], (err, row) => {
      if (err) reject(err);
      else if (row === undefined) resolve({ error: "User not found." });
      else {
        resolve(new Student(row.studentId, row.email, row.name, row.surname, row.planType));
      }
    });
  });
};


// *** STUDYPLAN DAO ****************************************************
// retrieve all courses with the number of enrolled students and incompatibilities
export const listCourses = () => {
  return new Promise((resolve, reject) => {
    // calculate the enrolled students
    const sqlCourses = `
      SELECT c.*, COUNT(s.courseCode) as enrolled
      FROM courses c
      LEFT JOIN studyplans s ON c.courseCode = s.courseCode
      GROUP BY c.courseCode
      ORDER BY c.name ASC
    `;

    const sqlIncompatibilities = "SELECT * FROM incompatibilities";

    db.all(sqlCourses, [], (err, courseRows) => {
      if (err) return reject(err);

      db.all(sqlIncompatibilities, [], (err, incompRows) => {
        if (err) return reject(err);

        const courses = courseRows.map(row => 
          new Course(row.courseCode, row.name, row.credits, row.maxStudents, row.preparatoryCourse, row.enrolled)
        ); // array of Course objects

        // si associano le incompatibilità aggiungendo i corsi agli array a vicenda
        incompRows.forEach(row => {
          const course1 = courses.find(c => c.code === row.courseCode1);
          const course2 = courses.find(c => c.code === row.courseCode2);
          if (course1) course1.incompatible.push(row.courseCode2);
          if (course2) course2.incompatible.push(row.courseCode1);
        });

        resolve(courses);
      });
    });
  });
};

// restituisce array di codici corsi per uno specifico studente
export const getStudyPlanByStudent = (studentId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT courseCode FROM studyplans WHERE studentId = ?";
    db.all(sql, [studentId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(row => row.courseCode));
    });
  });
};

// quando l'utente preme "Salva", inviamo l'intero array di corsi e aggiorniamo il DB in modo atomico con una transazione esplicita
export const saveStudyPlan = (studentId, planType, courseCodes) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      db.run("UPDATE users SET planType = ? WHERE studentId = ?", [planType, studentId], (err) => {
        if (err) { db.run("ROLLBACK"); return reject(err); }
      });

      db.run("DELETE FROM studyplans WHERE studentId = ?", [studentId], (err) => {
        if (err) { db.run("ROLLBACK"); return reject(err); }
      });

      const stmt = db.prepare("INSERT INTO studyplans(studentId, courseCode) VALUES (?, ?)");
      for (const code of courseCodes) {
        stmt.run([studentId, code], (err) => {
          if (err) { db.run("ROLLBACK"); return reject(err); }
        });
      }
      stmt.finalize();

      db.run("COMMIT", (err) => {
        if (err) { db.run("ROLLBACK"); reject(err); }
        else resolve(true);
      });
    });
  });
};

export const deleteStudyPlan = (studentId) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      db.run("UPDATE users SET planType = NULL WHERE studentId = ?", [studentId], (err) => {
        if (err) { db.run("ROLLBACK"); return reject(err); }
      });

      db.run("DELETE FROM studyplans WHERE studentId = ?", [studentId], (err) => {
        if (err) { db.run("ROLLBACK"); return reject(err); }
      });

      db.run("COMMIT", (err) => {
        if (err) { db.run("ROLLBACK"); reject(err); }
        else resolve(true);
      });
    });
  });
};