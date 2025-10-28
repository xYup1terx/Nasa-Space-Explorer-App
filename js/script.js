// Use this URL to fetch NASA APOD JSON data.
const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// Get references to DOM elements
const getImageBtn = document.getElementById('getImageBtn');
const gallery = document.getElementById('gallery');
// Modal refs (elements exist in index.html)
const apodModal = document.getElementById('apodModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

const funFacts = [
  "The Apollo 11 mission in 1969 was the first manned mission to land on the Moon.",
  "Mars has the largest volcano in the solar system, Olympus Mons, which is about 13.6 miles (22 km) high.",
  "A day on Venus is longer than a year on Venus due to its slow rotation and orbit around the Sun.",
  "The Hubble Space Telescope has provided some of the most detailed images of distant galaxies and nebulae since its launch in 1990.",
  "Saturn's rings are made up of countless small particles, ranging from micrometers to meters in size, primarily composed of ice and rock.",
  "The Sun is a star, and it's the center of our solar system.",
  "The Milky Way galaxy is a barred spiral galaxy with a diameter of about 100,000 light-years.",
  "The universe is estimated to be about 13.8 billion years old.",
  "There are more stars in the universe than grains of sand on all the beaches on Earth.",
  "Black holes are regions of space where gravity is so strong that nothing, not even light, can escape from them.",
  "Neutron stars are incredibly dense remnants of supernova explosions, with a mass greater than the Sun but a diameter of only about 20 kilometers.",
  "The International Space Station (ISS) orbits the Earth approximately every 90 minutes, traveling at a speed of about 28,000 kilometers per hour (17,500 miles per hour).",
  "Comets are made up of ice, dust, and rocky material, and they often have spectacular tails that point away from the Sun due to solar wind.",
  "The largest planet in our solar system is Jupiter, which is more than twice as massive as all the other planets combined.",
  "The first human-made object to reach space was the German V-2 rocket in 1944.",
  "The Great Red Spot on Jupiter is a giant storm that has been raging for at least 400 years.",
  "Pluto, once considered the ninth planet in our solar system, was reclassified as a dwarf planet in 2006.",
  "The speed of light is approximately 299,792 kilometers per second (186,282 miles per second) in a vacuum.",
];

function showRandomFunFact() {

	const fact = funFacts[Math.floor(Math.random() * funFacts.length)];

  let factEl = document.getElementById('funFact');
  if (!factEl) {
    factEl = document.createElement('div');
    factEl.id = 'funFact';
    factEl.className = 'funFact';

    if(gallery && gallery.parentNode) {
      gallery.parentNode.insertBefore(factEl, gallery);
    } else {
      document.body.insertBefore(factEl, document.body.firstChild);
    }
  }
	factEl.innerHTML = `<p>🔭 <strong>Fun Space Fact:</strong> ${fact}</p>`;

	// Trigger a one-time pulse animation when the element appears.
	// Remove the class first in case it was present from a previous load.
	factEl.classList.remove('pulse');
	// Force reflow to restart animation reliably
	void factEl.offsetWidth;
	factEl.classList.add('pulse');
	// Clean up after the animation ends so repeated calls can re-trigger it
	const onAnimEnd = () => {
		factEl.classList.remove('pulse');
		factEl.removeEventListener('animationend', onAnimEnd);
	};
	factEl.addEventListener('animationend', onAnimEnd);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showRandomFunFact);
} else {
  showRandomFunFact();
}

// Helper: create a gallery card for one APOD item
function createGalleryItem(item) {
	const card = document.createElement('article');
	card.className = 'gallery-item';

	// Make the card clickable to open the modal
	card.style.cursor = 'pointer';


	// Media wrapper (image or video) - placed at the top area of the card
	const mediaWrapper = document.createElement('div');
	mediaWrapper.className = 'media-wrapper';

	if (item.media_type === 'image') {
		const img = document.createElement('img');
		img.src = item.url || item.hdurl || '';
		img.alt = item.title || 'APOD image';
		mediaWrapper.appendChild(img);
	} else if (item.media_type === 'video') {
		const iframe = document.createElement('iframe');
		iframe.src = item.url;
		iframe.setAttribute('frameborder', '0');
		iframe.setAttribute('allowfullscreen', '');
		mediaWrapper.appendChild(iframe);
	}

	card.appendChild(mediaWrapper);

	// Footer area for title/date placed at the bottom of the card
	const footer = document.createElement('div');
	footer.className = 'card-footer';
	const header = document.createElement('h3');
	header.textContent = item.title || '';
	header.style.margin = '6px 0 2px';
	const dateEl = document.createElement('div');
	dateEl.className = 'card-date';
	dateEl.textContent = item.date || '';
	dateEl.style.fontSize = '13px';
	dateEl.style.color = 'inherit';
	footer.appendChild(header);
	footer.appendChild(dateEl);
	card.appendChild(footer);

	// Open modal with full details when the card is clicked
	card.addEventListener('click', () => openModal(item));

	return card;
}

// Render an array of APOD items into the gallery
function renderGallery(items) {
	// Clear existing content
	gallery.innerHTML = '';

	if (!items || items.length === 0) {
		const placeholder = document.createElement('div');
		placeholder.className = 'placeholder';
		placeholder.innerHTML = '<div class="placeholder-icon">🔭</div><p>No images available.</p>';
		gallery.appendChild(placeholder);
		return;
	}

	// Create and append items
	items.forEach(item => {
		const el = createGalleryItem(item);
		gallery.appendChild(el);
	});
}

// Fetch APOD JSON, update UI and handle errors
async function fetchAndShowApod() {
	// Disable button and show loading text
	getImageBtn.disabled = true;
	const originalText = getImageBtn.textContent;
	getImageBtn.textContent = 'Loading…';

	// Show an inline loading message in the gallery while we fetch
	gallery.innerHTML = '';
	const loadingDiv = document.createElement('div');
	loadingDiv.className = 'placeholder';
	loadingDiv.innerHTML = '<div class="placeholder-icon">🔄</div><p>Loading space photos…</p>';
	gallery.appendChild(loadingDiv);

	try {
		const res = await fetch(apodData);
		if (!res.ok) throw new Error(`Network error: ${res.status} ${res.statusText}`);
		const data = await res.json();

		// The dataset may be an object with a `items` property or an array.
		const items = Array.isArray(data) ? data : (data.items || []);

		// Render the gallery (show newest first if date present)
		items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
		renderGallery(items);
	} catch (err) {
		console.error('Failed to load APOD data', err);
		gallery.innerHTML = '';
		const errDiv = document.createElement('div');
		errDiv.className = 'placeholder';
		errDiv.innerHTML = `<p>Unable to load images. ${err.message}</p>`;
		gallery.appendChild(errDiv);
	} finally {
		// Restore button state
		getImageBtn.disabled = false;
		getImageBtn.textContent = originalText;
	}
}

// Wire up click handler
getImageBtn.addEventListener('click', fetchAndShowApod);

// Optional: allow pressing Enter on the button when focused
getImageBtn.addEventListener('keyup', (e) => {
	if (e.key === 'Enter') fetchAndShowApod();
});

// End of script

// Modal functions
function openModal(item) {
	if (!apodModal) return;
	// Clear previous media
	modalMedia.innerHTML = '';
	// Populate media
	if (item.media_type === 'image') {
		const img = document.createElement('img');
		// show HD if available in modal
		img.src = item.hdurl || item.url || '';
		img.alt = item.title || '';
		modalMedia.appendChild(img);
	} else if (item.media_type === 'video') {
		const iframe = document.createElement('iframe');
		iframe.src = item.url;
		iframe.setAttribute('frameborder', '0');
		iframe.setAttribute('allowfullscreen', '');
		modalMedia.appendChild(iframe);
	}

	// Populate text
	modalTitle.textContent = item.title || '';
	modalDate.textContent = item.date || '';
	modalExplanation.textContent = item.explanation || '';

	// Show modal
	apodModal.classList.add('open');
	apodModal.setAttribute('aria-hidden', 'false');
	// trap focus simply by focusing close button
	modalClose.focus();
}

function closeModal() {
	if (!apodModal) return;
	apodModal.classList.remove('open');
	apodModal.setAttribute('aria-hidden', 'true');
	modalMedia.innerHTML = '';
}

// Wire modal events
if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') closeModal();
});