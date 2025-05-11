const list = document.querySelector(".posts-list");
const next = document.querySelector(".next");
const back = document.querySelector(".back");
const pageDisplay = document.querySelector(".page");
const addBtn = document.querySelector(".add");
const titleInput = document.querySelector(".title-input");
const bodyInput = document.querySelector(".body-input");

let currentPage = 1;
const limit = 12;

next.addEventListener("click", () => {
  currentPage++;
  loadPosts();
});

back.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadPosts();
  }
});

const loadPosts = async function () {
  try {
    const url = `https://jsonplaceholder.typicode.com/posts?_page=${currentPage}&_limit=${limit}`;
    const response = await fetch(url);
    const posts = await response.json();

    makeHtml(posts);
    pageDisplay.textContent = `Page: ${currentPage}`;

    next.disabled = posts.length < limit;
    back.disabled = currentPage === 1;
  } catch (error) {
    console.error("Виникла помилка при завантаженні постів:", error);
  }
};

const makeHtml = function (posts) {
  const html = posts
    .map((post) => {
      return `<li class="list-element" data-id="${post.id}">
                  <h2 class="post-title">${post.title}</h2>
                  <p class="post-body">${post.body}</p>
                  <button data-id-delete="${post.id}" class="delete button">Delete</button>
                  <button data-id-edit="${post.id}" class="edit button">Edit</button>
                </li>`;
    })
    .join("");

  list.innerHTML = html;
  initPostEvents();
};

const initPostEvents = function () {
  document.querySelectorAll(".delete").forEach((button) => {
    button.addEventListener("click", async () => {
      const postId = button.getAttribute("data-id-delete");
      await deletePost(postId);
      button.closest(".list-element").remove();
    });
  });

  document.querySelectorAll(".edit").forEach((button) => {
    button.addEventListener("click", () => {
      const li = button.closest(".list-element");
      const title = li.querySelector(".post-title").textContent;
      const body = li.querySelector(".post-body").textContent;

      li.innerHTML = `
            <div class="edit-form">
              <input type="text" class="edit-title" value="${title}">
              <textarea class="edit-body">${body}</textarea>
              <button class="save">Save</button>
              <button class="cancel">Cancel</button>
            </div>
          `;

      li.querySelector(".save").addEventListener("click", async () => {
        const newTitle = li.querySelector(".edit-title").value;
        const newBody = li.querySelector(".edit-body").value;
        const postId = li.getAttribute("data-id");

        await editPost(postId, newTitle, newBody);

        li.innerHTML = `
              <h2 class="post-title">${newTitle}</h2>
              <p class="post-body">${newBody}</p>
              <button data-id-delete="${postId}" class="delete">Delete</button>
              <button data-id-edit="${postId}" class="edit">Edit</button>
            `;
        initPostEvents(); 
      });

      li.querySelector(".cancel").addEventListener("click", () => {
        loadPosts(); 
      });
    });
  });
};

const deletePost = async function (postId) {
  try {
    await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(`помилка при видаленні: ${error}`);
  }
};

const editPost = async function (id, title, body) {
  try {
    await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title, body, userId: 1 }),
    });
  } catch (error) {
    console.error(`помилка при редагуванні: ${error}`);
  }
};

const addPost = async function () {
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title || !body) {
    alert("Введіть заголовок і текст поста.");
    return;
  }

  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, userId: 1 }),
    });

    const newPost = await response.json();

    const li = document.createElement("li");
    li.classList.add("list-element");
    li.setAttribute("data-id", newPost.id);
    li.innerHTML = `
          <h2 class="post-title">${newPost.title}</h2>
          <p class="post-body">${newPost.body}</p>
          <button data-id-delete="${newPost.id}" class="button delete">Delete</button>
          <button data-id-edit="${newPost.id}" class="button edit">Edit</button>
        `;
    list.prepend(li);
    initPostEvents();

    titleInput.value = "";
    bodyInput.value = "";
  } catch (error) {
    console.error("Помилка при додаванні поста:", error);
  }
};



addBtn.addEventListener("click", addPost);

loadPosts();
