const API_BASE_URL = "https://vvri.pythonanywhere.com/api";
const contentDiv = document.getElementById("content");
const showCoursesButton = document.getElementById("show-courses");
const showStudentsButton = document.getElementById("show-students");

showCoursesButton.addEventListener("click", () => showList("courses"));
showStudentsButton.addEventListener("click", () => showList("students"));

async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch from ${endpoint}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

async function sendData(endpoint, method, data = null) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method,
            headers: { "Content-Type": "application/json" },
            body: data ? JSON.stringify(data) : null,
        });
        if (!response.ok) {
            throw new Error(`Failed to ${method} data at ${endpoint}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error sending data:", error);
    }
}

async function showList(type) {
    const data = await fetchData(type);
    contentDiv.innerHTML = "";

    const addButton = document.createElement("button");
    addButton.textContent = `Add New ${type.slice(0, -1)}`;
    addButton.className = "primary";
    addButton.onclick = () => openForm(type);
    contentDiv.appendChild(addButton);

    data.forEach(item => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
            <strong>${item.name}</strong>
            <button class="primary" onclick="editItem('${type}', ${item.id})">Edit</button>
            <button class="danger" onclick="deleteItem('${type}', ${item.id})">Delete</button>
        `;
        contentDiv.appendChild(div);
    });
}

function openForm(type, item = null) {
    contentDiv.innerHTML = "";
    const formContainer = document.createElement("div");
    formContainer.id = "form-container";

    if (type === "courses") {
        formContainer.innerHTML = `
            <label for="name">Name:</label>
            <input type="text" id="name" value="${item ? item.name : ""}" required />
            <button class="primary" onclick="saveItem('${type}', ${item ? item.id : null})">Save</button>
            <button onclick="showList('${type}')">Cancel</button>
        `;
    } else if (type === "students") {
        formContainer.innerHTML = `
            <label for="name">Name:</label>
            <input type="text" id="name" value="${item ? item.name : ""}" required />
            <label for="courseId">Course ID:</label>
            <input type="text" id="courseId" value="${item ? item.course_id : ""}" required />
            <button class="primary" onclick="saveItem('${type}', ${item ? item.id : null})">Save</button>
            <button onclick="showList('${type}')">Cancel</button>
        `;
    }
    contentDiv.appendChild(formContainer);
}

async function saveItem(type, id) {
    const name = document.getElementById("name").value;
    const data = { name };
    if (type === "students") {
        const courseId = document.getElementById("courseId").value;
        if (!courseId) {
            alert("Course ID is required for students");
            return;
        }
        data.course_id = courseId;
    }

    // Kurzusok esetén PATCH, diákok esetén PUT metódust használunk
    const method = id ? (type === "courses" ? "PATCH" : "PUT") : "POST";
    const endpoint = id ? `${type}/${id}` : type;

    await sendData(endpoint, method, data);
    showList(type);
}

async function editItem(type, id) {
    const item = await fetchData(`${type}/${id}`);
    openForm(type, item);
}

async function deleteItem(type, id) {
    if (confirm("Are you sure you want to delete this item?")) {
        await sendData(`${type}/${id}`, "DELETE");
        showList(type);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    contentDiv.innerHTML = "<p>Select a category.</p>";
});


async function showList(type) {
    const data = await fetchData(type);
    contentDiv.innerHTML = "";

    const addButton = document.createElement("button");
    addButton.textContent = `Add New ${type.slice(0, -1)}`;
    addButton.className = "primary";
    addButton.onclick = () => openForm(type);
    contentDiv.appendChild(addButton);

    const cardContainer = document.createElement("div");
    cardContainer.className = "card-container";
    contentDiv.appendChild(cardContainer);

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="card-content">
                <strong>${item.name}</strong>
                ${type === "courses" ? `<p>ID: ${item.id}</p>` : ""}
            </div>
            <div class="card-actions">
                <button class="primary" onclick="editItem('${type}', ${item.id})">Edit</button>
                <button class="danger" onclick="deleteItem('${type}', ${item.id})">Delete</button>
            </div>
        `;
        cardContainer.appendChild(card);
    });
}
