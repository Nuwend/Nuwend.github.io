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

formElement.addEventListener('submit', (event) => {
    event.preventDefault(); // prevents page refresh / default behavior
    if (validateForm()) {
        console.log('Form is valid');
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