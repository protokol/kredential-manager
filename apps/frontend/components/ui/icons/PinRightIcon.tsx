import type { FC, SVGProps } from 'react';

const PinRightIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='17'
    height='16'
    viewBox='0 0 17 16'
    fill='none'
    {...props}
  >
    <path
      d='M10.1589 9.66725L14.4922 14.0006M11.5142 5.24587L10.5528 5.34567C9.89615 5.41383 9.24817 5.15356 8.82112 4.65012L7.79185 3.43676C7.03558 2.54522 5.67914 2.48964 4.85246 3.31631L4.02275 4.14603C3.19601 4.97276 3.25167 6.32932 4.14335 7.08555L5.35625 8.1142C5.85977 8.54124 6.1201 9.18926 6.05195 9.84596L5.95213 10.8079C5.91842 11.1327 6.03292 11.4553 6.26379 11.6862V11.6862C6.68706 12.1095 7.37332 12.1095 7.79659 11.6862L12.3925 7.09031C12.8157 6.66704 12.8157 5.98079 12.3925 5.55753V5.55753C12.1616 5.32665 11.8389 5.21216 11.5142 5.24587Z'
      stroke='#1E293B'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export default PinRightIcon;
