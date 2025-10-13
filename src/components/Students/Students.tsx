'use client';

import useStudents from '@/hooks/useStudents';
import type StudentInterface from '@/types/StudentInterface';
import Student from './Student/Student';
import styles from './Students.module.scss';
import { deleteStudentDb } from '@/db/studentDb';
import AddStudent from './AddStudent/AddStudent';

const Students = (): React.ReactElement => {
  const { students, deleteStudentMutate, addStudentMutate } = useStudents();

  const handleDeleteStudent = (studentId: number): void =>{
    deleteStudentMutate(studentId);
  };
  return (
    <div className={styles.Students}>
      <AddStudent onAdd={addStudentMutate} />
      {students.map((student: StudentInterface) => (
        <Student 
          key={student.id} 
          student={student} 
          onDelete={handleDeleteStudent}
        />
      ))}
    </div>
  );
};

export default Students;