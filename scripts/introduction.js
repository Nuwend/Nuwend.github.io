const formElement = document.getElementById('form');
const clearButton = document.getElementById('clear');
const imageInput = document.getElementById('img');
const preview = document.getElementById('preview');
const defaultImage = preview.getAttribute('src');
const coursesContainer = document.getElementById('courses');
const addCourseButton = document.getElementById('add-course');
const defaultCourses = coursesContainer.innerHTML; // a copy of your four prefilled courses, kept for Reset
let uploadedUrl = null;

// Show the uploaded picture in the preview, or go back to the default photo.
function updatePreview() {
    if (uploadedUrl) {
        URL.revokeObjectURL(uploadedUrl);
        uploadedUrl = null;
    }
    const file = imageInput.files[0];
    if (file) {
        uploadedUrl = URL.createObjectURL(file);
        preview.src = uploadedUrl;
    } else {
        preview.src = defaultImage;
    }
}

// Remove any error messages left on the fields.
function clearValidity() {
    formElement.querySelectorAll('input, textarea').forEach((field) => {
        field.setCustomValidity('');
    });
}

// Block the submit if a required field is empty or only spaces.
function validateForm() {
    let valid = true;
    formElement.querySelectorAll('input[required], textarea[required]').forEach((field) => {
        if (field.value.trim() === '') {
            field.setCustomValidity('Please fill out this field.');
            if (valid) {
                field.reportValidity();
            }
            valid = false;
        } else {
            field.setCustomValidity('');
        }
    });
    return valid;
}

// Empty every field, including the textareas and the picture.
function clearForm() {
    formElement.querySelectorAll('input, textarea').forEach((field) => {
        field.value = '';
    });
    clearValidity();
    updatePreview();
}
// Put a Delete button at the end of a course row, if it doesn't have one yet.
function addDeleteButton(row) {
    if (row.querySelector('.delete-course')) {
        return;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'delete-course';
    button.textContent = 'Delete';
    button.setAttribute('aria-label', 'Delete this course');
    row.appendChild(button);
}

// Give every course row a Delete button.
function addDeleteButtons() {
    coursesContainer.querySelectorAll('.course').forEach(addDeleteButton);
}

// Build a new empty course row with the same four fields as the others.
function createCourseRow() {
    const row = document.createElement('div');
    row.className = 'course';
    row.innerHTML =
        '<input type="text" name="department" placeholder="Department" aria-label="Department" required>' +
        '<input type="text" name="courseNumber" placeholder="Number" aria-label="Course number" required>' +
        '<input type="text" name="courseTitle" placeholder="Course name" aria-label="Course name" required>' +
        '<input type="text" name="reasonForTaking" placeholder="Reason for taking it" aria-label="Reason for taking the course" required>';
    addDeleteButton(row);
    return row;
}

// The browser restores field values; this also restores the default courses and the preview.
function resetForm() {
    clearValidity();
    setTimeout(() => {
        coursesContainer.innerHTML = defaultCourses;
        addDeleteButtons();
        updatePreview();
    }, 0);
}

// Create an element and set its text safely, so visitor text never becomes HTML.
function make(tag, text) {
    const element = document.createElement(tag);
    if (text) {
        element.textContent = text;
    }
    return element;
}

// A list item with a bold label followed by the visitor's text.
function labeledItem(label, text) {
    const item = make('li');
    item.append(make('strong', label), ' ' + text);
    return item;
}

// Collect the form into an object that uses the same keys as the data model.
function gatherData() {
    const value = (id) => document.getElementById(id).value.trim();

    const courses = Array.from(coursesContainer.querySelectorAll('.course')).map((row) => ({
        department: row.querySelector('[name="department"]').value.trim(),
        courseNumber: row.querySelector('[name="courseNumber"]').value.trim(),
        courseTitle: row.querySelector('[name="courseTitle"]').value.trim(),
        reasonForTaking: row.querySelector('[name="reasonForTaking"]').value.trim()
    }));

    const labels = formElement.querySelectorAll('[name="linkLabel"]');
    const urls = formElement.querySelectorAll('[name="linkUrl"]');
    const footerLinks = Array.from(labels).map((input, index) => ({
        label: input.value.trim(),
        url: urls[index].value.trim()
    }));

    return {
        firstName: value('firstName'),
        middleName: value('middleName'),
        nickname: value('nickname'),
        lastName: value('lastName'),
        acknowledgment: value('acknowledgment'),
        acknowledgmentDate: value('acknowledgmentDate'),
        prettyNameDivider: value('prettyNameDivider'),
        adjectives: value('adjectives'),
        animal: value('animal'),
        img: uploadedUrl || defaultImage,
        pictureAlt: value('pictureAlt'),
        caption: value('caption'),
        personalInfo: {
            statement: value('statement'),
            personalBackground: value('personalBackground'),
            professionalBackground: value('professionalBackground'),
            academicBackground: value('academicBackground'),
            primaryWorkComputer: value('primaryWorkComputer'),
            primaryWorkLocation: value('primaryWorkLocation'),
            alternateComputerLocation: value('alternateComputerLocation')
        },
        courses: courses,
        quote: value('quote'),
        quoteAuthor: value('quoteAuthor'),
        funnyItem: value('funnyItem'),
        somethingToShare: value('somethingToShare'),
        footerLinks: footerLinks
    };
}

// Build the same markup as introduction.html, from the collected data.
function buildResult(data) {
    const info = data.personalInfo;

    const nameParts = [
        data.firstName,
        data.middleName,
        data.nickname ? '“' + data.nickname + '”' : '',
        data.lastName
    ].filter(Boolean);
    const title = make('h3', nameParts.join(' ') + ' ' + data.prettyNameDivider + ' ' + data.adjectives + ' ' + data.animal);

    const photo = make('figure');
    const image = make('img');
    image.src = data.img;
    image.alt = data.pictureAlt;
    photo.append(image, make('figcaption', data.caption));

    const statement = make('p', info.statement);

    const list = make('ul');
    [
        ['Personal Background:', info.personalBackground],
        ['Professional Background:', info.professionalBackground],
        ['Academic Background:', info.academicBackground],
        ['Primary Work Computer:', info.primaryWorkComputer],
        ['Primary Work Location:', info.primaryWorkLocation],
        ['Alternate Work Computer/Location:', info.alternateComputerLocation]
    ].forEach(([label, text]) => list.append(labeledItem(label, text)));

    const coursesItem = make('li');
    coursesItem.append(make('strong', 'Courses I’m Taking and Why:'));
    const courseList = make('ol');
    courseList.setAttribute('type', 'a');
    data.courses.forEach((course) => {
        courseList.append(labeledItem(
            course.department + course.courseNumber + ' - ' + course.courseTitle + ':',
            course.reasonForTaking
        ));
    });
    coursesItem.append(courseList);
    list.append(coursesItem);

    if (data.funnyItem) {
        list.append(labeledItem('Funny Thing:', data.funnyItem));
    }
    if (data.somethingToShare) {
        list.append(labeledItem('Something I Would Like to Share:', data.somethingToShare));
    }

    // Show the quote inside curly quotation marks, whether or not the visitor typed any.
    const quoteText = data.quote.replace(/^["“”]+|["“”]+$/g, '').trim();
    const quoteFigure = make('figure');
    const blockquote = make('blockquote');
    blockquote.append(make('p', '“' + quoteText + '”'));
    quoteFigure.append(blockquote, make('figcaption', data.quoteAuthor));

    // Only web addresses become links.
    const links = make('p');
    links.id = 'profile-links';
    data.footerLinks
        .filter((link) => /^https?:\/\//i.test(link.url))
        .forEach((link, index) => {
            const anchor = make('a', link.label);
            anchor.href = link.url;
            if (index === 0) {
                links.append(anchor);
            } else {
                const divider = make('span', '|');
                divider.setAttribute('aria-hidden', 'true');
                links.append(' ', divider, ' ', anchor);
            }
        });

    // Loading the page again brings back the form with its default values.
    const resetParagraph = make('p');
    resetParagraph.id = 'reset-wrapper';
    const resetLink = make('a', 'Reset the form');
    resetLink.href = window.location.pathname;
    resetParagraph.append(resetLink);

    return [title, photo, statement, list, quoteFigure, links, resetParagraph];
}

// Replace the form with the result, keeping the Introduction Form heading.
function showResult(data) {
    const main = document.getElementById('introduction');
    const heading = main.querySelector('h2');
    main.replaceChildren(heading, ...buildResult(data));
    window.scrollTo(0, 0);
}

formElement.addEventListener('submit', (event) => {
    event.preventDefault(); // prevents page refresh / default behavior
    if (validateForm()) {
        showResult(gatherData());
    }
});

formElement.addEventListener('input', (event) => {
    event.target.setCustomValidity('');
});

formElement.addEventListener('reset', resetForm);
clearButton.addEventListener('click', clearForm);
imageInput.addEventListener('change', updatePreview);

addCourseButton.addEventListener('click', () => {
    const row = createCourseRow();
    coursesContainer.appendChild(row);
    row.querySelector('input').focus();
});

// One listener on the container handles every Delete button, including ones added later.
coursesContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-course')) {
        event.target.closest('.course').remove();
    }
});

addDeleteButtons();

// ----- Generate HTML, JSON, and XML -----

const generated = document.createElement('div');
generated.id = 'generated';
document.getElementById('introduction').append(generated);

const imagePrefix = defaultImage.slice(0, defaultImage.lastIndexOf('/') + 1);

// Escape the characters that would break HTML or XML.
function escapeText(text) {
    return String(text)
        .split('&').join('&amp;')
        .split('<').join('&lt;')
        .split('>').join('&gt;')
        .split('"').join('&quot;');
}

// The form data, with the picture as a file path instead of a temporary browser address.
function getExportData() {
    const data = gatherData();
    const file = imageInput.files[0];
    data.img = file ? imagePrefix + file.name : defaultImage;

    // Write the date as M/D/YY, like the data model.
    const parts = data.acknowledgmentDate.split('-');
    if (parts.length === 3) {
        data.acknowledgmentDate = Number(parts[1]) + '/' + Number(parts[2]) + '/' + parts[0].slice(2);
    }
    return data;
}

// Read a file as a base64 data URL.
function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

// The chosen picture, or the default one, as a data URL.
function pictureAsDataUrl() {
    const file = imageInput.files[0];
    const source = file ? Promise.resolve(file) : fetch(defaultImage).then((response) => response.blob());
    return source.then(blobToDataUrl);
}

// Remove any quotation marks the visitor typed around the quote.
function stripQuoteMarks(text) {
    const marks = ['"', '“', '”'];
    let start = 0;
    let end = text.length;
    while (start < end && marks.includes(text[start])) {
        start++;
    }
    while (end > start && marks.includes(text[end - 1])) {
        end--;
    }
    return text.slice(start, end).trim();
}

// Keep only the links that start with http:// or https://.
function onlyWebLinks(links) {
    return links.filter((link) => {
        const address = link.url.toLowerCase();
        return address.startsWith('http://') || address.startsWith('https://');
    });
}

// A list item with a bold label, indented by the given spaces.
function listItem(label, text, pad) {
    return pad + '<li><strong>' + escapeText(label) + '</strong> ' + escapeText(text) + '</li>';
}

// The full introduction page as formatted HTML.
function buildHtml(data) {
    const info = data.personalInfo;
    const names = [
        data.firstName,
        data.middleName,
        data.nickname ? '“' + data.nickname + '”' : '',
        data.lastName
    ].filter(Boolean);
    const heading = names.join(' ') + ' ' + data.prettyNameDivider + ' ' + data.adjectives + ' ' + data.animal;
    const pageTitle = data.firstName + ' ' + data.lastName + ' | ITIS 3135 | Introduction';

    const bullets = [
        ['Personal Background:', info.personalBackground],
        ['Professional Background:', info.professionalBackground],
        ['Academic Background:', info.academicBackground],
        ['Primary Work Computer:', info.primaryWorkComputer],
        ['Primary Work Location:', info.primaryWorkLocation],
        ['Alternate Work Computer/Location:', info.alternateComputerLocation]
    ].map((pair) => listItem(pair[0], pair[1], '            '));

    const courses = data.courses.map((course) => listItem(
        course.department + course.courseNumber + ' - ' + course.courseTitle + ':',
        course.reasonForTaking,
        '                    '
    ));

    const extras = [];
    if (data.funnyItem) {
        extras.push(listItem('Funny Thing:', data.funnyItem, '            '));
    }
    if (data.somethingToShare) {
        extras.push(listItem('Something I Would Like to Share:', data.somethingToShare, '            '));
    }

    const links = onlyWebLinks(data.footerLinks).map((link, index, all) => {
        const anchor = '<a href="' + escapeText(link.url) + '">' + escapeText(link.label) + '</a>';
        const divider = index < all.length - 1 ? ' <span aria-hidden="true">|</span>' : '';
        return '            ' + anchor + divider;
    });

    const top = [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '    <meta charset="UTF-8">',
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '    <title>' + escapeText(pageTitle) + '</title>',
        '    <link rel="stylesheet" href="../styles/default.css">',
        '    <script src="https://divonbriesen.github.io/teaching/tools/standards-check.js" defer></script>',
        '    <script src="https://lint.page/kit/4d0fe3.js" crossorigin="anonymous"></script>',
        '</head>',
        '',
        '<body>',
        '    <header id="header-placeholder"></header>',
        '',
        '    <main id="introduction">',
        '        <h2>Introduction</h2>',
        '        <h3>' + escapeText(heading) + '</h3>',
        '',
        '        <figure>',
        '            <img src="' + escapeText(data.img) + '" alt="' + escapeText(data.pictureAlt) + '">',
        '            <figcaption>' + escapeText(data.caption) + '</figcaption>',
        '        </figure>',
        '',
        '        <p>' + escapeText(info.statement) + '</p>',
        '',
        '        <ul>'
    ];

    const coursesStart = [
        '            <li><strong>Courses I’m Taking and Why:</strong>',
        '                <ol type="a">'
    ];

    const middle = [
        '                </ol>',
        '            </li>'
    ];

    const afterList = [
        '        </ul>',
        '',
        '        <figure>',
        '            <blockquote>',
        '                <p>“' + escapeText(stripQuoteMarks(data.quote)) + '”</p>',
        '            </blockquote>',
        '            <figcaption>' + escapeText(data.quoteAuthor) + '</figcaption>',
        '        </figure>',
        '',
        '        <p id="profile-links">'
    ];

    const bottom = [
        '        </p>',
        '    </main>',
        '',
        '    <div id="footer-placeholder"></div>',
        '',
        '    <script>',
        '        fetch(\'../includes/header.html\')',
        '            .then((response) => response.text())',
        '            .then((html) => {',
        '                document.getElementById(\'header-placeholder\').innerHTML = html;',
        '                const pageName = document.title.split(\'|\').pop().trim();',
        '                document.querySelector(\'#header-placeholder h1\').textContent += \' | \' + pageName;',
        '            });',
        '    </script>',
        '',
        '    <script>',
        '        fetch(\'../includes/footer.html\')',
        '            .then((response) => response.text())',
        '            .then((html) => {',
        '                document.getElementById(\'footer-placeholder\').innerHTML = html;',
        '            });',
        '    </script>',
        '</body>',
        '</html>'
    ];

    return [].concat(top, bullets, coursesStart, courses, middle, extras, afterList, links, bottom).join('\n');
}

// The singular name for the items inside each list in the XML.
const childNames = { courses: 'course', footerLinks: 'link' };

// Turn a value into formatted XML, indented by depth.
function toXml(name, value, depth) {
    const pad = '  '.repeat(depth);
    if (Array.isArray(value)) {
        const lines = [pad + '<' + name + '>'];
        value.forEach((item) => lines.push(toXml(childNames[name], item, depth + 1)));
        lines.push(pad + '</' + name + '>');
        return lines.join('\n');
    }
    if (typeof value === 'object') {
        const lines = [pad + '<' + name + '>'];
        Object.keys(value).forEach((key) => lines.push(toXml(key, value[key], depth + 1)));
        lines.push(pad + '</' + name + '>');
        return lines.join('\n');
    }
    return pad + '<' + name + '>' + escapeText(value) + '</' + name + '>';
}

function buildXml(data) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + toXml('introduction', data, 0);
}

// Show the text in a read only text area under the form, reusing it if it already exists.
function showOutput(kind, title, text) {
    let area = document.getElementById('output-' + kind);
    if (!area) {
        const label = document.createElement('label');
        label.htmlFor = 'output-' + kind;
        label.textContent = title;
        area = document.createElement('textarea');
        area.id = 'output-' + kind;
        area.readOnly = true;
        area.wrap = 'off';
        generated.append(label, area);
    }
    area.value = text;
    area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.getElementById('generate-html').addEventListener('click', () => {
    showOutput('html', 'Generated HTML', buildHtml(getExportData()));
});

document.getElementById('generate-json').addEventListener('click', () => {
    const data = getExportData();
    pictureAsDataUrl()
        .then((url) => {
            data.img = url;
        })
        .catch(() => {
            // If the picture can't be read, the file path stays in place.
        })
        .then(() => {
            showOutput('json', 'Generated JSON', JSON.stringify(data, null, 2));
        });
});

document.getElementById('generate-xml').addEventListener('click', () => {
    showOutput('xml', 'Generated XML', buildXml(getExportData()));
});