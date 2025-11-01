import {useState} from 'react';

export const useAlert = () => {
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    content: '',
  });

  const showAlert = (title: string, content: string) => {
    setAlert({visible: true, title, content});
  };

  const hideAlert = () => {
    setAlert(prev => ({...prev, visible: false}));
  };

  return {alert, showAlert, hideAlert};
};
