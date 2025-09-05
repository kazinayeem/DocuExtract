"use client";

import {
  exportCashMemo,
  extractJSON,
} from "@/utils/export_exel";
import { useState } from "react";
import Image from 'next/image'; // Import next/image for better performance

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setAnswer("");

    try {
      const form = new FormData();
      form.append("image", file);

      const res = await fetch("/api/gemini", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setAnswer(data.text);
    } catch (err: any) {
      setAnswer(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleExportClick = async () => {
    const format = (
      document.getElementById("exportFormat") as HTMLSelectElement
    ).value;
    const parsed = extractJSON(answer);
    if (!parsed) {
      alert("Invalid JSON returned from Gemini");
      return;
    }
    await exportCashMemo(parsed, format);
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg md:max-w-3xl">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-200">

          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
              DocuExtract
            </h1>
            <p className="mt-2 text-lg text-gray-600 max-w-md mx-auto">
              Effortlessly extract cash memo data and export to various formats.
            </p>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <label 
                className={`relative w-full border-2 border-dashed rounded-xl p-8 transition-colors ${
                  file ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50"
                } cursor-pointer`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-gray-500 font-medium">
                    {file ? `Selected: ${file.name}` : "Click to upload an image"}
                  </span>
                  {!file && (
                    <span className="mt-1 text-sm text-gray-400">
                      (PNG, JPG, JPEG, etc.)
                    </span>
                  )}
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
            >
              {loading ? "Analyzing Document..." : "Upload & Analyze"}
            </button>
          </form>

          {/* Export Section */}
          {answer && (
            <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-inner transition-opacity duration-500 ease-in-out opacity-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-200 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">✨</span>
                Export Cash Memo
              </h2>

              {answer.startsWith("❌ Error:") ? (
                <p className="text-red-600 font-semibold">{answer}</p>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Document analysis complete. Select a format to download the structured data.
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <select
                      id="exportFormat"
                      className="flex-grow w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue="pdf"
                    >
                      <option value="pdf">PDF (Print)</option>
                      <option value="xlsx">Excel (Data Analysis)</option>
                      <option value="csv">CSV (Plain Text)</option>
                      <option value="json">JSON (Developer)</option>
                      <option value="docx">Word (Document)</option>
                      <option value="xml">XML (Markup)</option>
                      <option value="gsheet">Google Sheets</option>
                    </select>

                    <button
                      onClick={handleExportClick}
                      className="w-full sm:w-auto rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold shadow hover:bg-blue-700 transition"
                    >
                      Download
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}