import type { FC, SVGProps } from 'react';

const PinLeftIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='17'
    height='16'
    viewBox='0 0 17 16'
    fill='none'
    {...props}
  >
    <path
      d='M7.04427 9.66725L2.71094 14.0006M5.68895 5.24587L6.65033 5.34567C7.30698 5.41383 7.95495 5.15356 8.38201 4.65012L9.41128 3.43676C10.1675 2.54522 11.524 2.48964 12.3507 3.31631L13.1804 4.14603C14.0071 4.97276 13.9515 6.32932 13.0598 7.08555L11.8469 8.1142C11.3434 8.54124 11.083 9.18926 11.1512 9.84596L11.251 10.8079C11.2847 11.1327 11.1702 11.4553 10.9393 11.6862V11.6862C10.5161 12.1095 9.82981 12.1095 9.40654 11.6862L4.81066 7.09031C4.38739 6.66704 4.3874 5.98079 4.81066 5.55753V5.55753C5.04154 5.32665 5.36419 5.21216 5.68895 5.24587Z'
      stroke='#1E293B'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export default PinLeftIcon;