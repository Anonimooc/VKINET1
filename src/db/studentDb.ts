import sqlite3 from 'sqlite3';

import type StudentInterface from '@/types/StudentInterface';
import getRandomFio from '@/utils/getRandomFio';
import FioInterface from '@/types/FioInterface';

sqlite3.verbose();

/**
 * Получение студентов
 * @returns Promise<StudentInterface[]>
 */
export const getStudentsDb = async (): Promise<StudentInterface[]> => {
  const db = new sqlite3.Database(process.env.DB ?? './db/vki-web.db');

  const students = await new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM student';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        db.close();
        return;
      }
      resolve(rows);
      db.close();
    });
  });

  return students as StudentInterface[];
};

/**
 * Удаления студента
 * @param studentId 
 * @returns 
 */
export const deleteStudentDb = async (studentId: number): Promise<number> => {
  const db = new sqlite3.Database(process.env.DB ?? './db/vki-web.db');

  await new Promise((resolve, reject) => {
    db.run('DELETE FROM student WHERE id=?', [studentId], (err) => {
      if (err) {
        reject(err);
        db.close();
        return;
      }
      resolve(studentId);
      db.close();
    });
  });

  return studentId;
};

/**
 * Добавление  рандомных студента
 * @param mount количество добавляемых записей - 10 по умолчанию
 * @returns 
 */
export const addRandomStudentsDb = async (amount: number = 10): Promise<FioInterface[]> => {
  const db = new sqlite3.Database(process.env.DB ?? './db/vki-web.db');

  const fios: FioInterface[] = [];
  let fiosInsert: string = ''
  for (let i = 0; i < amount; i++) {
    const fio = getRandomFio();
    fios.push(fio);
    fiosInsert+= `('${fio.firstName}', '${fio.lastName}', '${fio.middleName}', 1)`;
    fiosInsert+= `${i === amount - 1 ? ';' : ','}`;
  }

  await new Promise((resolve, reject) => {
    db.run(`INSERT INTO student (firstName, lastName, middleName, groupId) VALUES ${fiosInsert}`, [], (err) => {
      if (err) {
        reject(err);
        db.close();
        return;
      }
      resolve(fios);
      db.close();
    });
  });

  return fios;
};

/**
 * Добавление одного студента
 * @param student студент без id
 * @returns созданный студент с id
 */
export const addStudentDb = async (student: Omit<StudentInterface, 'id'> & { groupId?: number }): Promise<StudentInterface> => {
  const db = new sqlite3.Database(process.env.DB ?? './db/vki-web.db');

  const { firstName, lastName, middleName } = student;
  const groupId = (student as any).groupId ?? 1;

  const created = await new Promise<StudentInterface>((resolve, reject) => {
    // Используем function, чтобы получить this.lastID из sqlite3
    db.run(
      'INSERT INTO student (firstName, lastName, middleName, groupId) VALUES (?, ?, ?, ?)',
      [firstName, lastName, middleName, groupId],
      function (this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          reject(err);
          db.close();
          return;
        }
        const insertedId = this.lastID as unknown as number;
        const createdStudent: StudentInterface = {
          id: insertedId,
          firstName,
          lastName,
          middleName,
        };
        resolve(createdStudent);
        db.close();
      }
    );
  });

  return created;
};
