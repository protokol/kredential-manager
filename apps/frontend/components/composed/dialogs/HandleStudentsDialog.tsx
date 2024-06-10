import * as Dialog from '@radix-ui/react-dialog';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { useUpdateRequest } from '@utils/api/credentials/credentials.hook';
import { VCStatus } from '@utils/api/credentials/credentials.type';
import type { TUpdateStatusParams } from '@utils/api/credentials/credentials.type';
import {
  useAttachDid,
  useCreateStudent,
  useGetStudents
} from '@utils/api/students/students.hook';
import type {
  TAttachDidParams,
  TStudentParams
} from '@utils/api/students/students.type';
import { toastError, toastInfo, toastSuccess } from '@utils/toast';

import Button from '@ui/Button';
import Input from '@ui/Input';
import Select from '@ui/Select';

export default function HandleStudentsDialog({
  isOpen,
  selectedDid,
  selectedRowId,
  onOpenChange,
  onRefetchApprove
}: {
  isOpen: boolean;
  selectedDid: string | null;
  selectedRowId: string | null;
  onRefetchApprove?: () => void;
  onOpenChange: (flag: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    nationality: '',
    enrollment_date: '',
    email: ''
  });

  const t = useTranslations();

  const [selectedOption, setSelectedOption] = useState('newStudent');
  const [selectedStudent, setSelectedStudent] = useState('');
  // eslint-disable-next-line
  const [studentsOptions, setStudentsOptions] = useState<any>([]);
  const { data: students } = useGetStudents();
  const { mutateAsync: attachDid } = useAttachDid();
  const { mutateAsync: createStudent } = useCreateStudent();
  const { mutateAsync: updateRequest } = useUpdateRequest();

  useEffect(() => {
    // eslint-disable-next-line
    const options = students?.items?.map((student: any) => ({
      label: `${student.first_name} ${student.last_name}`,
      value: student.student_id
    }));

    if (options?.length) {
      setStudentsOptions(options);
    }
  }, [students]);

  // eslint-disable-next-line
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // eslint-disable-next-line
  const handleOptionChange = (e: any) => {
    setSelectedOption(e.target.value);
  };

  const attach = async ({ did, studentId }: TAttachDidParams) => {
    try {
      await attachDid({
        studentId: Number(studentId),
        did: did
      });
    } catch (e) {
      // eslint-disable-next-line
      console.log('Attach error:', e);
    }
  };

  const undoStatus = async ({ id, status }: TUpdateStatusParams) => {
    try {
      const successUndo = await updateRequest({
        id: Number(id),
        status
      });

      onRefetchApprove!();

      if (successUndo) {
        toastInfo({
          text: t('credentials.detailed.action_undone')
        });
      }
    } catch (e) {
      toastError({
        text: t('credentials.error_message')
      });
    }
  };

  const updateStatusHandler = async ({ id, status }: TUpdateStatusParams) => {
    try {
      await updateRequest({
        id,
        status
      });

      if (status === VCStatus.APPROVED)
        toastSuccess({
          text: t('credentials.approved_success'),
          duration: 10000,
          action: () => {
            undoStatus({ id, status: VCStatus.PENDING });
          },
          actionText: t('credentials.detailed.undo')
        });
    } catch (e) {
      toastError({
        text: t('credentials.error_message')
      });
    }
  };

  const createStudentHandler = async (student: TStudentParams) => {
    try {
      const successStudent = await createStudent(student);
      return successStudent;
    } catch (e) {
      // eslint-disable-next-line
      console.log('Something went wrong', e);
    }
  };

  // eslint-disable-next-line
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (selectedOption === 'existingStudent') {
      try {
        await attach({
          did: selectedDid || '',
          studentId: Number(selectedStudent)
        });

        await updateStatusHandler({
          id: Number(selectedRowId),
          status: VCStatus.APPROVED
        });

        onRefetchApprove!();
      } catch (e) {
        // eslint-disable-next-line
        console.log('Something went wrong', e);
      }
    }
    if (selectedOption === 'newStudent') {
      try {
        const res = await createStudentHandler(formData);

        const { student_id } = res;

        await attach({ did: selectedDid || '', studentId: Number(student_id) });

        await updateStatusHandler({
          id: Number(selectedRowId),
          status: VCStatus.APPROVED
        });

        onRefetchApprove!();
      } catch (e) {
        // eslint-disable-next-line
        console.log('Something went wrong', e);
      }
    }
  };

  const disabledFlag = useMemo(() => {
    if (selectedOption === 'existingStudent') {
      return !selectedStudent;
    }

    if (selectedOption === 'newStudent') {
      return !Object.values(formData).every((value) => value);
    }

    return true;
  }, [selectedOption, selectedStudent, formData]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className='bg-black fixed inset-0 bg-opacity-30'
          asChild
        >
          <Dialog.Close className='fixed inset-0' />
        </Dialog.Overlay>
        <Dialog.Content className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-linear-gradient p-8 shadow-lg'>
          <Dialog.Title className='mb-4 text-lg font-bold'>
            Are you sure you want to approve?
          </Dialog.Title>
          <div>
            <fieldset className='mb-4 mt-4 flex flex items-center gap-3'>
              <div className='flex items-center'>
                <input
                  type='radio'
                  id='existingStudent'
                  name='existingStudent'
                  value='existingStudent'
                  checked={selectedOption === 'existingStudent'}
                  onChange={handleOptionChange}
                  className='mr-2'
                />
                <label htmlFor='existingStudent' className='text-sm'>
                  Choose a student
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  type='radio'
                  id='newStudent'
                  name='newStudent'
                  value='newStudent'
                  checked={selectedOption === 'newStudent'}
                  onChange={handleOptionChange}
                  className='mr-2'
                />
                <label htmlFor='newStudent' className='text-sm'>
                  Create new student
                </label>
              </div>
            </fieldset>
          </div>
          <div className='flex gap-4'>
            <div className='flex-col'>
              <label className='block min-w-48 text-sm'>
                Students:
                <Select
                  value={selectedStudent}
                  onValueChange={setSelectedStudent}
                  disabled={selectedOption !== 'existingStudent'}
                  items={studentsOptions}
                />
              </label>
            </div>
            <form className='flex-col space-y-4'>
              <label className='block text-sm'>
                First Name:
                <Input
                  type='text'
                  name='first_name'
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={selectedOption === 'existingStudent'}
                />
              </label>
              <label className='block text-sm'>
                Last Name:
                <Input
                  type='text'
                  name='last_name'
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={selectedOption === 'existingStudent'}
                />
              </label>
              <label className='block text-sm'>
                Date of Birth:
                <Input
                  type='date'
                  name='date_of_birth'
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  disabled={selectedOption === 'existingStudent'}
                />
              </label>
              <label className='block text-sm'>
                Nationality:
                <Input
                  type='text'
                  name='nationality'
                  value={formData.nationality}
                  onChange={handleChange}
                  disabled={selectedOption === 'existingStudent'}
                />
              </label>
              <label className='block text-sm'>
                Enrollment Date:
                <Input
                  type='date'
                  name='enrollment_date'
                  value={formData.enrollment_date}
                  onChange={handleChange}
                  disabled={selectedOption === 'existingStudent'}
                />
              </label>
              <label className='block text-sm'>
                Email:
                <Input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  disabled={selectedOption === 'existingStudent'}
                />
              </label>
              <div className='mt-4 flex justify-end space-x-2'>
                <Dialog.Close asChild>
                  <Button variant='primary'>Cancel</Button>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <Button
                    variant='primary'
                    onClick={handleSubmit}
                    disabled={disabledFlag}
                  >
                    Submit
                  </Button>
                </Dialog.Close>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
