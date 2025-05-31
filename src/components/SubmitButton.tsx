// File: /components/SubmitButton.tsx
"use client";

import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type Props = {
    loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function SubmitButton({ children, loading, ...props }: Props) {
    return (
        <button
            {...props}
            className={`bg-rose-600 text-white px-4 py-2 rounded font-semibold hover:bg-rose-700 transition ${
                props.disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" /> Submitting...
                </span>
            ) : (
                children
            )}
        </button>
    );
}
