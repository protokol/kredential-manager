import { useStudentsColumns } from '../students/studentsCommonColumns';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
import { getSearchFilter } from '@utils/api/students/students.utils';
import useDebounce from '@utils/hooks/useDebounce';
import { toastError, toastInfo, toastSuccess } from '@utils/toast';

import Button from '@ui/Button';
import Input from '@ui/Input';
import InputWithIcon from '@ui/InputWithIcon';
import Table from '@ui/table/Table';
import useServerSideTableData from '@ui/table/hooks/useServerSideTableData';

const Label = ({ text }: { text: string }) => (
  <div className='mb-2 text-sm text-slate-500'>
    {text} <span className='text-sm text-red-700'>*</span>
  </div>
);

const initialStateForm = {
  first_name: '',
  last_name: '',
  date_of_birth: '',
  nationality: '',
  enrollment_date: '',
  email: ''
};

export default function ApproveCredentialDialog({
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
  const [formData, setFormData] = useState(initialStateForm);

  const t = useTranslations();
  const [isEmailValid, setIsEmailValid] = useState(true);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const studentsColumns = useStudentsColumns();

  const [selectedOption, setSelectedOption] = useState('newStudent');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [query, setQuery] = useState('');

  const debouncedQuery = useDebounce(query);

  const { isLoading, data: students } = useServerSideTableData({
    useDataHook: (apiParams) =>
      useGetStudents({
        ...apiParams,
        size: 6,
        filter: getSearchFilter(debouncedQuery.trim())
      })
  });
  const { mutateAsync: attachDid } = useAttachDid();
  const { mutateAsync: createStudent } = useCreateStudent();
  const { mutateAsync: updateRequest } = useUpdateRequest();

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialStateForm);
      setSelectedStudent('');
    }
  }, [isOpen]);

  // eslint-disable-next-line
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setIsEmailValid(validateEmail(value));
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
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
          text: t('credentials.detailed.action_undone'),
          duration: 3000
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
      return !Object.values(formData).every((value) => value) || !isEmailValid;
    }

    return true;
  }, [selectedOption, selectedStudent, formData, isEmailValid]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className='fixed inset-0 z-40 bg-sky-950 bg-opacity-50'
          asChild
        >
          <Dialog.Close className='fixed inset-0' />
        </Dialog.Overlay>
        <Dialog.Content className='fixed left-1/2 top-1/2 z-50 h-184 w-192 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-radial-gradient px-32 py-16 shadow-lg'>
          <Dialog.Title className='mb-4 flex flex-col items-center justify-center gap-4 text-center text-lg font-bold text-sky-950'>
            {t('credentials.approve.title')}
          </Dialog.Title>
          <div className='flex h-full flex-col justify-between'>
            <div>
              <div className='relative mb-4 mt-4 flex flex h-9 items-center border-1.5 border-slate-200 bg-white'>
                <div
                  className={`duration-250 absolute left-0 top-0 z-10 h-full w-1/2 transform rounded-md bg-sky-950 transition ease-out ${
                    selectedOption === 'newStudent' && 'translate-x-full'
                  }`}
                />
                <div
                  className={`z-20 flex h-full w-full cursor-pointer items-center justify-center rounded-md  text-xs text-slate-500 transition-colors ease-in ${
                    selectedOption === 'existingStudent' && 'text-white'
                  }`}
                  onClick={() => setSelectedOption('existingStudent')}
                >
                  {t('credentials.approve.choose_a_student')}
                </div>
                <div
                  className={`z-20 flex h-full w-full cursor-pointer items-center justify-center rounded-md text-xs text-slate-500 transition-colors ease-in ${
                    selectedOption === 'newStudent' && 'text-white '
                  }`}
                  onClick={() => {
                    setSelectedOption('newStudent');
                  }}
                >
                  {t('credentials.approve.create_new_student')}
                </div>
              </div>
              <div className='flex gap-4'>
                {selectedOption === 'existingStudent' && (
                  <div className='flex w-full flex-col gap-4'>
                    <div className='min-w-64'>
                      <InputWithIcon
                        type='text'
                        icon={MagnifyingGlassIcon}
                        autoComplete='off'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('students.search_by_name')}
                      />
                    </div>
                    <Table
                      isLoading={isLoading}
                      columns={studentsColumns}
                      activeOnRowClick
                      onRowClick={(rowData) => {
                        setSelectedStudent(rowData.student_id);
                      }}
                      data={students?.items ?? []}
                    />
                  </div>
                )}

                {selectedOption === 'newStudent' && (
                  <form className='w-full flex-col space-y-2'>
                    <Label text={t('credentials.detailed.first_name')} />
                    <Input
                      type='text'
                      name='first_name'
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder={t(
                        'credentials.approve.enter_your_first_name'
                      )}
                    />

                    <Label text={t('credentials.detailed.last_name')} />
                    <Input
                      className='mb-4'
                      value={formData.last_name}
                      onChange={handleChange}
                      name='last_name'
                      placeholder={t(
                        'credentials.approve.enter_your_last_name'
                      )}
                    />

                    <Label text={t('credentials.detailed.date_of_birth')} />
                    <Input
                      className='mb-4'
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      type='date'
                      name='date_of_birth'
                      placeholder={t('credentials.approve.date_placeholder')}
                    />

                    <Label text={t('credentials.detailed.nationality')} />
                    <Input
                      type='text'
                      name='nationality'
                      value={formData.nationality}
                      onChange={handleChange}
                      placeholder={t(
                        'credentials.approve.enter_your_nationality'
                      )}
                    />

                    <Label text={t('credentials.detailed.enrollment_date')} />
                    <Input
                      type='date'
                      name='enrollment_date'
                      value={formData.enrollment_date}
                      onChange={handleChange}
                      placeholder={t('credentials.approve.date_placeholder')}
                    />

                    <Label text={t('credentials.detailed.email')} />
                    <Input
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('credentials.approve.email_placeholder')}
                    />
                  </form>
                )}
              </div>
            </div>

            <div className='mb-8 flex justify-end space-x-2'>
              <Dialog.Close asChild>
                <Button variant='red' className='w-full text-xs'>
                  {t('credentials.approve.cancel')}
                </Button>
              </Dialog.Close>
              <Dialog.Close asChild>
                <Button
                  className='w-full bg-sky-950 text-xs hover:bg-sky-950 active:bg-sky-950 enabled:hover:bg-sky-950'
                  variant='primary'
                  onClick={handleSubmit}
                  disabled={disabledFlag}
                >
                  {t('credentials.approve.submit')}
                </Button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
