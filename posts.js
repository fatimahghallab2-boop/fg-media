// CREATE POST HTML

function createPostHTML(post, isLatest = false) {

    const author = post.author;

    const postTitle = typeof post.title === "string" && post.title.trim() !== ""
        ? `<h5>${post.title}</h5>`
        : "";

    const check = typeof post.image === "string" && post.image.trim() !== ""
        ? `<img class="w-100" src="${post.image}" alt="post image"
        onerror="this.remove()">`
        : "";

    const authorAvatarHTML =
        typeof author.profile_image === "string" && author.profile_image.trim() !== ""
            ? `<img src="${author.profile_image}"
            class="rounded-circle me-2"
            style="width: 40px; height: 40px; object-fit: cover;"
            alt="profile image"
            onerror="this.outerHTML='<span class=\\'rounded-circle me-2 d-flex align-items-center justify-content-center\\' style=\\'width:40px;height:40px;background-color:#d9e8de;color:#285b43;font-weight:bold;flex-shrink:0;\\'>${author.username.charAt(0).toUpperCase()}</span>'">`
            : `<span class="rounded-circle me-2 d-flex align-items-center justify-content-center"
            style="width: 40px; height: 40px; background-color: #d9e8de; color: #285b43; font-weight: bold; flex-shrink: 0;">
            ${author.username.charAt(0).toUpperCase()}
            </span>`;

    const commentsCount = post.comments_count ?? 0;

    const editButton = `
        <button type="button" class="btn btn-sm btn-outline-primary edit-post-btn"
            data-post-id="${post.id}"
            style="display: none;">
            Edit
        </button>
    `;

    const deleteButton = `
        <button type="button" class="btn btn-sm btn-outline-danger delete-post-btn"
            data-post-id="${post.id}"
            style="display: none;">
            Delete
        </button>
    `;

    const buttons = `
    <div class="d-flex gap-2">
        ${editButton}
        ${deleteButton}
    </div>`;

    const commentsBtn = `
    <button type="button"
        class="btn btn-sm btn-outline-primary view-comments-btn d-none"
        onclick="postClicked(${post.id})">
        View Comments
    </button>
`;

    return `
        <div class="card fg-post-card mb-4 p-card">

            <div class="card-header fg-card-header d-flex align-items-center justify-content-between">

                <div class="d-flex align-items-center" onclick="userClicked(event, ${author.id})"
                    style="cursor: pointer">
                    ${authorAvatarHTML}
                    <span class="fg-username fw-bold">${author.username}</span>
                </div>

                <small class="text-muted">${post.created_at}</small>
                ${buttons}
                ${commentsBtn}

            </div>

            ${check}

            <div class="card-body">
                ${postTitle}
                <p>${post.body}</p>
            </div>

            <hr>

            <div class="mt-3">
                <span class="text-muted">
                    <i class="bi bi-chat"></i>
                    ${commentsCount} Comments
                </span>
            </div>

        </div>
    `;
}


// PAGINATION

let currentPage = 1;
let lastPage = 1;
let isLoading = false;


// INFINITE SCROLL

window.addEventListener("scroll", function() {

    const endOfPage =
        window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 100;

    if (endOfPage && currentPage < lastPage && !isLoading) {

        currentPage++;
        getPosts(false, currentPage);

    }

});


// GET POSTS

let allPosts = [];
let postId = null;


function getPosts(reload = true, page = 1) {

    isLoading = true;

    axios.get(`${API.posts()}?limit=6&page=${page}`)

    .then(response => {

        const posts = response.data.data;
        lastPage = response.data.meta.last_page;

        const postsContainer = document.getElementById("posts");


        // STORE POSTS

        if (reload) {
            allPosts = posts;
        } else {
            allPosts = allPosts.concat(posts);
        }


        if (postsContainer) {

            let allPostsHTML = "";

            for (let post of posts) {
                allPostsHTML += createPostHTML(post);
            }


            // DISPLAY POSTS

            if (reload) {
                postsContainer.innerHTML = allPostsHTML;
            } else {
                postsContainer.innerHTML += allPostsHTML;
            }


            // SHOW COMMENTS BUTTONS

            const commentsButtons = postsContainer.querySelectorAll(".view-comments-btn");

            commentsButtons.forEach(button => {
                button.classList.remove("d-none");
            });


            // EDIT & DELETE BUTTONS

            const storedUser = JSON.parse(localStorage.getItem("user") || "null");

            const editPostBtn = document.querySelectorAll(".edit-post-btn");

            editPostBtn.forEach(button => {

                const currentPostId = button.dataset.postId;

                const post = allPosts.find(post => post.id == currentPostId);

                if (storedUser && post && post.author.id == storedUser.id) {
                    button.style.display = "inline-block";
                }

                button.addEventListener("click", function(e) {

                    e.stopPropagation();

                    postId = button.dataset.postId;

                    const selectedPost = allPosts.find(post => post.id == postId);

                    if (!selectedPost) return;

                    document.getElementById("create-post-label").innerHTML = "Edit Post";
                    document.getElementById("cr-btn").innerHTML = "Edit Post";

                    document.getElementById("postTitle").value = selectedPost.title || "";
                    document.getElementById("post-body").value = selectedPost.body || "";

                    const modalElement = document.getElementById("create-post-modal");

                    const postModal = bootstrap.Modal.getOrCreateInstance(modalElement);

                    postModal.show();

                });

            });


            const deletePostBtn = document.querySelectorAll(".delete-post-btn");

            deletePostBtn.forEach(button => {

                const currentPostId = button.dataset.postId;

                const post = allPosts.find(post => post.id == currentPostId);

                if (storedUser && post && post.author.id == storedUser.id) {
                    button.style.display = "inline-block";
                }

                button.addEventListener("click", function(e) {

                    e.stopPropagation();

                    postId = button.dataset.postId;

                    const modalElement = document.getElementById("delete-modal");

                    const postModal = bootstrap.Modal.getOrCreateInstance(modalElement);

                    postModal.show();

                });

            });

        }


        // LATEST POSTS

        if (reload) {

            const latestPosts = posts.slice(0, 3);

            const container = document.getElementById("latest-posts");

            if (container) {

                let latestP = "";

                latestPosts.forEach(post => {
                    latestP += createPostHTML(post, true);
                });

                container.innerHTML = latestP;

            }

        }

        isLoading = false;

    })

    .catch(error => {

        console.log(error);

        const message = error.response?.data?.message || "Could not load posts.";
        showAlert(message, "danger");

        isLoading = false;

    });

}


getPosts();


// SHOW SAVED DELETE ALERT AFTER REDIRECT

const savedAlert = sessionStorage.getItem("postAlert");

if (savedAlert) {

    showAlert(savedAlert, "success");

    sessionStorage.removeItem("postAlert");

}


// OPEN CREATE POST MODAL

const params = new URLSearchParams(window.location.search);

if (params.get("createPost") === "true") {

    const createModalElement = document.getElementById("create-post-modal");

    const createModal = new bootstrap.Modal(createModalElement);

    document.getElementById("create-post-label").innerHTML = "Create a Post";
    document.getElementById("cr-btn").innerHTML = "Create Post";

    createModal.show();

}


// CREATE OR EDIT POST

const createPostForm = document.getElementById("create-form");

if (createPostForm) {

    createPostForm.addEventListener("submit", function(e) {

        e.preventDefault();

        const postImage = document.getElementById("post-image").files[0];

        const postTitle = document.getElementById("postTitle").value;

        const postBody = document.getElementById("post-body").value;

        const token = localStorage.getItem("token");

        const headers = {
            authorization: `Bearer ${token}`
        };


        // EDIT POST

        if (postId !== null) {

            axios.put(API.post(postId), {
                title: postTitle,
                body: postBody
            }, {
                headers: headers
            })

            .then(() => {

                const modalElement = document.getElementById("create-post-modal");

                const modalInstance = bootstrap.Modal.getInstance(modalElement);

                modalInstance.hide();

                postId = null;

                createPostForm.reset();

                document.getElementById("create-post-label").innerHTML = "Create a Post";
                document.getElementById("cr-btn").innerHTML = "Create Post";


                // UPDATE POST DETAILS PAGE

                if (document.getElementById("currentPost")) {
                    getPostDetails();
                }


                // UPDATE POSTS PAGE

                if (document.getElementById("posts")) {
                    currentPage = 1;
                    getPosts();
                }


                // UPDATE PROFILE PAGE

                if (document.getElementById("user-posts")) {
                    getPosts();
                }

                showAlert("Post updated successfully!", "success");

            })

            .catch(error => {

                console.log(error);

                const message = error.response?.data?.message || "Could not update post.";
                showAlert(message, "danger");

            });


        } else {


            // CREATE POST

            const formData = new FormData();

            formData.append("title", postTitle);

            formData.append("body", postBody);

            if (postImage) {
                formData.append("image", postImage);
            }

            axios.post(API.posts(), formData, {
                headers: headers
            })

            .then(() => {

                const modalElement = document.getElementById("create-post-modal");

                const modalInstance = bootstrap.Modal.getInstance(modalElement);

                modalInstance.hide();

                createPostForm.reset();

                document.getElementById("create-post-label").innerHTML = "Create a Post";
                document.getElementById("cr-btn").innerHTML = "Create Post";

                currentPage = 1;
                getPosts();

                showAlert("Post created successfully!", "success");

            })

            .catch(error => {

                console.log(error);

                const message = error.response?.data?.message || "Could not create post.";
                showAlert(message, "danger");

            });

        }

    });

}


// DELETE POST

function deletePost(id) {

    const token = localStorage.getItem("token");

    const headers = {
        authorization: `Bearer ${token}`
    };

    axios.delete(API.post(id), { headers: headers })

    .then(() => {

        const modalElement = document.getElementById("delete-modal");

        const modalInstance = bootstrap.Modal.getInstance(modalElement);

        modalInstance.hide();

        postId = null;

        if (document.getElementById("currentPost")) {

            sessionStorage.setItem("postAlert", "Post deleted successfully!");

            window.location.href = "posts.html";

        } else {

            showAlert("Post deleted successfully!", "success");

            if (document.getElementById("posts")) {
                currentPage = 1;
            }

            getPosts();

            // PROFILE PAGE: refresh the posts / comments counters too
            if (document.getElementById("user-posts")) {
                getUser();
            }

        }

    })

    .catch(error => {

        console.log(error);

        const message = error.response?.data?.message || "Could not delete the post.";
        showAlert(message, "danger");

    });

}


const deleteBtn = document.getElementById("delete-btn");

if (deleteBtn) {

    deleteBtn.addEventListener("click", function() {

        deletePost(postId);

    });

}


// RESET MODAL WHEN CLOSED

const createPostModal = document.getElementById("create-post-modal");

if (createPostModal) {

    createPostModal.addEventListener("hidden.bs.modal", function() {

        postId = null;

        createPostForm?.reset();

        document.getElementById("create-post-label").innerHTML = "Create a Post";
        document.getElementById("cr-btn").innerHTML = "Create Post";

    });

}


// GET POST DETAILS

function getPostDetails() {

    const postUsername = document.getElementById("postUsername");

    const currentPost = document.getElementById("currentPost");

    const urlParams = new URLSearchParams(window.location.search);

    const id = urlParams.get("postId");

    axios.get(API.post(id))

    .then(response => {

        const post = response.data.data;

        const comments = post.comments;

        postUsername.innerHTML = `${post.author.username}'s Post`;

        currentPost.innerHTML = createPostHTML(post);


        // EDIT & DELETE POST BUTTONS IN DETAILS PAGE

        const storedUser = JSON.parse(localStorage.getItem("user") || "null");

        const editButton = currentPost.querySelector(".edit-post-btn");

        const deleteButton = currentPost.querySelector(".delete-post-btn");


        if (storedUser && post.author.id == storedUser.id) {


            // EDIT BUTTON

            if (editButton) {

                editButton.style.display = "inline-block";

                editButton.addEventListener("click", function(e) {

                    e.stopPropagation();

                    postId = post.id;

                    document.getElementById("create-post-label").innerHTML = "Edit Post";
                    document.getElementById("cr-btn").innerHTML = "Edit Post";

                    document.getElementById("postTitle").value = post.title || "";
                    document.getElementById("post-body").value = post.body || "";

                    const modalElement = document.getElementById("create-post-modal");

                    const postModal = bootstrap.Modal.getOrCreateInstance(modalElement);

                    postModal.show();

                });

            }


            // DELETE BUTTON

            if (deleteButton) {

                deleteButton.style.display = "inline-block";

                deleteButton.addEventListener("click", function(e) {

                    e.stopPropagation();

                    postId = post.id;

                    const modalElement = document.getElementById("delete-modal");

                    const postModal = bootstrap.Modal.getOrCreateInstance(modalElement);

                    postModal.show();

                });

            }

        }


        createCommentsHTML(comments);

        setupUI();

    })

    .catch(error => {

        console.log(error);

        const message = error.response?.data?.message || "Could not load post details.";
        showAlert(message, "danger");

    });

}


if (document.getElementById("currentPost")) {
    getPostDetails();
}


// POST CLICKED

function postClicked(postId) {

    window.location.href = `post_details.html?postId=${postId}`;

}


// CREATE COMMENTS HTML

function createCommentsHTML(comments) {

    let commentsContainer = document.getElementById("comments-container");

    commentsContainer.innerHTML = "";

    for (let comment of comments) {

        commentsContainer.innerHTML += `
            <div>
                <img src="${comment.author.profile_image}"
                    class="rounded-circle me-2"
                    style="width: 40px; height: 40px; object-fit: cover;"
                    alt="profile image"
                    onerror="this.outerHTML='<span class=\\'rounded-circle me-2 d-flex align-items-center justify-content-center\\' style=\\'width:40px;height:40px;background-color:#d9e8de;color:#285b43;font-weight:bold;flex-shrink:0;\\'>${comment.author.username.charAt(0).toUpperCase()}</span>'">

                <b>${comment.author.username}</b>
            </div>

            <div>${comment.body}</div>
        `;

    }

}


// ADD COMMENT

const addCommentForm = document.getElementById("addCommentForm");

if (addCommentForm) {

    addCommentForm.addEventListener("submit", function(e) {

        e.preventDefault();

        const addComment = document.getElementById("addComment").value;

        const urlParams = new URLSearchParams(window.location.search);

        const id = urlParams.get("postId");

        const token = localStorage.getItem("token");

        axios.post(API.comments(id), {
            body: addComment
        }, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })

        .then(() => {

            document.getElementById("addComment").value = "";

            getPostDetails();

        })

        .catch(error => {

            console.log(error);

            const message = error.response?.data?.message || "Could not add comment.";
            showAlert(message, "danger");

        });

    });

}


function userClicked(event, userId) {

    event.stopPropagation();

    window.location = `profile.html?userId=${userId}`;

}