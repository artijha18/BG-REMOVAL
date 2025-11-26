import React, { useState, useEffect, Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Loader = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const Download = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);
const ArrowLeft = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);
const ImageIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.08-5.14a1 1 0 0 0-1.6.08L6 21" />
  </svg>
);
const Sparkles = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.95 2.11 12 5.5l2.05-3.39A2 2 0 0 1 15.6 2h2.8c1.33 0 2.24 1.14 1.94 2.45l-1.9 4.39 4.14 1.76a2 2 0 0 1 0 3.86l-4.14 1.76 1.9 4.39c.3.9-.3 1.94-1.2 1.94h-2.8c-.8 0-1.5-.4-1.94-1.07L12 18.5l-2.05 3.39A2 2 0 0 1 8.4 22H5.6c-1.33 0-2.24-1.14-1.94-2.45l1.9-4.39-4.14-1.76a2 2 0 0 1 0-3.86l4.14-1.76-1.9-4.39C3.36 3.14 4.27 2 5.6 2h2.8c.8 0 1.5.4 1.95 1.07z" />
  </svg>
);

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=';

const urlToBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = reject;
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  });
};

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { processedImageUrl, originalFileName, originalImageUrl } = location.state || {};

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    if (!processedImageUrl) {
      navigate('/');
    }
  }, [processedImageUrl, navigate]);

  if (!processedImageUrl) {
    return <div className="text-center p-8 text-gray-500">Redirecting...</div>;
  }

  const analyzeImage = async () => {
    setAnalysisLoading(true);
    setAnalysisResult(null);
    setAnalysisError(null);

    try {
      const base64Data = await urlToBase64(processedImageUrl);

      const prompt = `Analyze this isolated subject. Describe it concisely (2-3 sentences max) and then suggest 3 creative, high-contrast, detailed background ideas.`;

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: 'image/png',
                  data: base64Data,
                },
              },
            ],
          },
        ],
      };

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message || `API failed ${response.status}`);
      }

      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) setAnalysisResult(generatedText);
      else throw new Error('No valid response from API.');
    } catch (error) {
      setAnalysisError(`Analysis failed: ${error.message}`);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const AnalysisContent = () => {
    if (analysisLoading) {
      return (
        <div className="flex items-center justify-center p-4 text-purple-600 border border-purple-200 rounded-lg mt-4">
          <Loader className="w-5 h-5 animate-spin mr-2" />
          Analyzing subject with AI...
        </div>
      );
    }

    if (analysisError) {
      return (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300 mt-4">
          <p className="font-semibold">Error:</p> {analysisError}
        </div>
      );
    }

    if (analysisResult) {
      const formatted = analysisResult.split('\n').map((line, i) => (
        <Fragment key={i}>
          {line}
          <br />
        </Fragment>
      ));

      return (
        <div className="p-4 text-gray-700 bg-purple-50 rounded-lg border border-purple-200 text-sm mt-4">
          <p className="font-bold text-purple-700 mb-1">AI Subject Analysis:</p>
          {formatted}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="mx-4 my-3 lg:mx-44 mt-14 min-h-[75vh]">
      <div className="bg-white rounded-lg px-8 py-6 drop-shadow-sm">
        <h1 className="text-center text-3xl font-bold mb-6 text-purple-700">Result</h1>

        <div className="flex flex-col sm:grid grid-cols-2 gap-8">
          <div>
            <p className="font-semibold text-gray-600 mb-2">Original</p>
            <div className="rounded-md border h-64 flex justify-center items-center bg-gray-100 p-2">
              {originalImageUrl ? (
                <img src={originalImageUrl} className="max-h-full max-w-full object-contain rounded-md" />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <p className="font-semibold text-gray-600 mb-2">Background Removed</p>
            <div className="rounded-md border border-gray-300 h-full relative overflow-hidden bg-checkered flex justify-center items-center p-2">
              <img src={processedImageUrl} className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-100">
         

{/*  */}

          <AnalysisContent />
        </div>

        <div className="flex justify-center sm:justify-end items-center flex-wrap gap-4 mt-6">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-2.5 text-violet-600 text-sm border border-violet-600 rounded-full hover:scale-105 transition-all duration-700 inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Try another image
          </button>

          <a
            href={processedImageUrl}
            download={`${originalFileName || 'image'}_bg_removed.png`}
            className="px-8 py-2.5 text-white text-sm bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full hover:scale-105 transition-all duration-700 inline-flex items-center gap-2"
          >
            <Download size={16} /> Download image
          </a>
        </div>
      </div>

      <style>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
                            linear-gradient(-45deg, #ccc 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #ccc 75%),
                            linear-gradient(-45deg, transparent 75%, #ccc 75%);
          background-size: 16px 16px;
          background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
        }          
      `}</style>
    </div>
  );
};

export default Result;
