'use client';

import { useEffect, useState } from "react";
import cn from 'classnames';

export default function Home() {
  const [tradeDetails, setTradeDetails] = useState(null);
  const [websocket, setWebSocket] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.status === 'Error') {
        setStatus('Error');
        setError(String(data.error.message));

        return;
      }

      if (data.status) {
        setStatus(data.status);
      }

      if (data.replicatedTradeResult) {
        setTradeDetails(data.replicatedTradeResult);
      }
    };

    setWebSocket(ws);
  }, []);

  const handleTrade = () => {
    if (websocket) {
      websocket.send('trade')
    }

    setTradeDetails(null);
    setError('');
  };

  return (
    <div className="w-screen h-screen bg-slate-900 flex items-end justify-between p-12">
      <div className="h-full flex flex-col justify-between bg-slate-800 p-8 pr-24">
        <h1 className="text-2xl font-bold text-slate-300">Your trade details</h1>

        <div className="flex flex-col gap-3 max-w-48 min-w-48">
          <code
            className={cn('block w-full text-sm text-green-500', {
              'animate-pulse': !tradeDetails && !error,
              'text-red-500': error && status === 'Error'
            })}
          >
            {status}
          </code>
          {tradeDetails && (
            <code className="block w-full max-w-full text-[12px]">{JSON.stringify(tradeDetails, null, 2)}</code>
          )}

          {error && (
            <div className="max-h-36 w-full overflow-auto text-ellipsi text-sm text-red-500">
              {error}
            </div>
          )}
        </div>
      </div>

      <button
        className="px-16 py-2 bg-black border border-violet-500 text-violet-500 hover:text-violet-700 hover:border-violet-700 duration-150 transition-colors"
        onClick={handleTrade}
      >
        Trade
      </button>
    </div>
  );
}
