function uploadImage() {
    const formData = new FormData(document.getElementById('uploadForm'));

    fetch('http://127.0.0.1:3000/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert('Image uploaded successfully!');
        document.getElementById('preview').innerHTML = `<img src="${data.filePath}" alt="Uploaded Image">`;
    })
    .catch(error => console.error('Error:', error));
}

function convertToTextFile() {
    const textContent = document.getElementById('textInput').value;

    fetch('http://127.0.0.1:3000/convertToTextFile', {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ textContent }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert('Text file saved successfully!');
        listFiles(); // Update the file list after saving the text file
    })
    .catch(error => console.error('Error:', error));
}

function listFiles() {
    fetch('http://127.0.0.1:3000/listFiles')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Files:', data);
            const fileListDiv = document.getElementById('filePreviews');
            fileListDiv.innerHTML = ''; // Clear previous content
            data.files.forEach(file => {
                const fileExtension = file.split('.').pop().toLowerCase();

                // Display text and image files
                if (['txt', 'jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                    const filePreview = document.createElement('div');

                    if (fileExtension === 'txt') {
                        // For text files, create an iframe to display the content
                        const textIframe = document.createElement('iframe');
                        textIframe.src = `http://127.0.0.1:3000/uploads/${file}`;
                        textIframe.style.width = '100%';
                        textIframe.style.height = '50px';
                        textIframe.style.backgroundColor = '#fff';
                        filePreview.appendChild(textIframe);
                    } else {
                        // For image files, create image element
                        const imagePreview = document.createElement('img');
                        imagePreview.src = `http://127.0.0.1:3000/uploads/${file}`;
                        imagePreview.alt = 'File Preview';
                        imagePreview.style.width = '100px';
                        filePreview.appendChild(imagePreview);
                    }

                    // Create delete button for each file
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.addEventListener('click', () => deleteFile(file));
                    filePreview.appendChild(deleteButton);

                    // Append file preview to list
                    fileListDiv.appendChild(filePreview);
                }
            });
        })
        .catch(error => console.error('Error:', error));
}

function startSpeechRecognition() {
    console.log('Starting speech recognition...');
    const recognition = new window.webkitSpeechRecognition() || new window.SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      document.getElementById('textInput').value += transcript;
    };

    recognition.onerror = function(event) {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = function() {
      console.log('Speech recognition ended.');
    };

    recognition.start();
}

// Function to delete a file
function deleteFile(fileName) {
    fetch('http://127.0.0.1:3000/deleteFile', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert('File deleted successfully!');
        // Refresh file list after deletion
        listFiles();
    })
    .catch(error => console.error('Error:', error));
}

document.addEventListener("DOMContentLoaded", function () {
    listFiles();
});
