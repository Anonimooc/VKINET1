import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { addStudentApi, deleteStudentApi, getStudentsApi } from '@/api/studentsApi';
import type StudentInterface from '@/types/StudentInterface';

interface StudentsHookInterface {
  students: StudentInterface[];
  deleteStudentMutate: (studentId: number) => void;
  addStudentMutate: (student: Omit<StudentInterface, 'id'>) => void;
}

const useStudents = (): StudentsHookInterface => {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['students'],
    queryFn: getStudentsApi,
  });

  const deleteStudentMutate = useMutation({
    mutationFn: deleteStudentApi,
    onMutate: async (studentId: number) => {
      await queryClient.cancelQueries({ queryKey: ['students'] });
      const previousStudents = queryClient.getQueryData<StudentInterface[]>(['students']);
      
      if (previousStudents) {
        const updatedStudents = previousStudents.filter(student => student.id !== studentId);
        queryClient.setQueryData<StudentInterface[]>(['students'], updatedStudents);
      }

      return { previousStudents };
    },
    onError: (err, studentId, context) => {
      queryClient.setQueryData<StudentInterface[]>(['students'], context?.previousStudents);
    },
  });

  const addStudentMutate = useMutation({
    mutationFn: addStudentApi,
    onMutate: async (newStudent: Omit<StudentInterface, 'id'>) => {
      await queryClient.cancelQueries({ queryKey: ['students'] });
      const previousStudents = queryClient.getQueryData<StudentInterface[]>(['students']);

      const tempStudent: StudentInterface = {
        id: Date.now() * -1, // Более простой способ генерации временного ID
        ...newStudent,
      } as StudentInterface;

      if (previousStudents) {
        queryClient.setQueryData<StudentInterface[]>(['students'], [tempStudent, ...previousStudents]);
      }

      return { previousStudents, tempId: tempStudent.id };
    },
    onError: (err, newStudent, context) => {
      queryClient.setQueryData<StudentInterface[]>(['students'], context?.previousStudents);
    },
    onSuccess: (created, variables, context) => {
      const current = queryClient.getQueryData<StudentInterface[]>(['students']);
      if (current && created) {
        const updated = current.map(s => s.id === context?.tempId ? created : s);
        queryClient.setQueryData<StudentInterface[]>(['students'], updated);
      }
    },
  });

  return {
    students: data ?? [],
    deleteStudentMutate: deleteStudentMutate.mutate,
    addStudentMutate: addStudentMutate.mutate,
  };
};

export default useStudents;