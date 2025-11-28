import { assets } from '../assets/assets';
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const UploadCloud = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.216" />
        <path d="M12 10.999v7.198" />
        <path d="m15 15.999-3 3-3-3" />
    </svg>
);

const Loader = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

const API_ENDPOINT = 'https://bg-removal-1-v743.onrender.com/api/remove-background';

const useAuth = () => {
    const [isSignedIn] = useState(true);
    const getToken = useCallback(async () => {
        return 'mock_jwt_token_for_testing';
    }, []);
    return { getToken, isSignedIn };
};

const Header = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('Upload an image to get started.');
    const navigate = useNavigate();
    const { getToken, isSignedIn } = useAuth();

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setMessage(`File ready: ${file.name}`);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedFile) {
            document.getElementById('upload1').click();
            return;
        }

        if (!isSignedIn) {
            setMessage('Error: Please log in to process images.');
            return;
        }

        setIsLoading(true);
        setMessage('Authenticating and processing image...');

        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append('image', selectedFile);

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                let errorDetail = `Server returned status ${response.status}.`;
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorJson = await response.json();
                    errorDetail = errorJson.message || errorJson.error || errorDetail;
                }
                throw new Error(`Processing Failed: ${errorDetail}`);
            }

            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            const originalImageUrl = URL.createObjectURL(selectedFile);

            navigate('/result', {
                state: {
                    processedImageUrl: imageUrl,
                    originalFileName: selectedFile.name.replace(/\.[^/.]+$/, ""),
                    originalImageUrl: originalImageUrl
                }
            });

            setSelectedFile(null);
            setMessage('Upload an image to get started.');
        } catch (error) {
            console.error('Upload Error:', error);
            setMessage(`Error: ${error.message || 'Image processing failed.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const isButtonDisabled = isLoading || !isSignedIn;

    const buttonContent = isLoading
        ? (<span><Loader className="w-5 h-5 animate-spin inline mr-1" /> Processing...</span>)
        : !isSignedIn
            ? 'Please Log In'
            : selectedFile
                ? 'Process Image'
                : 'Upload your image';

    return (
        <form onSubmit={handleSubmit}>
            <div className='flex item-center justify-between max-sm:flex-col-reverse gap-y-10 px-4 mt-10 lg:px-44 sm:mt-20'>
                <div>
                    <h1 className='text-4xl xl:text-5xl 2xl:text-6xl font-bold text-neutral-700 leading-tight'>
                        Remove the <br className='max-md:hidden' /> <span className='bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent'>background</span> from <br className='max-md:hidden' />images for free.
                    </h1>
                    <p className='my-6 text-[15px] text-gray-500'>
                        Use the power of AI to instantly remove backgrounds. It's fast, free, and accurate.
                        <br className='max-sm:hidden' /> Upload your image below to see the magic.
                    </p>

                    <div>
                        <input
                            type="file"
                            name="image"
                            id="upload1"
                            hidden
                            accept="image/*"
                            onChange={handleFileChange}
                        />

                        <label
                            className={`inline-flex gap-3 px-8 py-3.5 rounded-full cursor-pointer m-auto transition-all duration-700
                                ${isButtonDisabled && !selectedFile
                                    ? 'bg-gray-400 opacity-70 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:scale-105'
                                }
                            `}
                            htmlFor="upload1"
                            onClick={selectedFile ? handleSubmit : undefined}
                        >
                            <UploadCloud width={20} className="text-white" />
                            <p className='text-white text-sm'>
                                {buttonContent}
                            </p>
                        </label>

                        <p className={`mt-4 text-sm font-medium ${message.includes('Error') ? 'text-red-500' : 'text-gray-600'}`}>
                            {selectedFile && !isLoading ? `File ready: ${selectedFile.name}` : message}
                        </p>
                    </div>
                </div>

                <div className='w-full max-w-md'>
                    <img src={assets.header_img} alt="Example illustration" />
                </div>
            </div>
        </form>
    );
};

export default Header;
