import Link from 'next/link';

type CardType = {
  label: string;
  title: string;
  anchorText: string;
  link: string;
  icon: React.ElementType;
};

const Card = (props: CardType) => {
  const { icon, title, anchorText, label, link } = props;

  const Icon = icon;

  return (
    <section className='flex w-96 flex-col gap-12 rounded-2xl border-1.5 border-slate-200 bg-radial-gradient p-6 pb-4'>
      <div className='flex gap-5'>
        <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-sky-950 p-2'>
          <Icon className='h-6 w-6 text-white' />
        </div>
        <div className='dt-column flex flex-col justify-between'>
          <span className='text-sm text-slate-500'>{label}</span>
          <span className='text-2xl font-medium text-sky-950'>{title}</span>
        </div>
      </div>
      <Link href={link}>
        <div className='cursor-pointer text-sm font-bold text-sky-950 underline'>
          <span>{anchorText}</span>
        </div>
      </Link>
    </section>
  );
};

export default Card;
