
const projects = [];

const projectForm = document.querySelector("#project-form");
const nameInput = document.querySelector("#name");
const statusInput = document.querySelector("#status");
const projectList = document.querySelector("#project-list");
const emptyState = document.querySelector("#empty-state");

// Display all projects
function renderProjects() {
    projectList.replaceChildren();

    projects.forEach(function (project) {
        const listItem = document.createElement("li");

        const projectName = document.createElement("h3");
        projectName.textContent = project.name;

        const projectStatus = document.createElement("p");
        projectStatus.textContent = "Status: " + project.status;

        listItem.appendChild(projectName);
        listItem.appendChild(projectStatus);

        projectList.appendChild(listItem);
    });

    if (emptyState) {
        emptyState.hidden = projects.length > 0;
    }
}

// Add a new project when the form is submitted
projectForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const status = statusInput.value;

    if (name === "") {
        nameInput.focus();
        return;
    }

    const project = {
        id: crypto.randomUUID(),
        name: name,
        status: status
    };

    projects.push(project);

    renderProjects();

    projectForm.reset();
    nameInput.focus();
});

// Show the initial empty list
renderProjects();

