import toast from 'react-hot-toast';

import type { ToastProps } from '@ui/Toast';
import Toast from '@ui/Toast';

export const toastSuccess = (props: ToastProps) =>
  customToast({
    ...props,
    variant: 'success'
  });

export const toastError = (props: ToastProps) =>
  customToast({
    ...props,
    variant: 'error'
  });

export const toastInfo = (props: ToastProps) =>
  customToast({
    ...props,
    variant: 'info'
  });

const customToast = ({ duration = 3000, ...props }: ToastProps) => {
  toast.custom((t) => <Toast {...props} dismiss={() => toast.remove(t.id)} />, {
    duration,
    position: 'top-center'
  });
};
