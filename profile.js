const profileParams = new URLSearchParams(window.location.search);
const userId = profileParams.get("userId");

let userPosts = [];
let profilePostId = null;


// GET USER

getUser();
setupUI();
getPosts();


function getUser() {

    axios.get(API.user(userId))

    .then((response) => {

        const user = response.data.data;

        if (typeof user.profile_image === "string" && user.profile_image.trim() !== "") {
            document.getElementById("profile-img").src = user.profile_image;
        }

        document.getElementById("user-email").innerHTML = user.email;
        document.getElementById("user-name").innerHTML = user.name;
        document.getElementById("user-userName").innerHTML = user.username;
        document.getElementById("user-posts_counts").innerHTML = user.posts_count;
        document.getElementById("user-commentsCount").innerHTML = user.comments_count;
        document.getElementById("name-posts").innerHTML = `${user.username}'s Posts`;

        console.log(user.profile_image);

    })

    .catch(error => {
        console.log(error);
        showAlert(error.response?.data?.message || "Could not load user profile.", "danger");
    });

}


// GET USER POSTS

function getPosts() {

    axios.get(API.posts())

    .then(response => {

        const posts = response.data.data.filter(post => post.author.id == userId);

        userPosts = posts;

        const postsContainer = document.getElementById("user-posts");

        if (postsContainer) {

            let allPostsHTML = "";

            for (let post of posts) {
                allPostsHTML += createPostHTML(post);
            }

            postsContainer.innerHTML = allPostsHTML;


            // EDIT & DELETE POST BUTTONS

            const storedUser = JSON.parse(localStorage.getItem("user") || "null");


            // EDIT POST BUTTON

            const editPostBtn = postsContainer.querySelectorAll(".edit-post-btn");

            editPostBtn.forEach(button => {

                const currentPostId = button.dataset.postId;

                const post = userPosts.find(post => post.id == currentPostId);

                if (storedUser && post && post.author.id == storedUser.id) {

                    button.style.display = "inline-block";

                }

                button.addEventListener("click", function(e) {

                    e.stopPropagation();

                    profilePostId = button.dataset.postId;

                    const selectedPost = userPosts.find(post => post.id == profilePostId);

                    if (!selectedPost) return;

                    // SET EDIT MODAL

                    postId = profilePostId;

                    document.getElementById("create-post-label").innerHTML = "Edit Post";
                    document.getElementById("cr-btn").innerHTML = "Edit Post";

                    document.getElementById("postTitle").value = selectedPost.title || "";
                    document.getElementById("post-body").value = selectedPost.body || "";

                    const modalElement = document.getElementById("create-post-modal");

                    const postModal = bootstrap.Modal.getOrCreateInstance(modalElement);

                    postModal.show();

                });

            });


            // DELETE POST BUTTON

            const deletePostBtn = postsContainer.querySelectorAll(".delete-post-btn");

            deletePostBtn.forEach(button => {

                const currentPostId = button.dataset.postId;

                const post = userPosts.find(post => post.id == currentPostId);

                if (storedUser && post && post.author.id == storedUser.id) {

                    button.style.display = "inline-block";

                }

                button.addEventListener("click", function(e) {

                    e.stopPropagation();

                    profilePostId = button.dataset.postId;

                    postId = profilePostId;

                    const modalElement = document.getElementById("delete-modal");

                    const postModal = bootstrap.Modal.getOrCreateInstance(modalElement);

                    postModal.show();

                });

            });

        }

    })

    .catch(error => {

        console.log(error);
        showAlert(error.response?.data?.message || "Something went wrong while loading posts.", "danger");

    });

}