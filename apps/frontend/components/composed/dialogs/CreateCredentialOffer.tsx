import * as Dialog from '@radix-ui/react-dialog';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { useCreateOffer } from '@utils/api/offer/offers.hook';
import { TGrantType, type TOfferParams } from '@utils/api/offer/offers.type';
import { toastError, toastSuccess } from '@utils/toast';

import Button from '@ui/Button';
import Input from '@ui/Input';

const Label = ({ text }: { text: string }) => (
  <div className='mb-2 text-sm text-slate-500'>
    {text} <span className='text-sm text-red-700'>*</span>
  </div>
);

const initialStateForm = {
  did: '',
  first_name: '',
  last_name: '',
  date_of_birth: '',
  nationality: '',
  enrollment_date: '',
  email: ''
};

export default function CreateCredentialOfferDialog({
  isOpen,
  onOpenChange,
  onRefetchApprove,
  onCancel
}: {
  isOpen: boolean;
  selectedDid: string | null;
  selectedRowId: string | null;
  onRefetchApprove?: () => void;
  onCancel?: () => void;
  onOpenChange: (flag: boolean) => void;
}) {
  const [formData, setFormData] = useState(initialStateForm);

  const t = useTranslations();
  const [isEmailValid, setIsEmailValid] = useState(true);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const { mutateAsync: createOffer } = useCreateOffer();

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialStateForm);
      // setSelectedStudent('');
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

  const createOfferHandler = async (offer: TOfferParams) => {
    try {
      const successStudent = await createOffer(offer);
      return successStudent;
    } catch (e) {
      // eslint-disable-next-line
      console.log('Something went wrong', e);
    }
  };

  // eslint-disable-next-line
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const offerData: TOfferParams = {
        schemaId: '123',
        grantType: TGrantType.AUTHORIZATION_CODE,
        data: formData
      };
      const res = await createOfferHandler(offerData);

      if (res) {
        onRefetchApprove!();
        toastSuccess({
          text: t('credentials.offer.create_offer_success'),
          duration: 10000
        });
      } else {
        toastError({
          text: t('credentials.offer.create_offer_error'),
          duration: 10000
        });
      }
    } catch (e) {
      // eslint-disable-next-line
      console.log('Something went wrong', e);
    }
  };

  const disabledFlag = useMemo(
    () => !Object.values(formData).every((value) => value) || !isEmailValid,
    [formData, isEmailValid]
  );

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
            {t('credentials.offer.title')}
          </Dialog.Title>
          <div className='flex h-full flex-col justify-between'>
            <div>
              <div className='flex gap-4'>
                <form className='w-full flex-col space-y-2'>
                  <Label text={t('credentials.detailed.ebsi_id')} />
                  <Input
                    type='text'
                    name='did'
                    value={formData.did}
                    onChange={handleChange}
                    placeholder={t('credentials.approve.enter_your_ebsi_id')}
                  />
                  <Label text={t('credentials.detailed.first_name')} />
                  <Input
                    type='text'
                    name='first_name'
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder={t('credentials.approve.enter_your_first_name')}
                  />

                  <Label text={t('credentials.detailed.last_name')} />
                  <Input
                    className='mb-4'
                    value={formData.last_name}
                    onChange={handleChange}
                    name='last_name'
                    placeholder={t('credentials.approve.enter_your_last_name')}
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
              </div>
            </div>

            <div className='mb-8 flex justify-end space-x-2'>
              <Dialog.Close asChild>
                <Button
                  variant='red'
                  className='w-full text-xs'
                  onClick={onCancel}
                >
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
