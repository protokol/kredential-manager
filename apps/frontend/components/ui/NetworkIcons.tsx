import type { FC, SVGProps } from 'react';

export const EthereumIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='20'
    height='20'
    viewBox='0 0 20 20'
    fill='none'
    {...props}
  >
    <rect width='20' height='20' fill='url(#pattern0)' />
    <defs>
      <pattern
        id='pattern0'
        patternContentUnits='objectBoundingBox'
        width='1'
        height='1'
      >
        <use xlinkHref='#image0_7675_141692' transform='scale(0.00333333)' />
      </pattern>
      <image
        id='image0_7675_141692'
        width='300'
        height='300'
        xlinkHref='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAMAAABOo35HAAAC+lBMVEVHcExif+hifelhfelhfephfulifuthfehhfeljf+xif+xhfephfephfelhfelifupif+1hfepifuthfutifuthfOphfuphfOlgfOZhf+xdet9de+lifuxhfepifuphfelhfepkge9mg/RnhPVnhfdohvlph/tqiP1ph/pohfhohvhnhPZpiPxkgfBifuthfephfephfuxifulif+ldeORifelif+1hfelifuxlgvJjf+xjf+tif+tifutifupkgO5lgvFohvphfupif+xcfudkgO1hfeplge9jgO9ifutifutgfepifupifutmhPRjgO1hfuphfepif+tkgO9ifupjge9ifepjgO5kgfBkgO9jf+xjgO5gfepjgO9if+xifuxhfepjgO1jfe1kgfBkgO9ifupjgO5jgO5kgfBhfOhjgO5ifuplgvFkgfBifelifulkgfFhfOljgO5kgfBhfupifutge+hee+phfepuiOxlgetfe+pkgOvS2vqJn/BZd+llgvJWdOmqufT///+1wvZkgvFbeOlzje32+P7I0viWqfHJ0/jy9P3DzffAzPd1ju1ceelXdemRpfHBzPfH0PhgfOpgfepeeurn7PzI0fiInfBaeOmywPXAy/fEzve5xvZrhetlgfF8lO76+/6crvJiferU2/rCzfd6ku5hfeqarfLG0PiuvPXt8f2PpPC7x/a/yvdviexdeuqEm+/9/v+ktPPc4vuAl+5kge+ltfO0wvVbeelxi+z09v7H0fdWdenk6fyGnO+wvvXFz/hphOv4+f5hfupqheuOovC+yfeDmu78/P+isvNffOp/lu5rfNa0wfVhfeiUp/Gnt/TCzPe3xPZ4kO1iferP2Plhfenq7v2NofBsh+yBmO6gsfNhfera4Pp/le5hfutifOqLoPDi5/ysuvRnguuYq/LN1vm9yPfX3/pjgfDw8/3Ez/iesPLV3fphfene5PuDme+puPTL1Plifuq/y/eCme59le7x9P3z9f7Ezvj+//+bSJmVAAAA93RSTlMADRklNUlaaHWCj6Kfp7/Dq5N5aVxOOSgcEAILRWLU5fT/////////////////+OeIZEwrBSKV4vP////////////JTgcWQ3PRsH0fVOz/78xAhb/uxl+l6LJruS/z/Vfx/zLemzz62eMtybr98Jr/9VHe+262E/////////////D/////+f////////////////////////////////////////+L////gP//////////////////7P////////////////////////////8B/3H//////9D/2P//////xv//3An///////////3/////4P////+gcfTf6QAAGipJREFUeAHs2XOD7ToQAPCsbXuLpCnXqKY9a9u2ra//3rWNNjl7f/8XcWYGsSElNS09IzMrOyc3L7+g8KWi4vy8kpzSsvKKyqrqmlr0D6pLq2/IyStsbGoWREnGRKGqJouv6JpKFQOrkmhaLY1FBa1t7R0p6Hnq7KrP7i7s6TUJfdEhtuC4nu/D53zPdYJQlHGCiFZLX35pf9oAek4Gh4YLRpptbOgvOgl+2ItOkwgVrcbRsYxx9BykTrQWTdoES4Ljw69wAxHTqemZ3MwulMxqZufmFyRDNx34Ta754jXWYm77IEpK40vLPTaRBRf+EC/QqbSyulaFkkza2novprYDf5gXatRaHNtIojlVtr6Z0AQf/o5Aplt9pR1JsU9tj+5QTYC/alen1npbKuLbXu6+jAWIQKDilYNDxK2U8vUjYvsQET8k4eIan8djWs6xpu5CpBydnOSeIt5U5vcS0YfohcZRcT3iSf3qFjEhJgG1i7Y7+emqkAYQI0eVz7a5yOrUr9sJB2LmydpZOfOzq3LVxq+6ioHuWuxHLDtdDt7MKia6Sz+fRayqzt00AmCIk7hYrmIz9bl2YgjAmF1ymVODmDO0SERgkGkcZ7K2Aq9MzQc2SfIoUymJpRNl9xpY5ZDLUmauEWmjmggsuw6NxUrEhLYV4gDr8NEcAxW0rlEsXgPzrgVlMR3FLHPFcIEP+CY73vTelf7BtGLctUlWY6zNpo8Yu8ARl5zcopiU3WjAl2tJbO2MZQke4PAaOHMdKOvVKHJVZ4oDPCJ3QyhiFSsY+HSt3z+gSGVfiNfAqetQK4kw59zZnTCvgV+7yuMTisjTo/I/c+cdF8W1/v+T3jW9N5ciwnpvegKYA+m93l4N+b3SE9OzI4vub5k4OCqy67iLK2E0xOugi4Brp0RxFSkusffeUGOv+O2ecEXCmYVZdp5H3//mr7zd83A+55x5Howdg02Au4/t/TzS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'
      />
    </defs>
  </svg>
);

export const PolygonIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='21'
    height='21'
    viewBox='0 0 21 21'
    fill='none'
    {...props}
  >
    <g clipPath='url(#clip0_7675_141789)'>
      <mask
        id='mask0_7675_141789'
        style={{
          maskType: 'luminance'
        }}
        maskUnits='userSpaceOnUse'
        x='0'
        y='0'
        width='21'
        height='21'
      >
        <path
          d='M10.5001 20.7863C16.181 20.7863 20.7863 16.181 20.7863 10.5001C20.7863 4.81917 16.181 0.213867 10.5001 0.213867C4.81917 0.213867 0.213867 4.81917 0.213867 10.5001C0.213867 16.181 4.81917 20.7863 10.5001 20.7863Z'
          fill='white'
        />
      </mask>
      <g mask='url(#mask0_7675_141789)'>
        <path
          d='M21.7601 -0.76001H-0.760254V21.7604H21.7601V-0.76001Z'
          fill='url(#paint0_linear_7675_141789)'
        />
      </g>
      <path
        d='M13.4751 12.7197L16.3853 11.0393C16.5394 10.9503 16.6348 10.7848 16.6348 10.6067V7.24629C16.6348 7.06863 16.539 6.90273 16.3853 6.81369L13.4751 5.13327C13.321 5.04423 13.1299 5.04465 12.9757 5.13327L10.0655 6.81369C9.9114 6.90273 9.81606 7.06863 9.81606 7.24629V13.2519L7.77528 14.43L5.7345 13.2519V10.8953L7.77528 9.71715L9.12138 10.4942V8.91327L8.02476 8.28033C7.94916 8.23665 7.86264 8.21355 7.77486 8.21355C7.68708 8.21355 7.60056 8.23665 7.52538 8.28033L4.6152 9.96075C4.46106 10.0498 4.36572 10.2153 4.36572 10.3934V13.7538C4.36572 13.9314 4.46148 14.0973 4.6152 14.1864L7.52538 15.8668C7.6791 15.9554 7.87062 15.9554 8.02476 15.8668L10.9349 14.1868C11.0891 14.0978 11.1844 13.9319 11.1844 13.7542V7.74861L11.2214 7.72761L13.2252 6.57051L15.266 7.74861V10.1052L13.2252 11.2833L11.8812 10.5072V12.0881L12.9757 12.7202C13.1299 12.8088 13.321 12.8088 13.4751 12.7202V12.7197Z'
        fill='white'
      />
    </g>
    <defs>
      <linearGradient
        id='paint0_linear_7675_141789'
        x1='-4.87583'
        y1='1.09093'
        x2='18.3728'
        y2='15.318'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#A229C5' />
        <stop offset='1' stopColor='#7B3FE4' />
      </linearGradient>
      <clipPath id='clip0_7675_141789'>
        <rect width='21' height='21' fill='white' />
      </clipPath>
    </defs>
  </svg>
);
