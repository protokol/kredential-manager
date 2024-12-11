import type { FC, SVGProps } from 'react';

const PlaceholderAvatar: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='49'
    height='48'
    viewBox='0 0 49 48'
    fill='none'
    {...props}
  >
    <g clipPath='url(#clip0_5562_75157)'>
      <rect x='0.600098' width='48' height='48' rx='24' fill='#F1F5F9' />
      <path
        d='M48.6001 41.988V48.002H0.600098V42.01C3.392 38.2789 7.01591 35.2507 11.1837 33.1661C15.3514 31.0815 19.9481 29.9981 24.6081 30.002C34.4161 30.002 43.1281 34.71 48.6001 41.988ZM32.6041 18C32.6041 20.1217 31.7612 22.1566 30.261 23.6569C28.7607 25.1571 26.7258 26 24.6041 26C22.4824 26 20.4475 25.1571 18.9472 23.6569C17.447 22.1566 16.6041 20.1217 16.6041 18C16.6041 15.8783 17.447 13.8434 18.9472 12.3431C20.4475 10.8429 22.4824 10 24.6041 10C26.7258 10 28.7607 10.8429 30.261 12.3431C31.7612 13.8434 32.6041 15.8783 32.6041 18Z'
        fill='#CBD5E1'
      />
    </g>
    <defs>
      <clipPath id='clip0_5562_75157'>
        <rect x='0.600098' width='48' height='48' rx='24' fill='white' />
      </clipPath>
    </defs>
  </svg>
);

export default PlaceholderAvatar;
