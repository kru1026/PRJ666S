import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';

const FileList = () => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);

    const viewingUserId = localStorage.getItem('viewingUserId');
    const storedUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getFiles`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const fileList = await response.json();
                const userFiles = fileList.filter(file => file.name.startsWith(viewingUserId));
                setFiles(userFiles);
            } catch (err) {
                console.error('Error fetching files:', err);
                setError('Unable to fetch files');
            }
        };

        fetchFiles();
    }, []);

    const deleteFile = async (fileName) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deleteFile?fileName=${fileName}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                setFiles(files.filter(file => file.name !== fileName));
                alert("File deleted successfully");
            } else {
                console.error("Failed to delete file");
                alert("There is an error deleting the file");
            }
        } catch (error) {
            console.error("An error occurred:", error);
            alert("There is an error deleting the file");
        }
    };

    return (
        <Container>
            <h2 className="text-center mb-4" style={{ fontWeight: 'bold' }}>Tutor's Certificates</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <Row>
                {files.length > 0 ? (
                    files.map((file) => (
                        <Col key={file.storedFileName} xs={12} md={6} className="mb-4">
                            <Card className="shadow-sm h-100 border-0" style={{ transition: 'transform 0.3s' }}>
                                <Card.Body>
                                    <Card.Title className="text-truncate mb-3" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                        {file.name}
                                    </Card.Title>
                                    {file.name.endsWith('.pdf') &&
                                        <Button
                                            href={`${process.env.NEXT_PUBLIC_API_URL}/OpenPDF/${file.name}`}
                                            variant="primary"
                                            size="sm"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ marginRight: '10px' }}
                                        >
                                            Open File
                                        </Button>}

                                        {file.name.endsWith('.docx') && (
                                            <Button
                                                href={`${process.env.NEXT_PUBLIC_API_URL}/OpenWord/${file.name}`}
                                                variant="primary"
                                                size="sm"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ marginRight: '10px' }}
                                            >
                                            Open File
                                            </Button>
                                        )}




                                        {(file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.gif')) &&
                                        <Button
                                            href={`${process.env.NEXT_PUBLIC_API_URL}/OpenImg/${file.name}`}
                                            variant="primary"
                                            size="sm"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ marginRight: '10px' }}
                                        >
                                            Open File
                                        </Button>}
                                    
                                        <Button
                                            href={`${process.env.NEXT_PUBLIC_API_URL}/download/${file.name}`}
                                            variant="primary"
                                            size="sm"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ marginRight: '10px' }}
                                        >
                                            Download
                                        </Button>
                                        {storedUser._id === viewingUserId && (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => deleteFile(file.name)}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col>
                        <p className="text-center">No certificates available for this tutor.</p>
                    </Col>
                )}
            </Row>
        </Container>
    );
};

export default FileList;
