// components/EventDetailsSidebar.tsx
"use client";

import React, { useEffect } from "react";
import { EventData  } from "@/hooks/VoteApi";
import { X, Copy, CheckCircle } from "lucide-react";

export default function EventDetailsSidebar({
  event,
  open,
  onClose,
}: {
  event: EventData | null;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!event) return null;

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
  };

  // naive "integrity" indicator (front-end only): show if prevHash and entryHash are present
  const integrityHint = event.prevHash && event.entryHash ? true : false;

  return (
    <>
      {/* overlay for mobile when open */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* drawer: right on md+, bottom on sm */}
      <aside
        className={`fixed z-[999] bg-gray-800 text-white shadow-xl transition-transform
          ${open ? "translate-x-0" : "translate-x-full"}
          md:translate-x-0 md:right-0 md:top-0 md:bottom-0 md:w-96
          left-0 bottom-0 w-full h-96 md:h-full
        `}
        style={{ right: 0 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700 mt-14">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-gray-900">
              <CheckCircle className="text-green-400" />
            </div>
            <div>
              <div className="text-sm text-gray-300">{event.eventType}</div>
              <div className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { copy(event.entryHash); }}
              className="p-2 rounded-md hover:bg-gray-700"
              title="Copy entry hash"
            >
              <Copy size={16} />
            </button>

            <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-700" title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-auto h-[calc(100%-64px)]">
          <section className="mb-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Hash Chain</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between bg-gray-900 p-3 rounded">
                <div className="text-xs text-gray-300">Prev Hash</div>
                <div className="font-mono text-xs text-gray-200 truncate max-w-[220px]">{event.prevHash}</div>
              </div>

              <div className="flex items-center justify-between bg-gray-900 p-3 rounded">
                <div className="text-xs text-gray-300">Entry Hash</div>
                <div className="font-mono text-xs text-gray-200 truncate max-w-[220px]">{event.entryHash}</div>
              </div>

              <div className="flex items-center justify-between bg-gray-900 p-3 rounded">
                <div className="text-xs text-gray-300">Payload Hash</div>
                <div className="font-mono text-xs text-gray-200 truncate max-w-[220px]">{event.payloadHash}</div>
              </div>

              <div className="text-xs text-gray-400">Integrity: {integrityHint ? <span className="text-green-400">OK</span> : <span className="text-yellow-400">Unknown</span>}</div>
            </div>
          </section>

          <section className="mb-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Signature</h3>
            <div className="bg-gray-900 p-3 rounded font-mono text-xs truncate">{event.signature}</div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Meta / Payload</h3>
            <div className="bg-gray-900 p-3 rounded text-sm">
              <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(event.meta ?? {}, null, 2)}</pre>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
