
const STORAGE_KEY = "workshop-projects-v1";

const projects = [];

let editingId = null;
let storageBlocked = false;

const projectForm = document.querySelector("#project-form");
const nameInput = document.querySelector("#name");
const statusInput = document.querySelector("#status");
const projectList = document.querySelector("#project-list");
const emptyState = document.querySelector("#empty-state");
const saveButton = document.querySelector("#save-button");
const cancelButton = document.querySelector("#cancel-button");
const message = document.querySelector("#message");

// Display a message to the user
function showMessage(text) {
    message.textContent = text;
}

// Check that stored data contains valid project records
function isValidProjects(data) {
    return Array.isArray(data) &&
        data.every(function (project) {
            return project !== null &&
                typeof project === "object" &&
                !Array.isArray(project) &&
                typeof project.id === "string" &&
                project.id.length > 0 &&
                typeof project.name === "string" &&
                project.name.trim() !== "" &&
                typeof project.status === "string" &&
                ["Planned", "In Progress", "Completed"].includes(
                    project.status
                );
        });
}

// Load saved projects when the page starts
function loadProjects() {
    let savedText;

    try {
        savedText = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
        storageBlocked = true;
        showMessage(
            "Could not read saved projects. Storage may be unavailable."
        );
        return;
    }

    // No saved data: start with an empty collection
    if (savedText === null) {
        return;
    }

    try {
        const savedProjects = JSON.parse(savedText);

        if (!isValidProjects(savedProjects)) {
            storageBlocked = true;
            showMessage(
                "Saved project data is invalid. It has not been overwritten. " +
                "Your stored data must be repaired or cleared before changes can be saved."
            );
            return;
        }

        projects.push(...savedProjects);
    } catch (error) {
        storageBlocked = true;
        showMessage(
            "Saved project data could not be read. It has not been overwritten. " +
            "Your stored data must be repaired or cleared before changes can be saved."
        );
    }
}

// Save the current collection
function saveProjects() {
    if (storageBlocked) {
        showMessage(
            "Changes could not be saved. Existing stored data was left unchanged."
        );
        return false;
    }

    try {
        // Convert the project collection into text for localStorage
        const savedText = JSON.stringify(projects);
        localStorage.setItem(STORAGE_KEY, savedText);
        showMessage("Projects saved successfully.");
        return true;
    } catch (error) {
        showMessage(
            "Changes could not be saved. Browser storage may be unavailable or full."
        );
        return false;
    }
}

// Display all projects
function renderProjects() {
    projectList.replaceChildren();

    projects.forEach(function (project) {
        const listItem = document.createElement("li");

        const projectName = document.createElement("h3");
        projectName.textContent = project.name;

        const projectStatus = document.createElement("p");
        projectStatus.textContent = "Status: " + project.status;

        const actions = document.createElement("div");
        actions.className = "card-actions";

        // Edit button
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function () {
            startEditing(project.id);
        });

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            deleteProject(project.id);
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        listItem.appendChild(projectName);
        listItem.appendChild(projectStatus);
        listItem.appendChild(actions);

        projectList.appendChild(listItem);
    });

    if (emptyState) {
        emptyState.hidden = projects.length > 0;
    }
}

// Start editing a project
function startEditing(id) {
    const project = projects.find(function (item) {
        return item.id === id;
    });

    if (!project) {
        return;
    }

    editingId = project.id;

    nameInput.value = project.name;
    statusInput.value = project.status;

    saveButton.textContent = "Save changes";
    cancelButton.hidden = false;

    showMessage("Editing project: " + project.name);
    nameInput.focus();
}

// Return the form to Add mode
function resetForm() {
    projectForm.reset();

    editingId = null;

    saveButton.textContent = "Save Project";
    cancelButton.hidden = true;
}

// Delete a project after confirmation
function deleteProject(id) {
    const project = projects.find(function (item) {
        return item.id === id;
    });

    if (!project) {
        return;
    }

    const confirmed = window.confirm(
        'Are you sure you want to delete "' + project.name + '"?'
    );

    if (!confirmed) {
        return;
    }

    const index = projects.findIndex(function (item) {
        return item.id === id;
    });

    if (index === -1) {
        return;
    }

    // Remove only the selected project
    projects.splice(index, 1);

    // Reset the form if this project was being edited
    if (editingId === id) {
        resetForm();
    }

    renderProjects();
    saveProjects();
}

// Handle both adding and editing
projectForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const status = statusInput.value;

    if (name === "") {
        showMessage("Please enter a project name.");
        nameInput.focus();
        return;
    }

    if (editingId === null) {
        // Add a new project
        const project = {
            id: crypto.randomUUID(),
            name: name,
            status: status
        };

        projects.push(project);
    } else {
        // Update the selected project without changing its ID
        const project = projects.find(function (item) {
            return item.id === editingId;
        });

        if (!project) {
            resetForm();
            renderProjects();
            showMessage("The selected project could not be found.");
            return;
        }

        project.name = name;
        project.status = status;
    }

    resetForm();
    renderProjects();
    saveProjects();
    nameInput.focus();
});

// Cancel editing without changing saved projects
cancelButton.addEventListener("click", function () {
    resetForm();
    renderProjects();
    showMessage("Edit cancelled.");
    nameInput.focus();
});

// Load saved projects and display them
loadProjects();
renderProjects();

