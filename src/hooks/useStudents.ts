import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { deleteStudentApi, getStudentsApi } from '@/api/studentsApi';
import type StudentInterface from '@/types/StudentInterface';

interface StudentsHookInterface {
  students: StudentInterface[];
  deleteStudentMutate: (studentId: number) => void;
}

const useStudents = (): StudentsHookInterface => {
  const queryClient = useQueryClient();

  const { data } = useQuery({
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

  return {
    students: data ?? [],
    deleteStudentMutate: deleteStudentMutate.mutate,
  };
};

export default useStudents;