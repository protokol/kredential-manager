import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const ONE_SECOND = 1000;

const useTimeElapsed = (startTime: Date): string => {
  const [timeElapsed, setTimeElapsed] = useState<string>('');

  const t = useTranslations();

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date();
      const difference = Math.abs(currentTime.getTime() - startTime.getTime());
      const secondsElapsed = Math.floor(difference / 1000);

      const m = t('global.minutes_unit');
      const h = t('global.hours_unit');

      if (secondsElapsed < 60) {
        setTimeElapsed(t('global.less_one_minute'));
      } else {
        const minutesElapsed = Math.floor(secondsElapsed / 60);
        if (minutesElapsed < 60) {
          setTimeElapsed(`${minutesElapsed}${m}`);
        } else {
          const hoursElapsed = Math.floor(minutesElapsed / 60);
          setTimeElapsed(`${hoursElapsed}${h}`);
        }
      }
    }, ONE_SECOND);

    return () => clearInterval(interval);
  }, [startTime, t]);

  return timeElapsed;
};

export default useTimeElapsed;
