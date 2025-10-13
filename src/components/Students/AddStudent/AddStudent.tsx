'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import styles from './AddStudent.module.scss';
import type StudentInterface from '@/types/StudentInterface';

type AddStudentFormValues = Omit<StudentInterface, 'id'>;

interface AddStudentProps {
  onAdd: (values: AddStudentFormValues) => void;
}

const AddStudent = ({ onAdd }: AddStudentProps): React.ReactElement => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddStudentFormValues>({
    defaultValues: { firstName: '', lastName: '', middleName: '' },
  });

  const onSubmit = async (values: AddStudentFormValues): Promise<void> => {
    await new Promise((r) => setTimeout(r, 0));
    onAdd(values);
    reset();
  };

  return (
    <form className={styles.AddStudent} onSubmit={handleSubmit(onSubmit)}>
      <input
        type="text"
        placeholder="Фамилия"
        {...register('lastName', { required: 'Укажите фамилию' })}
      />
      {errors.lastName && <span className={styles.error}>{errors.lastName.message}</span>}

      <input
        type="text"
        placeholder="Имя"
        {...register('firstName', { required: 'Укажите имя' })}
      />
      {errors.firstName && <span className={styles.error}>{errors.firstName.message}</span>}

      <input
        type="text"
        placeholder="Отчество"
        {...register('middleName', { required: 'Укажите отчество' })}
      />
      {errors.middleName && <span className={styles.error}>{errors.middleName.message}</span>}

      <button type="submit" disabled={isSubmitting}>Добавить</button>
    </form>
  );
};

export default AddStudent;


