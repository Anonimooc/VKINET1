import { addStudentDb, getStudentsDb } from '@/db/studentDb';

export async function GET(): Promise<Response> {
  const students = await getStudentsDb();

  return new Response(JSON.stringify(students), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { firstName, lastName, middleName, contacts, groupId } = body ?? {};

    if (!firstName || !lastName || !middleName) {
      return new Response(JSON.stringify({ message: 'firstName, lastName, middleName обязательны' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const created = await addStudentDb({
      firstName,
      lastName,
      middleName,
      contacts: '',
      groupId: Number(groupId ?? 1),
    });

    return new Response(JSON.stringify(created), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Ошибка при добавлении студента' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
