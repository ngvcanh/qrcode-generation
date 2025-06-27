import { pubsub, TOAST_EVENTS, type ToastData } from './pubsub';

export const toast = {
  success: (message: string, duration = 3000) => {
    pubsub.publish(TOAST_EVENTS.SHOW_TOAST, {
      message,
      type: 'success',
      duration,
    } as ToastData);
  },

  error: (message: string, duration = 3000) => {
    pubsub.publish(TOAST_EVENTS.SHOW_TOAST, {
      message,
      type: 'error',
      duration,
    } as ToastData);
  },

  warning: (message: string, duration = 3000) => {
    pubsub.publish(TOAST_EVENTS.SHOW_TOAST, {
      message,
      type: 'warning',
      duration,
    } as ToastData);
  },

  info: (message: string, duration = 3000) => {
    pubsub.publish(TOAST_EVENTS.SHOW_TOAST, {
      message,
      type: 'info',
      duration,
    } as ToastData);
  },

  show: (message: string, type: ToastData['type'] = 'success', duration = 3000) => {
    pubsub.publish(TOAST_EVENTS.SHOW_TOAST, {
      message,
      type,
      duration,
    } as ToastData);
  },
};
