const apiUrl = 'https://intro-form.tommyhost.ing/';
const cardsList = document.getElementById('cards');
const searchBox = document.getElementById('search');
const statusLine = document.getElementById('status');
let people = [];

// A trimmed string, or an empty string if the value isn't text.
function clean(value) {
    return typeof value === 'string' ? value.trim() : '';
}

// Pull out only the fields the gallery uses, with a fallback for anything missing.
function toPerson(username, record) {
    const info = record && record.introductionData ? record.introductionData : {};
    const name = (clean(info.firstName) + ' ' + clean(info.lastName)).trim() || username;
    const mascot = (clean(info.adjectives) + ' ' + clean(info.animal)).trim();
    const picture = clean(info.img);

    return {
        username: username,
        name: name,
        mascot: mascot,
        // Only pictures sent as data text are used, since a file path from another site could fail to load.
        image: picture.startsWith('data:image/') ? picture : '',
        quote: clean(info.quote),
        author: clean(info.quoteAuthor)
    };
}

// Build one card. Everything is set as plain text, so nothing a classmate typed can run as code.
function createCard(person) {
    const card = document.createElement('li');

    if (person.image) {
        const picture = document.createElement('img');
        picture.src = person.image;
        picture.alt = person.name + ', ' + (person.mascot || 'mascot not listed');
        picture.loading = 'lazy';
        card.append(picture);
    } else {
        const missing = document.createElement('p');
        missing.textContent = 'No picture submitted';
        card.append(missing);
    }

    const heading = document.createElement('h3');
    heading.textContent = person.name;
    card.append(heading);

    const mascot = document.createElement('p');
    const mascotName = document.createElement('strong');
    mascotName.textContent = person.mascot || 'Mascot not listed';
    mascot.append(mascotName);
    card.append(mascot);

    if (person.quote) {
        const quote = document.createElement('p');
        const emphasis = document.createElement('em');
        emphasis.textContent = person.quote;
        quote.append(emphasis);
        card.append(quote);
    }

    if (person.author) {
        const author = document.createElement('p');
        author.textContent = 'Quote by ' + person.author;
        card.append(author);
    }

    return card;
}

// Show the cards that match the search, or all of them when it is empty.
function showCards(search) {
    const term = clean(search).toLowerCase();
    cardsList.replaceChildren();
    let shown = 0;

    people.forEach((person) => {
        const text = [person.name, person.mascot, person.quote, person.author, person.username].join(' ').toLowerCase();
        if (text.includes(term)) {
            cardsList.append(createCard(person));
            shown++;
        }
    });

    if (shown === 0) {
        statusLine.textContent = 'No one matches that search.';
    } else {
        statusLine.textContent = 'Showing ' + shown + ' of ' + people.length + '.';
    }
}

fetch(apiUrl)
    .then((response) => {
        if (!response.ok) {
            throw new Error('The server answered with status ' + response.status);
        }
        return response.json();
    })
    .then((all) => {
        people = Object.keys(all).map((username) => toPerson(username, all[username]));
        people.sort((a, b) => a.name.localeCompare(b.name));
        showCards('');
    })
    .catch((error) => {
        console.log('Gallery error:', error);
        statusLine.textContent = 'The gallery could not be loaded right now. Please try again later.';
    });

searchBox.addEventListener('input', () => {
    showCards(searchBox.value);
});