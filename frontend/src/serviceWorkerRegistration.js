export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Use the absolute path to make sure it works in any context
      const swUrl = `${window.location.origin}/service-worker.js`;
      
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          // Registration was successful
          if (import.meta.env.DEV) {
            console.log('Service Worker registered:', registration);
          }
        })
        .catch((error) => {
          if (import.meta.env.DEV) {
            console.error('Service Worker registration failed:', error);
          }
        });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => registration.unregister())
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error(error);
        }
      });
  }
}
