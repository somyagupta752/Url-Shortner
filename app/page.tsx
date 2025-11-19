"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { use, useEffect, useState } from "react";
import { Url } from "./generated/prisma/client";

const page = () => {
  const [url, setUrl] = useState(
    "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [data, setData] = useState<Url[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/links");
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    
    fetchData();
  }, []);

  const handleClick = async () => {
    //handle shorten url click
    setIsLoading(true);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, code }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        const short = origin ? `${origin}/${data.code}` : data.code;
        setResult(short);
      } else {
        setError(data.error);
      }
    } catch (err: unknown) {
      console.error(err);
      setError((err as any).error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (code: string) => {
    const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        const short = origin ? `${origin}/${code}` : code;
    try {
      await navigator.clipboard.writeText(short);
    } catch (err) {
      // ignore copy errors
    }
  };

  return (
    <div>
      <div className="flex h-80 w-screen justify-center items-center">
      <div className="max-w-3xl w-full ">
        <div className="flex w-full gap-2">
          <Input
            type="text"
            placeholder="Enter your long url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Enter your short code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button onClick={handleClick}>
            {isLoading ? "Shortening..." : "Shorten"}
          </Button>
        </div>
        {error ? <div className="text-red-500 mt-4">{error}</div> : null}
        {result ? (
          
          <div className="text-green-500 mt-4" >Shortened Url:  <a
                href={result}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >{result}</a>
              <Button onClick={()=>handleCopy(code)} className="cursor-pointer mx-2">Copy</Button>
              </div>
        ) : null}
      </div>
    </div>
    <div>
      <table className="table-auto w-full max-w-6xl mt-10 mx-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Short Code</th>
            <th className="px-4 py-2">Target URL</th>
            <th className="px-4 py-2">Total Clicks</th>
            <th className="px-4 py-2">Last Clicked</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td className="border px-4 py-2">{item.code} <button className="cursor-pointer" onClick={()=>handleCopy(item.code)}>Copy</button></td>
              <td className="border px-4 py-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  {item.url.length > 30
                    ? item.url.substring(0, 30) + "..."
                    : item.url}
                </a>
              </td>
              
              <td className="border px-4 py-2">{item.clicks}</td>
              <td className="border px-4 py-2">
                {item.lastClicked
                  ? new Date(item.lastClicked).toLocaleString()
                  : "Never"}
              </td>
            </tr>
          ))}
          </tbody>
      </table>
    </div>
    </div>
  );
};

export default page;
