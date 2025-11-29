// The Cat API Explorer - Activity 01 (TEACHER REFERENCE - 100% COMPLETE)
// This is the complete implementation with all features working
// Students should NOT have access to this version

// API Base URL
const CAT_API_BASE = 'https://api.thecatapi.com/v1';

// DOM Elements
const randomCatBtn = document.getElementById('randomCatBtn');
const breedListBtn = document.getElementById('breedListBtn');
const randomBreedBtn = document.getElementById('randomBreedBtn');
const showJsonBtn = document.getElementById('showJsonBtn');
const searchBreedBtn = document.getElementById('searchBreedBtn');
const breedInput = document.getElementById('breedInput');
const resultDiv = document.getElementById('result');
const loadingDiv = document.getElementById('loading');
const fallbackDiv = document.getElementById('fallback');

// Fallback data for offline testing
const fallbackData = {
    breeds: ['siamese', 'persian', 'maine coon', 'british shorthair', 'abyssinian', 'ragdoll'],
    sampleImage: 'https://via.placeholder.com/400x300/667eea/white?text=Sample+Cat+Image',
    message: 'This is fallback data for when the API is unavailable'
};

// Event Listeners
randomCatBtn.addEventListener('click', getRandomCat);
breedListBtn.addEventListener('click', getAllBreeds);
randomBreedBtn.addEventListener('click', getRandomBreed);
showJsonBtn.addEventListener('click', showRawJson);
searchBreedBtn.addEventListener('click', searchBreed);
breedInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchBreed();
    }
});

// Utility Functions
function showLoading() {
    resultDiv.classList.add('hidden');
    fallbackDiv.classList.add('hidden');
    loadingDiv.classList.remove('hidden');
}

function hideLoading() {
    loadingDiv.classList.add('hidden');
    resultDiv.classList.remove('hidden');
}

function showError(message) {
    hideLoading();

    // Clear existing content
    resultDiv.textContent = '';

    // Create error container
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';

    const title = document.createElement('h3');
    title.textContent = '❌ Oops! Something went wrong';

    const messageP = document.createElement('p');
    messageP.textContent = message;

    const helpP = document.createElement('p');
    helpP.textContent = "Don't worry - this is part of learning API integration!";

    errorDiv.appendChild(title);
    errorDiv.appendChild(messageP);
    errorDiv.appendChild(helpP);
    resultDiv.appendChild(errorDiv);
}

function showFallback() {
    loadingDiv.classList.add('hidden');
    resultDiv.classList.add('hidden');
    fallbackDiv.classList.remove('hidden');
}

// WORKING EXAMPLE: Get a random cat image
async function getRandomCat() {
    showLoading();

    try {
        // Make a fetch request to the random cat image endpoint
        // Note: The Cat API returns an array, not an object with status
        const response = await fetch(`${CAT_API_BASE}/images/search`);

        // Convert the response to JSON
        const data = await response.json();

        // The Cat API returns an array with one object
        if (data && data.length > 0) {
            const catData = data[0];

            // Check if breed information is available
            const breedName = catData.breeds && catData.breeds.length > 0
                ? catData.breeds[0].name
                : 'Random Cat';

            // Display the cat image
            displayCatImage(catData.url, breedName);

            // TODO (EXTENSION): Add console logging to see the data structure
            console.log('API Response:', data);
        } else {
            showError('API returned empty data');
        }

    } catch (error) {
        console.error('Error fetching random cat:', error);
        showError('Could not fetch random cat. Check your internet connection.');
    }
}

// WORKING EXAMPLE: Get all cat breeds
async function getAllBreeds() {
    showLoading();

    try {
        // Make a fetch request to get all breeds
        const response = await fetch(`${CAT_API_BASE}/breeds`);

        // Convert the response to JSON
        const data = await response.json();

        // The Cat API returns an array of breed objects
        if (data && data.length > 0) {
            // Display the breeds with additional info
            displayBreedList(data);

            // TODO (EXTENSION): Show breed temperament and origin
            console.log('Breed count:', data.length);
            console.log('Sample breed data:', data[0]);
        } else {
            throw new Error('API returned empty breed list');
        }

    } catch (error) {
        console.error('Error fetching breeds:', error);
        showError('Could not fetch breed list. Using fallback data instead.');
        displayBreedList(fallbackData.breeds.map(name => ({ name })));
    }
}

// COMPLETE IMPLEMENTATION: Get a random breed with image
async function getRandomBreed() {
    showLoading();

    try {
        // First, get a list of all breeds
        const breedsResponse = await fetch(`${CAT_API_BASE}/breeds`);
        const breedsData = await breedsResponse.json();

        if (!breedsData || breedsData.length === 0) {
            throw new Error('Failed to fetch breeds');
        }

        // Pick a random breed
        const randomIndex = Math.floor(Math.random() * breedsData.length);
        const randomBreed = breedsData[randomIndex];

        // Get an image of that specific breed using breed ID
        const imageResponse = await fetch(`${CAT_API_BASE}/images/search?breed_ids=${randomBreed.id}`);
        const imageData = await imageResponse.json();

        if (imageData && imageData.length > 0) {
            // Display the result with breed name
            displayCatImage(imageData[0].url, randomBreed.name, randomBreed);

            // Log for debugging
            console.log('Random breed selected:', randomBreed.name);
            console.log('Image URL:', imageData[0].url);
        } else {
            throw new Error('Failed to fetch breed image');
        }

    } catch (error) {
        console.error('Error fetching random breed:', error);
        showError('Could not fetch random breed. Try again!');
    }
}

// COMPLETE IMPLEMENTATION: Search for a specific breed with history
async function searchBreed() {
    const breedName = breedInput.value.trim().toLowerCase();

    if (!breedName) {
        showError('Please enter a breed name to search for!');
        return;
    }

    showLoading();

    try {
        // First, get all breeds to find the matching breed ID
        const breedsResponse = await fetch(`${CAT_API_BASE}/breeds`);
        const breedsData = await breedsResponse.json();

        // Find the breed that matches the search term
        const matchedBreed = breedsData.find(breed =>
            breed.name.toLowerCase().includes(breedName) ||
            breedName.includes(breed.name.toLowerCase())
        );

        if (!matchedBreed) {
            // Get list of popular breeds for suggestions
            const suggestions = breedsData.slice(0, 5).map(b => b.name).join(', ');
            showError(`Breed "${breedName}" not found. Try: ${suggestions}`);
            return;
        }

        // Fetch images for the matched breed
        const imageResponse = await fetch(`${CAT_API_BASE}/images/search?breed_ids=${matchedBreed.id}&limit=1`);
        const imageData = await imageResponse.json();

        if (imageData && imageData.length > 0) {
            // If successful, display the breed image with info
            displayCatImage(imageData[0].url, matchedBreed.name, matchedBreed);

            // Save to search history in localStorage
            let searchHistory = JSON.parse(localStorage.getItem('breedSearchHistory') || '[]');
            if (!searchHistory.includes(matchedBreed.name)) {
                searchHistory.unshift(matchedBreed.name);
                searchHistory = searchHistory.slice(0, 10); // Keep last 10 searches
                localStorage.setItem('breedSearchHistory', JSON.stringify(searchHistory));
            }

            // Clear the input field after successful search
            breedInput.value = '';

            // Log successful search
            console.log('Search successful for:', matchedBreed.name);
            console.log('Search history:', searchHistory);
        } else {
            showError(`No images found for breed "${matchedBreed.name}".`);
        }

    } catch (error) {
        console.error('Error searching breed:', error);
        showError(`Could not find breed "${breedName}". Try breeds like: Siamese, Persian, Maine Coon`);
    }
}

// COMPLETE IMPLEMENTATION: Show raw JSON response
async function showRawJson() {
    showLoading();

    try {
        // Make a fetch request to the random cat endpoint
        const response = await fetch(`${CAT_API_BASE}/images/search`);

        // Convert response to JSON
        const data = await response.json();

        // Display the raw JSON
        displayJsonData(data);

        // Also log to console for debugging
        console.log('Raw API Response:', data);
        console.log('Response headers:', Array.from(response.headers.entries()));

    } catch (error) {
        console.error('Error fetching JSON:', error);
        showError('Could not fetch JSON data.');
    }
}

// Helper Functions (Already Complete - Use These!)

function displayCatImage(imageUrl, breedName = 'Random Cat', breedInfo = null) {
    hideLoading();

    // Clear existing content
    resultDiv.textContent = '';

    // Create main card container
    const card = document.createElement('div');
    card.className = 'dog-card';

    // Create title
    const title = document.createElement('h3');
    title.textContent = `🐱 ${breedName}`;
    card.appendChild(title);

    // Create image
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = breedName;
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
    img.onload = function() { this.style.opacity = '1'; };
    card.appendChild(img);

    // Add breed details if available
    if (breedInfo) {
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'breed-details';

        if (breedInfo.temperament) {
            const tempP = document.createElement('p');
            const tempStrong = document.createElement('strong');
            tempStrong.textContent = 'Temperament: ';
            tempP.appendChild(tempStrong);
            tempP.appendChild(document.createTextNode(breedInfo.temperament));
            detailsDiv.appendChild(tempP);
        }

        if (breedInfo.origin) {
            const originP = document.createElement('p');
            const originStrong = document.createElement('strong');
            originStrong.textContent = 'Origin: ';
            originP.appendChild(originStrong);
            originP.appendChild(document.createTextNode(breedInfo.origin));
            detailsDiv.appendChild(originP);
        }

        if (breedInfo.life_span) {
            const lifeP = document.createElement('p');
            const lifeStrong = document.createElement('strong');
            lifeStrong.textContent = 'Life Span: ';
            lifeP.appendChild(lifeStrong);
            lifeP.appendChild(document.createTextNode(`${breedInfo.life_span} years`));
            detailsDiv.appendChild(lifeP);
        }

        if (breedInfo.description) {
            const descP = document.createElement('p');
            const descStrong = document.createElement('strong');
            descStrong.textContent = 'About: ';
            descP.appendChild(descStrong);
            descP.appendChild(document.createTextNode(breedInfo.description));
            detailsDiv.appendChild(descP);
        }

        card.appendChild(detailsDiv);
    }

    // Create info section
    const infoDiv = document.createElement('div');
    infoDiv.className = 'dog-info';

    const urlP = document.createElement('p');
    const urlStrong = document.createElement('strong');
    urlStrong.textContent = 'Image URL: ';
    urlP.appendChild(urlStrong);
    urlP.appendChild(document.createTextNode(imageUrl));
    infoDiv.appendChild(urlP);

    const sourceP = document.createElement('p');
    const sourceStrong = document.createElement('strong');
    sourceStrong.textContent = 'Source: ';
    sourceP.appendChild(sourceStrong);
    sourceP.appendChild(document.createTextNode('The Cat API'));
    infoDiv.appendChild(sourceP);

    const reloadBtn = document.createElement('button');
    reloadBtn.className = 'api-button primary';
    reloadBtn.style.marginTop = '1rem';
    reloadBtn.textContent = '🔄 Get Another Cat';
    reloadBtn.onclick = () => location.reload();
    infoDiv.appendChild(reloadBtn);

    card.appendChild(infoDiv);
    resultDiv.appendChild(card);
}

function displayBreedList(breeds) {
    hideLoading();

    // Clear existing content
    resultDiv.textContent = '';

    // Create breed list container
    const listDiv = document.createElement('div');
    listDiv.className = 'breed-list';

    // Create title
    const title = document.createElement('h3');
    title.textContent = `🐱 All Cat Breeds (${breeds.length} total)`;
    listDiv.appendChild(title);

    // Create description
    const desc = document.createElement('p');
    desc.textContent = 'Here are all the available breeds from The Cat API:';
    listDiv.appendChild(desc);

    // Create breeds container
    const breedsContainer = document.createElement('div');
    breedsContainer.style.marginTop = '1rem';

    // Add breed items
    breeds.forEach(breed => {
        const name = typeof breed === 'string' ? breed : breed.name;
        const origin = typeof breed === 'object' && breed.origin ? breed.origin : '';
        const temperament = typeof breed === 'object' && breed.temperament ? breed.temperament.split(',')[0] : '';

        const breedItem = document.createElement('div');
        breedItem.className = 'breed-item';

        const nameStrong = document.createElement('strong');
        nameStrong.textContent = name;
        breedItem.appendChild(nameStrong);

        if (origin) {
            breedItem.appendChild(document.createElement('br'));
            const originSmall = document.createElement('small');
            originSmall.textContent = `Origin: ${origin}`;
            breedItem.appendChild(originSmall);
        }

        if (temperament) {
            breedItem.appendChild(document.createElement('br'));
            const tempSmall = document.createElement('small');
            tempSmall.textContent = temperament;
            breedItem.appendChild(tempSmall);
        }

        breedsContainer.appendChild(breedItem);
    });

    listDiv.appendChild(breedsContainer);
    resultDiv.appendChild(listDiv);
}

function displayJsonData(jsonData) {
    hideLoading();

    // Clear existing content
    resultDiv.textContent = '';

    // Create JSON display container
    const jsonDiv = document.createElement('div');
    jsonDiv.className = 'json-display';

    // Create title
    const title = document.createElement('h3');
    title.textContent = '📄 Raw JSON Response';
    jsonDiv.appendChild(title);

    // Create description
    const desc = document.createElement('p');
    desc.textContent = 'This is what the API actually returns:';
    jsonDiv.appendChild(desc);

    // Create pre element for JSON
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(jsonData, null, 2);
    jsonDiv.appendChild(pre);

    resultDiv.appendChild(jsonDiv);
}

// BONUS FEATURES IMPLEMENTED

// Feature 1: Save favorite breeds
const favorites = JSON.parse(localStorage.getItem('favoriteCats') || '[]');

function saveFavorite(imageUrl, breed) {
    const favorite = { imageUrl, breed, timestamp: Date.now() };
    favorites.push(favorite);
    localStorage.setItem('favoriteCats', JSON.stringify(favorites));
    console.log('Saved to favorites:', favorite);
}

// Feature 2: Download image functionality
function downloadImage(imageUrl, breed) {
    fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${breed.replace(/\s+/g, '-')}-cat.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(error => console.error('Download failed:', error));
}

// Feature 3: Get search history
function getSearchHistory() {
    return JSON.parse(localStorage.getItem('breedSearchHistory') || '[]');
}

// Feature 4: Clear all data
function clearAllData() {
    localStorage.clear();
    console.log('All local data cleared');
}

/*
STUDENT INSTRUCTIONS:

1. START HERE: Complete TODO 1 (getRandomCat) first
   - This is the easiest function to get you started
   - Use The Cat API documentation: https://thecatapi.com/

2. TESTING: After each TODO, test your function by clicking the buttons

3. DEBUGGING TIPS:
   - Open browser Developer Tools (F12)
   - Check the Console tab for error messages
   - Use console.log() to see what data you're getting from the API

4. API ENDPOINTS TO USE:
   - Random cat image: https://api.thecatapi.com/v1/images/search
   - All breeds: https://api.thecatapi.com/v1/breeds
   - Specific breed: https://api.thecatapi.com/v1/images/search?breed_ids={breed-id}

5. IMPORTANT: The Cat API returns arrays, not objects with status!
   - Random image returns: [{url: "...", id: "...", breeds: [...]}]
   - Breeds list returns: [{id: "abys", name: "Abyssinian", ...}, ...]

6. SUCCESS CRITERIA:
   - All 5 buttons work correctly
   - Loading states show while fetching
   - Error handling works when you test with invalid breeds
   - JSON display shows formatted data

7. HAVE FUN! The Cat API is free for basic usage and provides rich breed information,
   making it perfect for learning API integration basics.
*/
