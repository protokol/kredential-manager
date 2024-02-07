import { cn } from '@utils/cn';

const Spinner = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='200px'
    height='200px'
    viewBox='0 0 100 100'
    preserveAspectRatio='xMidYMid'
    className={cn('h-12 w-12 animate-spin')}
  >
    <circle
      cx='50'
      cy='50'
      fill='none'
      stroke='#082F49'
      strokeWidth='6'
      r='35'
      strokeDasharray='164.93361431346415 56.97787143782138'
      transform='matrix(1,0,0,1,0,0)'
    />
  </svg>
);

export default Spinner;
