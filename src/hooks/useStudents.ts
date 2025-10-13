import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { addStudentApi, deleteStudentApi, getStudentsApi } from '@/api/studentsApi';
import type StudentInterface from '@/types/StudentInterface';
import isServer from '@/utils/isServer';

interface StudentsHookInterface {
  students: StudentInterface[];
  deleteStudentMutate: (studentId: number) => void;
  addStudentMutate: (student: Omit<StudentInterface, 'id'>) => void;
}

const useStudents = (): StudentsHookInterface => {
  const queryClient = useQueryClient();

  const { data, refetch } = useQuery({
    queryKey: ['students'],
    queryFn: () => getStudentsApi(),
    enabled: true,
  });

  /**
   * Мутация удаления студента
   */
  const deleteStudentMutate = useMutation({
    mutationFn: async (studentId: number) => deleteStudentApi(studentId),
    onMutate: async (studentId: number) => {
      await queryClient.cancelQueries({ queryKey: ['students'] });
      const previousStudents = queryClient.getQueryData<StudentInterface[]>(['students']);
      
      if (!previousStudents) return { previousStudents };

      // Помечаем студента как удаленного для визуальной обратной связи
      const updatedStudents = previousStudents.map((student: StudentInterface) => ({
        ...student,
        ...(student.id === studentId ? { isDeleted: true } : {}),
      }));
      
      queryClient.setQueryData<StudentInterface[]>(['students'], updatedStudents);

      return { previousStudents };
    },
    onError: (err, studentId, context) => {
      console.error('>>> deleteStudentMutate error', err);
      // Восстанавливаем предыдущие данные при ошибке
      queryClient.setQueryData<StudentInterface[]>(['students'], context?.previousStudents);
    },
    onSuccess: (deletedStudentId, variables, context) => {
      // Получаем текущие данные и фильтруем удаленного студента
      const currentStudents = queryClient.getQueryData<StudentInterface[]>(['students']);
      if (!currentStudents) return;

      const updatedStudents = currentStudents.filter((student: StudentInterface) => student.id !== deletedStudentId);
      queryClient.setQueryData<StudentInterface[]>(['students'], updatedStudents);
    },
  });

  /**
   * Мутация добавления студента
   */
  const addStudentMutate = useMutation({
    mutationFn: async (student: Omit<StudentInterface, 'id'>) => addStudentApi(student),
    onMutate: async (newStudent: Omit<StudentInterface, 'id'>) => {
      await queryClient.cancelQueries({ queryKey: ['students'] });
      const previousStudents = queryClient.getQueryData<StudentInterface[]>(['students']);

      if (!previousStudents) return { previousStudents };

      // Оптимистично добавляем временную запись (без id)
      const tempStudent: StudentInterface = {
        id: Math.floor(Math.random() * 1_000_000) * -1, // временный отрицательный id
        ...newStudent,
      } as StudentInterface;

      queryClient.setQueryData<StudentInterface[]>(['students'], [tempStudent, ...previousStudents]);

      return { previousStudents, tempId: tempStudent.id } as { previousStudents?: StudentInterface[]; tempId: number };
    },
    onError: (err, newStudent, context) => {
      console.error('>>> addStudentMutate error', err);
      queryClient.setQueryData<StudentInterface[]>(['students'], context?.previousStudents);
    },
    onSuccess: (created, variables, context) => {
      if (!created) return;
      const current = queryClient.getQueryData<StudentInterface[]>(['students']);
      if (!current) return;
      // Заменяем временного на созданного с id
      const updated = current.map((s) => (s.id === context?.tempId ? created : s));
      queryClient.setQueryData<StudentInterface[]>(['students'], updated);
    },
  });

  return {
    students: data ?? [],
    deleteStudentMutate: deleteStudentMutate.mutate,
    addStudentMutate: addStudentMutate.mutate,
  };
};

export default useStudents;