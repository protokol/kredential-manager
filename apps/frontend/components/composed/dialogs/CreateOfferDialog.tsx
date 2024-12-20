/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useCreateOffer } from '@utils/api/offers/offers.hook';
import { useSchemas } from '@utils/api/schemas/schemas.hook';
import { toastError, toastSuccess } from '@utils/toast';

import Button from '@ui/Button';
import Input from '@ui/Input';
import Select from '@ui/Select';

const Label = ({ text }: { text: string }) => (
  <div className='mb-2 text-sm text-slate-500'>
    {text} <span className='text-sm text-red-700'>*</span>
  </div>
);

const initialStateForm = {
  schemaTemplateId: '',
  selectedSchema: null,
  formValues: {},
  subjectDid: ''
};

const CreateOfferDialog = ({
  isOpen,
  onOpenChange,
  onSuccess
}: {
  isOpen: boolean;
  onOpenChange: (flag: boolean) => void;
  onSuccess?: () => void;
}) => {
  const t = useTranslations();
  const [formData, setFormData] = useState(initialStateForm);
  const { mutateAsync: createOffer } = useCreateOffer();
  const { data: schemas } = useSchemas();

  const handleChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      formValues: {
        ...prevData.formValues,
        [name]: value
      }
    }));
  };

  const renderFormFields = (validationRules: any) =>
    Object.entries(validationRules).map(([fieldName, rules]: [string, any]) => (
      <div key={fieldName}>
        <Label text={fieldName} />
        <Input
          name={fieldName}
          value={(formData.formValues as any)[fieldName] || ''}
          onChange={(e) => handleChange(fieldName, e.target.value)}
          required={rules.required}
          minLength={rules.minLength}
          type={rules.type}
          placeholder={`Enter ${fieldName}`}
        />
      </div>
    ));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOffer({
        credentialData: {
          subjectDid:
            'did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9KbnUYrszwPktqhonAPmKPuyZatC7T9662ow4eJNGWRAS7m44sNbxjsHfLvzN8Gw9ZHqPfy3iuSHLVUsEeWWvjj7LCEoYNDPZVBN2TU6SeTjs3yXkSPtDKeVG7qfzfr3bgZKr',
          ...formData.formValues
        },
        schemaTemplateId: Number(formData.schemaTemplateId),
        offerConfiguration: {
          grantType: 'urn:ietf:params:oauth:grant-type:pre-authorized_code',
          expiresIn: 3600
        }
      });

      toastSuccess({
        text: t('offers.create_success')
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toastError({
        text:
          (error as any)?.response?.data?.error_description ||
          t('offers.error_message')
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
        <Dialog.Content className='fixed left-1/2 top-1/2 z-50 w-192 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-radial-gradient px-8 py-16 shadow-lg'>
          <Dialog.Title className='mb-4 text-center text-lg font-bold text-sky-950'>
            {t('offers.create')}
          </Dialog.Title>
          <div className='flex flex-col justify-between'>
            <form onSubmit={handleSubmit} className='flex-col space-y-4'>
              <div>
                <Label text={t('offers.select_schema')} />
                <Select
                  value={String(formData.schemaTemplateId)}
                  onValueChange={(value: any) => {
                    const selectedSchema = schemas?.items?.find(
                      (schema: any) => String(schema.id) === String(value)
                    );

                    setFormData((prev) => ({
                      ...prev,
                      schemaTemplateId: String(value),
                      selectedSchema,
                      formValues: {}
                    }));
                  }}
                  className='mb-4'
                  placeholder={t('offers.select_schema')}
                  items={
                    schemas?.items?.map((schema: any) => ({
                      value: String(schema.id),
                      label: schema.name
                    })) || []
                  }
                />

                <div className='mb-4 mt-4'>
                  <Label text={t('offers.subject_did')} />
                  <Input
                    name='subjectDid'
                    value={formData.subjectDid}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subjectDid: e.target.value
                      }))
                    }
                    required
                    placeholder={t('offers.enter_subject_did')}
                  />
                </div>

                {(formData as any).selectedSchema?.validationRules && (
                  <div className='space-y-4'>
                    {renderFormFields(
                      (formData as any).selectedSchema.validationRules
                    )}
                  </div>
                )}
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
                  disabled={!formData.schemaTemplateId}
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
};

export default CreateOfferDialog;
