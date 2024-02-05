import { PlusIcon } from '@heroicons/react/24/outline';

import Button from '@ui/Button';

const ComponentsPage = () => (
  <div className='space-x-8 space-y-4'>
    <h1 className='text-4xl font-bold'>Components</h1>

    <h2 className='text-2xl'>Buttons</h2>

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
  </div>
);

export default ComponentsPage;
