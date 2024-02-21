'use client';

import {
  BellIcon,
  PlusIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { IconDropdown } from 'react-day-picker';

import logo from '@public/Logo.png';

import { toastError, toastInfo, toastSuccess } from '@utils/toast';

import Button from '@ui/Button';
import InfoCard from '@ui/InfoCard';
import Input from '@ui/Input';
import Select from '@ui/Select';
import Status from '@ui/Status';
import Textarea from '@ui/Textarea';
import Table from '@ui/table/Table';

const ComponentsPage = () => (
  <div className='space-x-8 space-y-4'>
    <h1 className='text-4xl font-bold'>Components</h1>

    <h2 className='text-2xl'>Buttons -----------------------------------</h2>

    <h3>
      Variant: <b>primary</b>
    </h3>
    <div className='space-y-4'>
      <div className='flex gap-2'>
        <Button>Primary</Button>
        <Button disabled>Primary</Button>
      </div>
      <div className='flex gap-2'>
        <Button size='icon-default'>
          <PlusIcon className='h-3.5 w-3.5' />
        </Button>
        <Button size='icon-default' disabled>
          <PlusIcon className='h-3.5 w-3.5' />
        </Button>
      </div>

      <div className='flex gap-2'>
        <Button size='sm'>Primary</Button>
        <Button size='sm' disabled>
          Primary
        </Button>
      </div>

      <div className='flex gap-2'>
        <Button size='icon-sm'>
          <PlusIcon className='h-3.5 w-3.5' />
        </Button>
        <Button size='icon-sm' disabled>
          <PlusIcon className='h-3.5 w-3.5' />
        </Button>
      </div>

      <h3>
        Variant: <b>secondary</b>
      </h3>
      <div className='space-y-4'>
        <div className='flex gap-2'>
          <Button variant='secondary'>Secondary</Button>
          <Button disabled variant='secondary'>
            Secondary
          </Button>
        </div>

        <div className='flex gap-2'>
          <Button size='icon-default' variant='secondary'>
            <PlusIcon className='h-3.5 w-3.5' />
          </Button>
          <Button size='icon-default' disabled variant='secondary'>
            <PlusIcon className='h-3.5 w-3.5' />
          </Button>
        </div>
        <div className='flex gap-2'>
          <Button size='sm' variant='secondary'>
            Secondary
          </Button>
          <Button size='sm' variant='secondary' disabled>
            Secondary
          </Button>
        </div>

        <div className='flex gap-2'>
          <Button size='icon-sm' variant='secondary'>
            <PlusIcon className='h-3.5 w-3.5' />
          </Button>
          <Button size='icon-sm' disabled variant='secondary'>
            <PlusIcon className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>

      <h3>
        Variant: <b>green</b>
      </h3>
      <div className='space-y-4'>
        <div className='flex gap-2'>
          <Button variant='green'>Green</Button>
          <Button disabled variant='green'>
            Green
          </Button>
        </div>

        <div className='flex gap-2'>
          <Button size='icon-default' variant='green'>
            <PlusIcon className='h-3.5 w-3.5' />
          </Button>
          <Button size='icon-default' disabled variant='green'>
            <PlusIcon className='h-3.5 w-3.5' />
          </Button>
        </div>

        <div className='flex gap-2'>
          <Button size='sm' variant='green'>
            Green
          </Button>
          <Button size='sm' variant='green' disabled>
            Green
          </Button>
        </div>

        <div className='flex gap-2'>
          <Button size='icon-sm' variant='green'>
            <PlusIcon className='h-3.5 w-3.5' />
          </Button>
          <Button size='icon-sm' disabled variant='green'>
            <PlusIcon className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>

      <h3>
        Variant: <b>red</b>
      </h3>
      <div className='space-y-4'>
        <div className='flex gap-2'>
          <Button variant='red'>Red</Button>
          <Button disabled variant='red'>
            Red
          </Button>
        </div>

        <div className='flex gap-2'>
          <Button size='icon-default' variant='red'>
            <PlusIcon className='h-3.5 w-3.5' />
          </Button>
          <Button size='icon-default' disabled variant='red'>
            <PlusIcon className='h-3.5 w-3.5' />
          </Button>
        </div>

        <div className='flex gap-2'>
          <Button size='sm' variant='red'>
            Red
          </Button>
          <Button size='sm' variant='red' disabled>
            Red
          </Button>
        </div>

        <div className='flex gap-2'>
          <Button size='icon-sm' variant='red'>
            <PlusIcon className='h-3.5 w-3.5' />
          </Button>
          <Button size='icon-sm' disabled variant='red'>
            <PlusIcon className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>
    </div>

    <h2>Cards -----------------------------------</h2>
    <InfoCard
      title='70'
      label='Pending requests'
      icon={BellIcon}
      link='/'
      anchorText='View pending requests'
    />

    <InfoCard
      title='Resources'
      label='Need help?'
      icon={QuestionMarkCircleIcon}
      link='/'
      anchorText='Visit our resource center'
      className='bg-radial-gradient'
    />

    <div>
      <h2>Toasts -----------------------------------</h2>
      <div className='flex max-w-lg flex-col gap-4'>
        <Button
          onClick={() => {
            toastInfo({
              text: 'We added a couple of new features.',
              detailsLink: '/'
            });
          }}
        >
          Show toast info
        </Button>
        <Button
          onClick={() => {
            toastSuccess({
              text: 'You have successfully issued a new credential!',
              detailsLink: '/'
            });
          }}
        >
          Show toast success
        </Button>
        <Button
          onClick={() => {
            toastError({
              text: 'Seems like something went wrong...',
              detailsLink: '/'
            });
          }}
        >
          Show toast error
        </Button>
      </div>
    </div>

    <h2 className='text-2xl'>Inputs -----------------------------------</h2>
    <div className='max-w-lg space-y-2'>
      <Input icon={IconDropdown} />
      <Input placeholder='Input with placeholder' />
      <Input placeholder='Input with success border' variant='success' />
      <Input placeholder='Input with error border' variant='error' />
      <Input value='Input with value' onChange={() => {}} />
      <Input placeholder='Disabled with placeholder' disabled />
      <Input value='Disabled with value' onChange={() => {}} disabled />
    </div>

    <h2 className='text-2xl'>Textarea -----------------------------------</h2>
    <div className='max-w-lg space-y-2'>
      <Textarea />
      <Textarea placeholder='Textarea with placeholder' />
      <Textarea placeholder='Textarea with success border' variant='success' />
      <Textarea placeholder='Textarea with error border' variant='error' />
      <Textarea placeholder='Textarea with placeholder' />
      <Textarea value='Textarea with value' onChange={() => {}} />
      <Textarea placeholder='Disabled with placeholder' disabled />
      <Textarea value='Disabled with value' disabled onChange={() => {}} />
    </div>

    <h2 className='text-2xl'>Select -----------------------------------</h2>
    <div className='max-w-lg space-y-2'>
      <div className='flex max-w-lg flex-col space-y-2'>
        <Select
          items={[
            { label: 'Select with value', value: 'item1' },
            { label: 'Unselected', value: 'item2' },
            { label: 'Disabled', value: 'item3', disabled: true }
          ]}
        />
        <Select
          placeholder='Select placeholder'
          items={[
            { label: 'Select with value', value: 'item1' },
            { label: 'Unselected', value: 'item2' },
            { label: 'Disabled', value: 'item3', disabled: true }
          ]}
        />
        <Select
          value='item1'
          items={[
            { label: 'Select with value', value: 'item1' },
            { label: 'Unselected', value: 'item2' },
            { label: 'Disabled', value: 'item3', disabled: true }
          ]}
        />
        <Select placeholder='Disabled with placeholder' disabled items={[]} />
      </div>
    </div>

    <h2 className='text-2xl'>Logo -----------------------------------</h2>
    <Image alt='logo' src={logo} />

    <h2 className='text-2xl'>Status -----------------------------------</h2>
    <div className='flex gap-4'>
      <Status variant='approved' />
      <Status variant='pending' />
      <Status variant='rejected' />
    </div>

    <h2 className='text-2xl'>Table -----------------------------------</h2>
    <div className='space-y-2'>
      <Table
        columns={[
          {
            header: 'Name',
            accessorKey: 'name'
          },
          {
            header: 'Email',
            accessorKey: 'email'
          },
          {
            header: 'Number',
            accessorKey: 'no'
          }
        ]}
        data={[
          {
            no: 12,
            name: 'Gratian',
            email: 'gmuntean@protokol.com'
          },
          {
            no: 12,
            name: 'Gratian',
            email: 'gmuntean@protokol.com'
          },
          {
            no: 12,
            name: 'Gratian',
            email: 'gmuntean@protokol.com'
          }
        ]}
      />

      <Table
        isLoading
        columns={[
          {
            header: 'Name'
          },
          {
            header: 'Email'
          }
        ]}
        data={[]}
      />

      <Table
        columns={[
          {
            header: 'Name'
          },
          {
            header: 'Email'
          }
        ]}
        data={[]}
      />
    </div>
  </div>
);

export default ComponentsPage;
