import { useState, useRef, forwardRef, useImperativeHandle, useCallback, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEllipsisVertical,
    faFileCsv,
    faFileLines,
    faFilePdf,
    faFileWord,
    faFileExcel,
    faFilePowerpoint,
    faFileArchive,
    faFileCode,
    faFileImage,
    faFileVideo,
    faFileAudio,
    faFile
} from '@fortawesome/free-solid-svg-icons';
import { DataContext } from '../Contexts/DataContext';
import { useUI } from '../Contexts/UIContext';
import axios from 'axios';

export default forwardRef(function FieldsAttachments({ createTask = false, taskId }, ref) {
    //attachment/att41c7133

    const { globalData } = useContext(DataContext);

    const { openMediaModal } = useUI();

    const attachmentAreaRef = useRef(null);

    const fileInputRef = useRef(null); // Reference to the hidden file input element

    //  These Are Attachments To Upload During The Task Creation
    const [attachmentsToUpload, setAttachmentsToUpload] = useState([]);

    //  Attachments Coming In From The Task Edit View
    const [attachments, setAttachments] = useState([]);

    useEffect(() => {

        const fetchAttachments = async () => {

            try {

                let _url = `https://${globalData.api_url}/task/${taskId}/attachments`;

                //console.log('urls', _url);

                const response = await axios.get(_url, { withCredentials: true });

                if (response.status == 200) {

                    setAttachments(
                        response.data.map(file => {
                            return {
                                name: file.filename,
                                type: file.type,
                                hash: file.attachment_hash,
                                size: file.size,
                                thumb: file.thumb,
                                date_created: new Date(file.date_created).toLocaleString("en-US", { month: "2-digit", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })
                            }
                        })
                    );
                }

            } catch (error) {

                console.error(error);

            }
        }

        if (taskId) {
            fetchAttachments();
        }

    }, []);

    //  Callback Functions So We Can Collect The Attachments To Process During Task View
    const getItems = useCallback(() => {
        return attachmentsToUpload;
    }, [attachmentsToUpload]);

    useImperativeHandle(ref, () => {
        return {
            getItems,
        };
    });

    const uploadFiles = async (files) => {

        const formData = new FormData();

        let _attachments = [];

        // Append each New File to the formData There Could Be Multiple Here
        files.forEach(file => {

            formData.append('attachments[]', file);

            //  Display Temporary Attachments
            _attachments.push({
                type: 'temp'
            });

        });

        //  Create Temporary Icons For Each Attachments
        let _merged = [...attachments, ..._attachments];

        setAttachments(_merged);

        try {

            // Send The Form Data For Upload
            const response = await axios.post(`https://${globalData.api_url}/task/${taskId}/attachment`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true,
            });

            if (response.status == 200) {

                let _files = response.data;

                //  First Removed The Temp Items On The List
                let _count = _files.length;

                // Counter to keep track of removed 'temp' items
                let removedCount = 0;

                let _attachmentsCopy = _merged.filter(item => {

                    // If the item is of type 'temp' and we haven't removed enough items yet
                    if (item.type === 'temp' && removedCount < _count) {
                        removedCount++;
                        return false; // Remove this item
                    }

                    return true; // Keep this item

                });

                //  Then Start Populating The Attachments Array With The Uploaded Ones
                let _uploaded = _files.map(file => {
                    return {
                        name: file.filename,
                        type: file.type,
                        hash: file.file_hash,
                        size: file.size,
                        date_created: new Date().toLocaleString("en-US", { month: "2-digit", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })
                    }
                });

                //  Finalize And Display The Uploaded Attachments When Ready
                setAttachments([..._attachmentsCopy, ..._uploaded]);

            }



        } catch (error) {
            //console.log(error);
        }

    }

    const deleteAttachment = async (itemToDelete) => {

        if (createTask) {

            const updatedAttachments = attachmentsToUpload.filter((item) => item !== itemToDelete);
            setAttachmentsToUpload(updatedAttachments);

        } else {

            try {

                const _url = `https://${globalData.api_url}/attachment/${itemToDelete.hash}`;

                const response = await axios.delete(_url, { withCredentials: true });

                //console.log("Response", response);

                //  Remove The Attachment From The List
                if (response.status == 200) {

                    const _deleted = [...attachments].filter(item => item.hash !== itemToDelete.hash);
                    //console.log("deleted", _deleted);
                    setAttachments(_deleted);

                }

            } catch (error) {
                console.error(error);
            }
        }
    };

    function copyURL(e, item) {

        e.preventDefault();
        const urlToCopy = `https://${globalData.api_url}/attachment/${item.hash}`;
        //console.log(urlToCopy);

        const tempInput = document.createElement('input');
        tempInput.value = urlToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        //console.log("Copied to clipboard (fallback)!");
    }



    const attachmentCardTemplate = (item) => {

        const type = item.type ?? null;

        if (type != 'temp') {

            const fileName = item.name;
            const type = item.type
            const extensionIndex = fileName.lastIndexOf('.');
            const extension = fileName.substring(extensionIndex + 1);
            let truncatedName = fileName.substring(0, extensionIndex);

            // Truncate the filename if it exceeds a certain length
            const maxLength = 15;
            if (truncatedName.length > maxLength) {
                truncatedName = truncatedName.substring(0, maxLength) + '...';
            }

            return (

                <div className="card attachmentItem" key={item.hash} style={{ position: 'relative' }}>

                    <button type="button" className="attachments-close-btn btn btn-danger" onClick={() => deleteAttachment(item)}>
                        ×
                    </button>

                    <div className="dropdown">
                        <button
                            type="button"
                            className="attachments-menu-btn btn btn-outline-secondary btn-sm border-0 fs-4"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{backgroundColor: 'transparent' }}
                        >
                            <FontAwesomeIcon icon={faEllipsisVertical} />
                        </button>

                        <ul className="dropdown-menu">
                            <li>
                                <a
                                    className="dropdown-item"
                                    href={`https://${globalData.api_url}/attachment/${item.hash}`}
                                    onClick={(e) => copyURL(e, item)}
                                >
                                    Copy Link
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href={`https://${globalData.api_url}/attachment/${item.hash}`}>
                                    Download
                                </a>
                            </li>
                            <li><a className="dropdown-item" href="#" onClick={() => deleteAttachment(item)}>Delete</a></li>
                        </ul>
                    </div>

                    <div style={{ maxWidth: 140, maxHeight: 140 }}>
                        <div className="bg-secondary d-flex justify-content-center align-items-center fs-1" style={{ width: 134, height: 140 }}>
                            {
                                getFileIcon(type, item)
                            }
                        </div>
                    </div>

                    <div className="card-body">

                        <div className="row" style={{ marginBottom: '5px' }}>
                            <div className="filename" >{truncatedName}.{extension}</div>
                        </div>
                        <div className="row">
                            <small className="card-text">Uploaded:<br />{item.date_created}</small>
                        </div>

                    </div>
                </div>
            );

        } else {

            return (
                <div className="card attachmentItem placeholder-glow" style={{ position: 'relative' }}>
                    <div style={{ maxWidth: 140, maxHeight: 140 }}>
                        <div className="placeholder" style={{ width: 134, height: 140 }}></div>
                    </div>
                    <div className="card-body">
                        <div className="row placeholder-glow" style={{ marginBottom: '5px' }}>
                            <span className="placeholder col-12"></span>
                        </div>
                        <div className="row placeholder-glow" style={{ marginBottom: '5px' }}>
                            <span className="placeholder col-12"></span>
                        </div>
                    </div>
                </div>
            );

        }

    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        attachmentAreaRef.current.classList.add('attachment-highlight');
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        attachmentAreaRef.current.classList.remove('attachment-highlight');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        attachmentAreaRef.current.classList.remove('attachment-highlight');

        const files = e.dataTransfer.files;
        const fileList = Array.from(files);

        if (createTask) {
            setAttachmentsToUpload((prevAttachments) => [...prevAttachments, ...fileList]);
        } else {
            uploadFiles(fileList);
        }

    };

    const handleUploadButtonClick = () => {
        // Programmatically trigger the hidden file input
        fileInputRef.current.click();
    };

    const handleFileInputChange = (e) => {

        const files = e.target.files;
        const fileList = Array.from(files);

        if (createTask) {
            setAttachmentsToUpload((prevAttachments) => [...prevAttachments, ...fileList]);
        } else {
            uploadFiles(fileList);
        }

    };


    const getFileIcon = (type, item) => {

        const mimeType = type.split('/')[0];
        const mimeSubtype = type.split('/')[1];

        switch (mimeType) {

            case 'text':

                if (mimeSubtype === 'csv') {
                    return <FontAwesomeIcon icon={faFileCsv} />;
                }

                return (

                    <button
                        type="button"
                        onClick={() => {
                            openMediaModal({
                                name: item.name,
                                mediaUrl: `https://${globalData.api_url}/attachment/${item.hash}`,
                                type: 'text'
                            });
                        }}
                        style={{ background: 'transparent', border: 'none', padding: 0, width: '100%', height: '100%' }}
                    >
                        <FontAwesomeIcon icon={faFileLines} />
                    </button>

                );


            case 'application':

                if (type.includes('pdf')) {

                    return (
                        <button
                            type="button"
                            onClick={() => {
                                openMediaModal({
                                    name: item.name,
                                    mediaUrl: `https://${globalData.api_url}/attachment/${item.hash}`,
                                    type: 'pdf'
                                });
                            }}
                            style={{ background: 'transparent', border: 'none', padding: 0, width: '100%', height: '100%' }}
                        >
                            <FontAwesomeIcon icon={faFilePdf} />
                        </button>

                    );

                } else if (type.includes('msword') || type.includes('wordprocessingml.document')) {
                    return <FontAwesomeIcon icon={faFileWord} />;
                } else if (type.includes('vnd.ms-excel') || type.includes('spreadsheetml.sheet')) {
                    return <FontAwesomeIcon icon={faFileExcel} />;
                } else if (type.includes('vnd.ms-powerpoint') || type.includes('presentationml.presentation')) {
                    return <FontAwesomeIcon icon={faFilePowerpoint} />;
                } else if (type.includes('zip') || type.includes('x-7z-compressed') || type.includes('x-rar-compressed') || type.includes('x-tar')) {
                    return <FontAwesomeIcon icon={faFileArchive} />;
                } else if (type.includes('json') || type.includes('xml') || type.includes('javascript')) {
                    return <FontAwesomeIcon icon={faFileCode} />;
                }
                break;

            case 'image':
            case 'video':
                
                if( !createTask ) {

                    return( 
                        <button
                            type="button"
                            onClick={() => { openMediaModal({ name: item.name, mediaUrl: `https://${globalData.api_url}/attachment/${item.hash}`, type: mimeType }) }}
                            style={{ background: 'transparent', border: 'none', padding: 0 }}
                        >
                            {
                                item.thumb ? ( <img src={`https://${globalData.api_url}${item.thumb}`} alt="Preview" style={{ display: 'block' }} /> )
                                :
                                ( mimeType == 'video' ? <FontAwesomeIcon icon={faFileVideo} /> : <FontAwesomeIcon icon={faFileImage} /> )
                            }
                           
                        </button>
                    )

                } else {

                    return( mimeType == 'video' ? <FontAwesomeIcon icon={faFileVideo} /> : <FontAwesomeIcon icon={faFileImage} /> );                    
                
                }

            case 'audio':
                return <FontAwesomeIcon icon={faFileAudio} />;
            // Add more cases as needed
            default:
                return <FontAwesomeIcon icon={faFile} />; // Default icon for unknown types
        }
    };

    const handleAttachmentBodyArea = () => {

        if (
            (!createTask && attachments.length === 0)
            ||
            (createTask && attachmentsToUpload.length === 0)
        ) {
            return <span>Drag & Drop files Below</span>;
        }


        if (createTask) {

            return attachmentsToUpload.map((item) => attachmentCardTemplate(item));

        } else {

            return attachments.map((item) => attachmentCardTemplate(item));
        }

    };


    return (
        <div className="card">
            <div className="card-header">
                Attachments
                <button type="button" className="btn btn-primary btn-sm float-end" onClick={handleUploadButtonClick}>
                    Upload
                </button>
                {/* Hidden file input element */}
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileInputChange}
                    multiple
                />
            </div>

            <div
                className="card-body attachmentArea position-relative"
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                ref={attachmentAreaRef}
            >
                <div className="attachment-overlay"></div>
                <div className="row">{handleAttachmentBodyArea()}</div>
            </div>
        </div>
    );
});
