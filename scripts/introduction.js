const formElement = document.getElementById('form');
const clearButton = document.getElementById('clear');
const imageInput = document.getElementById('img');
const preview = document.getElementById('preview');
const defaultImage = preview.getAttribute('src');
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

// The browser restores the default values; this restores the preview and messages.
function resetForm() {
    clearValidity();
    setTimeout(updatePreview, 0);
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