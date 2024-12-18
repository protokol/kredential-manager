import * as Dialog from '@radix-ui/react-dialog';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useCreateApiKey } from '@utils/api/apiKeys/apiKeys.hook';
import { toastError, toastSuccess } from '@utils/toast';

import Button from '@ui/Button';
import Input from '@ui/Input';

const Label = ({ text }: { text: string }) => (
  <div className='mb-2 text-sm text-slate-500'>
    {text} <span className='text-sm text-red-700'>*</span>
  </div>
);

const initialStateForm = {
  name: ''
};

export default function CreateApikeyDialog({
  isOpen,
  onOpenChange,
  onSuccess
}: {
  isOpen: boolean;
  onOpenChange: (flag: boolean) => void;
  onSuccess?: () => void;
}) {
  const t = useTranslations();
  const [formData, setFormData] = useState(initialStateForm);
  const { mutateAsync: createApiKey } = useCreateApiKey();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createApiKey(formData);
      toastSuccess({
        text: t('api_keys.create_success')
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toastError({
        text: t('api_keys.error_message')
      });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialStateForm);
    }
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className='fixed inset-0 z-40 bg-sky-950 bg-opacity-50'
          asChild
        >
          <Dialog.Close className='fixed inset-0' />
        </Dialog.Overlay>
        <Dialog.Content className='fixed left-1/2 top-1/2 z-50 w-192 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-radial-gradient px-32 py-16 shadow-lg'>
          <Dialog.Title className='mb-4 text-center text-lg font-bold text-sky-950'>
            {t('api_keys.create.title')}
          </Dialog.Title>
          <div className='flex flex-col justify-between'>
            <form onSubmit={handleSubmit} className='flex-col space-y-4'>
              <div>
                <Label text={t('api_keys.name')} />
                <Input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('api_keys.enter_name')}
                  required
                />
              </div>

              <div className='mt-8 flex justify-end space-x-2'>
                <Dialog.Close asChild>
                  <Button variant='red' className='w-full text-xs'>
                    {t('common.cancel')}
                  </Button>
                </Dialog.Close>
                <Button
                  type='submit'
                  className='w-full bg-sky-950 text-xs hover:bg-sky-950 active:bg-sky-950 enabled:hover:bg-sky-950'
                  variant='primary'
                  disabled={!formData.name}
                >
                  {t('common.submit')}
                </Button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
