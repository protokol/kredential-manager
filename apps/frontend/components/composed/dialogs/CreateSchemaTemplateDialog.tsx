/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useCreateSchema } from '@utils/api/schemas/schemas.hook';
import { toastError, toastSuccess } from '@utils/toast';

import Button from '@ui/Button';
import Textarea from '@ui/Textarea';

import {
  courseCompletionMock,
  libraryAccessMock,
  studentIdCardMock
} from '@components/composed/schemas/mocks';

const Label = ({ text }: { text: string }) => (
  <div className='mb-2 text-sm text-slate-500'>
    {text} <span className='text-sm text-red-700'>*</span>
  </div>
);

const initialStateForm = {
  template: ''
};

const CreateSchemaTemplateDialog = ({
  isOpen,
  onOpenChange,
  onSuccess,
  mode,
  schema
}: {
  isOpen: boolean;
  onOpenChange: (flag: boolean) => void;
  onSuccess?: () => void;
  mode: 'create' | 'view';
  schema: any;
}) => {
  const t = useTranslations();
  const [formData, setFormData] = useState(initialStateForm);
  const { mutateAsync: createSchema } = useCreateSchema();

  const handlePrefill = (template: object) => {
    setFormData({
      template: JSON.stringify(template, null, 2)
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const jsonSchema = JSON.parse(formData.template);
      await createSchema(jsonSchema);

      toastSuccess({
        text: t('schemaTemplates.create_success')
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toastError({
        text:
          error instanceof SyntaxError
            ? t('schemaTemplates.invalid_json')
            : (error as any)?.response?.data?.error_description ||
              t('schemaTemplates.error_message')
      });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialStateForm);
    }
  }, [isOpen]);

  useEffect(() => {
    if (mode === 'view' && schema) {
      setFormData({
        template: JSON.stringify(schema, null, 2)
      });
    }
  }, [mode, schema]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className='fixed inset-0 z-40 bg-sky-950 bg-opacity-50'
          asChild
        >
          <Dialog.Close className='fixed inset-0' />
        </Dialog.Overlay>
        <Dialog.Content className='fixed left-1/2 top-1/2 z-50 w-192 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-radial-gradient px-8 py-16 shadow-lg'>
          <Dialog.Title className='mb-4 text-center text-lg font-bold text-sky-950'>
            {mode === 'view'
              ? t('schemaTemplates.view')
              : t('schemaTemplates.create')}
          </Dialog.Title>
          <div className='flex flex-col justify-between'>
            {mode === 'create' && (
              <div className='mb-4 flex items-center space-x-2'>
                <div className='text-sm text-slate-500'>
                  {t('schemaTemplates.prefill')}
                </div>
                <Button
                  type='button'
                  variant='secondary'
                  className='text-xs'
                  onClick={() => handlePrefill(courseCompletionMock)}
                >
                  Course Completion
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  className='text-xs'
                  onClick={() => handlePrefill(libraryAccessMock)}
                >
                  Library Access
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  className='text-xs'
                  onClick={() => handlePrefill(studentIdCardMock)}
                >
                  Student ID Card
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className='flex-col space-y-4'>
              <div>
                <Label text={t('schemaTemplates.template')} />
                <Textarea
                  name='template'
                  value={formData.template}
                  onChange={handleChange}
                  rows={30}
                  placeholder={t('schemaTemplates.enter_template')}
                  required
                  readOnly={mode === 'view'}
                />
              </div>

              <div className='mt-8 flex justify-end space-x-2'>
                <Dialog.Close asChild>
                  <Button variant='red' className='w-full text-xs'>
                    {mode === 'view' ? t('common.close') : t('common.cancel')}
                  </Button>
                </Dialog.Close>
                {mode === 'create' && (
                  <Button
                    type='submit'
                    className='w-full bg-sky-950 text-xs hover:bg-sky-950 active:bg-sky-950 enabled:hover:bg-sky-950'
                    variant='primary'
                    disabled={!formData.template}
                  >
                    {t('common.submit')}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CreateSchemaTemplateDialog;
