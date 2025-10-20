interface StudentInterface {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string;
  contacts: string;
  groupId: number;
  isDeleted?: boolean;
};

export default StudentInterface;
