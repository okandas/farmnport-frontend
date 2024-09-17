"use client";

import {captureException } from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error }: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    captureException(error)
    console.error(error)
  }, [error]);

  return (
    <html>
      <body>
        <h1>Something went wrong!</h1>
      </body>
    </html>
  );
}