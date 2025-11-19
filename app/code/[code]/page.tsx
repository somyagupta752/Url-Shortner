'use client';
import { Url } from '@/app/generated/prisma/client';
import { useParams } from 'next/navigation';
import React, { use, useEffect, useState } from 'react'

const page = () => {
    const [info, setInfo] = useState<Url|null>(null);
    const [loading, setLoading] = useState(true);
    const params = useParams();

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const code = params.code;
                const response = await fetch(`/api/links/${code}`); // replace 'abc123' with actual code
                const data = await response.json();
                setInfo(data);
            } catch (error) {
                console.error('Error fetching URL info:', error);
            }finally{
            setLoading(false);
            }
        };

        fetchInfo();
    }, [params.code]);

    if (loading) {
    return <div>Loading...</div>;
    }
    if (!info) {
    return <div>No data found.</div>;
    }


  return (
    <div>
      <div className="max-w-3xl mx-auto mt-10 p-4 border rounded">
        <h1 className="text-2xl font-bold mb-4">URL Information</h1>
        <p><strong>Original URL:</strong> <a href={info.url} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">{info.url}</a></p>
        <p><strong>Short Code:</strong> {info.code}</p>
        <p><strong>Clicks:</strong> {info.clicks}</p>
        <p><strong>Created At:</strong> {new Date(info.createdAt).toLocaleString()}</p>
        {info.lastClicked && (
          <p><strong>Last Clicked:</strong> {new Date(info.lastClicked).toLocaleString()}</p>
        )}
      </div>
    </div>
  )
}

export default page
