'use client';
import { useEffect } from 'react';

export default function PageTitle({ title = 'Brainstem' }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}

