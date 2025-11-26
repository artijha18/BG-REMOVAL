import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { assets } from '../assets/assets';

const API_ENDPOINT = 'http://localhost:3000/api/remove-background';

const Upload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('Upload an image to get started.');
    const navigate = useNavigate();
    const { getToken, isSignedIn } = useAuth();

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setMessage(`File selected: ${file.name}`);
        }
    };

    const handleButtonClick = () => {
        if (!isLoading) {
            document.getElementById('upload2').click();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!isSignedIn) {
            setMessage('Error: Please log in to process images.');
            return;
        }

        if (!selectedFile) {
            setMessage('Error: Please select an image file first.');
            return;
        }

        setIsLoading(true);
        setMessage('Authenticating and processing image...');

        try {
            const token = await getToken({ template: 'backend-api' });

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
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }

            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);

            navigate('/result', {
                state: {
                    processedImageUrl: imageUrl,
                    originalFileName: selectedFile.name.replace(/\.[^/.]+$/, "")
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

    return (
        <div className='pb-16'>
            <h1 className='text-center text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent py-6 md:py-16'>
                See the magic. Try now
            </h1>

            <div className='text-center mb-24'>
                <input 
                    type="file"
                    id="upload2"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                />

                <button
                    onClick={selectedFile ? handleSubmit : handleButtonClick}
                    disabled={isLoading || (!selectedFile && !isSignedIn)}
                    className={`inline-flex gap-3 px-8 py-3.5 rounded-full cursor-pointer m-auto transition-all duration-700
                        ${(isLoading || (!selectedFile && !isSignedIn))
                            ? 'bg-gray-400 opacity-70'
                            : 'bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:scale-105'
                        }
                    `}
                >
                    <img width={20} src={assets.upload_btn_icon} alt="" />
                    <p className='text-white text-sm'>
                        {isLoading 
                            ? 'Processing...'
                            : !isSignedIn
                                ? 'Please Log In'
                                : selectedFile 
                                    ? 'Process Image'
                                    : 'Upload your image'
                        }
                    </p>
                </button>

                <p className={`mt-4 text-sm font-medium ${message.includes('Error') ? 'text-red-500' : 'text-gray-600'}`}>
                    {message}
                </p>

                {selectedFile && !isLoading && !message.includes('Processing') && (
                    <div className='mt-2'>
                        <span className='text-xs text-gray-500 mr-2'>{selectedFile.name}</span>
                        <button 
                            onClick={() => {
                                setSelectedFile(null);
                                setMessage('Upload an image to get started.');
                            }} 
                            className='text-xs text-red-500 hover:text-red-700'
                        >
                            (Clear)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Upload;
