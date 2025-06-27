// Loading event utilities

interface LoadingOptions {
  message?: string;
}

export const loading = {
  show: (options?: LoadingOptions) => {
    const event = new CustomEvent('loading:show', {
      detail: options
    });
    window.dispatchEvent(event);
  },

  hide: () => {
    const event = new CustomEvent('loading:hide');
    window.dispatchEvent(event);
  }
};
