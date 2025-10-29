import React from 'react';
import Head from 'next/head';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Dashboard - AISim</title>
        <meta name="description" content="AISim Analytics Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Dashboard />
    </>
  );
}



