import axios from 'axios';
import { useState, useContext } from 'react';
import { DataContext } from '../../Contexts/DataContext';

const Contact = ({ closeModal }) => {
    const { globalData } = useContext(DataContext);
    const [issueType, setIssueType] = useState('General');
    const [issueDescription, setIssueDescription] = useState('');
    const [files, setFiles] = useState([]);

    const sendDiscordMessage = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        let _workspace = globalData.USER.workspaces.find(workspace => workspace.workspace_hash === globalData.USER.default_workspace);

        // Base message content with Markdown formatting for bold and underline
        let content = `__**Workspace**__: ${_workspace.name}\n`;
        content += `__**Workspace Hash**__: ${_workspace.workspace_hash}\n`;
        content += `__**Email**__: ${globalData.USER.email}\n`;
        content += `__**Name**__: ${globalData.USER.first_name}\n\n`;
        content += `__**Description**__:\n${issueDescription}\n`;

        // Add Attachments heading only if files exist and issueType is bug
        if (issueType === 'bug' && files.length > 0) {
            content += `\n__**Attachments**__:\n`;
        }

        // Payload for Discord
        const payload = {
            content: content,
        };
        formData.append('payload_json', JSON.stringify(payload));

        // Append files only if the issueType is 'bug'
        if (issueType === 'bug') {
            files.forEach((file, index) => {
                formData.append(`file${index}`, file);
            });
        }

        let _url = '';

        switch (issueType) {
            case 'bug':
                _url = "https://discordapp.com/api/webhooks/1290745326277361766/d1v3t_35fEQLxI2SGunYjh9eP7g6ZUbKk5hJwYF0A2S745vPbw1Yeb7LbzQ0euIIWgDd";
                break;
            default:
                _url = "https://discordapp.com/api/webhooks/1290944540953415680/wj6d1ev2eSPifF3t7eDnGY4pbM6If61yGAtrsfq-mZolFA73MqVCdaNdmBg7UMpROaDu";
                break;
        }

        try {
            // Send the form data to the Discord webhook (replace with your actual webhook URL)
            const response = await axios.post(_url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            //console.log('Message sent successfully:', response.data);
            closeModal();  // If you want to close the modal on successful submission

        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <form onSubmit={sendDiscordMessage}>
            <div className="mb-3">
                <label className="form-label">Issue Type</label>
                <select
                    className="form-select"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                >
                    <option value="general">General</option>
                    <option value="bug">Bug Report</option>
                    <option value="billing">Billing</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label mt-2">Tell Us More About Your Issue</label>
                <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Enter Your Text Here"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                ></textarea>
            </div>

            {issueType === 'bug' && (
                <div className="mb-3">
                    <label className="form-label">Upload Images Or Files To Help Us Identify The Issue</label>
                    <input
                        className="form-control"
                        type="file"
                        multiple
                        onChange={(e) => setFiles(Array.from(e.target.files))}
                    />
                </div>
            )}

            <button type="submit" className="btn btn-primary float-end">Submit</button>
        </form>
    );
};

export default Contact;
