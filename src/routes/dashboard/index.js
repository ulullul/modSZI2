import React from 'react';
import Dashboard from './Dashboard';
import Layout from '../../components/Layout';

export default function action() {
  return {
    chunks: ['dashboard'],
    component: (
      <Layout>
        <Dashboard />
      </Layout>
    ),
    title: 'Smart Security Dashboard',
  };
}
