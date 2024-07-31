const checkForm = document.getElementById('checkForm');
const fileForm = document.getElementById('fileForm');
const resultDiv = document.getElementById('result');
const urlLoader = document.getElementById('urlLoader');
const fileLoader = document.getElementById('fileLoader');

const mitigationMeasures = [
    "Update your antivirus software and run a full system scan.",
    "Do not open any suspicious emails or links.",
    "Ensure your operating system and all software are up to date with the latest patches.",
    "Use strong, unique passwords for all accounts and change them regularly.",
    "Backup your important data regularly.",
    "Enable firewall protection on your network.",
    "Consider using a VPN to secure your internet connection.",
    "Be cautious when downloading files from unknown sources.",
    "Educate yourself and your family or colleagues about phishing attacks.",
    "Regularly monitor your accounts and systems for any unusual activity."
];

function getRandomMeasures() {
    const shuffled = mitigationMeasures.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3); // Return 3 random measures
}

checkForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    

    const urlInput = document.getElementById('urlInput').value.trim();
    if (!urlInput) {
        alert('Please enter a valid URL.');
        return;
    }

    urlLoader.style.display = 'block';
    resultDiv.innerHTML = '';
    
    const apiUrl = `http://localhost:3000/check-url?url=${encodeURIComponent(urlInput)}`;
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        displayResult(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        resultDiv.innerHTML = `<p>Failed to fetch data: ${error.message}. Please try again later.</p>`;
    } finally {
        resultDiv.classList.add("result-style");
        urlLoader.style.display = 'none';
    }
});

fileForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput').files[0];
    if (!fileInput) {
        alert('Please select a file.');
        return;
    }

    fileLoader.style.display = 'block';
    resultDiv.innerHTML = '';

    const formData = new FormData();
    formData.append('file', fileInput);

    try {
        const response = await fetch('http://localhost:3000/check-file', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Network response was not ok: ${errorText}`);
        }

        const data = await response.json();
        displayResult(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        resultDiv.innerHTML = `<p>Failed to fetch data: ${error.message}. Please try again later.</p>`;
    } finally {
        fileLoader.classList.add("result-style");
        fileLoader.style.display = 'none';
    }
});

function displayResult(data) {
    resultDiv.innerHTML = ''; 

    let resultHTML = '<h2>Scan Results:</h2>';
    resultHTML += '<ul>';
    if (data.data.attributes.last_analysis_stats.malicious > 0) {
        resultHTML += '<li><strong>Malicious:</strong> Yes</li>';
        resultHTML += '<li><strong>Precautionary Measures:</strong></li>';
        const measures = getRandomMeasures();
        resultHTML += '<ul>';
        measures.forEach(measure => {
            resultHTML += `<li>${measure}</li>`;
        });
        resultHTML += '</ul>';
    } else {
        resultHTML += '<li><strong>Malicious:</strong> No</li>';
    }
    resultHTML += '</ul>';

    resultDiv.innerHTML = resultHTML;
}
