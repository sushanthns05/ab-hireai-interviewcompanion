import { useState, useEffect } from "react";

interface StreamingMessageProps {
  content: string;
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setIsDone(false);
    
    // Split by words to stream chunk by chunk
    const words = content.split(" ");
    let i = 0;
    
    const interval = setInterval(() => {
      if (i < words.length) {
        setDisplayed(prev => (prev ? prev + " " + words[i] : words[i]));
        i++;
      } else {
        clearInterval(interval);
        setIsDone(true);
      }
    }, 40); // 40ms per word
    
    return () => clearInterval(interval);
  }, [content]);

  return (
    <>
      {displayed}
      {!isDone && <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-primary animate-pulse" />}
    </>
  );
}
