import React from 'react';
import ErrorPage from './ErrorPage';

export default function action() {
  return {
    component: <ErrorPage />,
    title: 'Demo Error',
  };
}
