//LOGIN
setupUI();
const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit",function(e){
    e.preventDefault();
    const loginUsername = document.getElementById("login-username").value;
    const loginPass = document.getElementById("login-pass").value;

    axios.post(API.login(), 
   {
        "username": loginUsername,
        "password": loginPass
    })
   .then((response) => {
        localStorage.setItem("token",response.data.token);
        localStorage.setItem("user",JSON.stringify(response.data.user));
        const modalElement = document.getElementById("login-modal");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
        setupUI();
        showAlert("Login successful! Welcome back.", "success");
     }).catch((error)=>{
          const message = error.response?.data?.message || "Something went wrong!";
          showAlert(message, "danger");
     })

})

//REGISTER 
setupUI();
const registerForm = document.getElementById("register-form");
registerForm.addEventListener("submit",function(e){
    e.preventDefault();
    const registerImage = document.getElementById("register-image").files[0];
    const registerName = document.getElementById("register-name").value;
    const registerUsername = document.getElementById("register-username").value;
    const registerEmail = document.getElementById("register-email").value;
    const registerPass = document.getElementById("register-pass").value;

     const formData = new FormData();
     formData.append("name", registerName);
     formData.append("username", registerUsername);
     formData.append("password", registerPass);
     formData.append("email", registerEmail);

     if (registerImage) {
          formData.append("image", registerImage);
     }


    axios.post(API.register(), formData)
     .then((response) => {
        localStorage.setItem("token",response.data.token);
        localStorage.setItem("user",JSON.stringify(response.data.user));
        const modalElement2 = document.getElementById("register-modal");
        const modalInstance = bootstrap.Modal.getInstance(modalElement2);
        modalInstance.hide();
        setupUI();
        showAlert("Account created successfully!", "success");

        
   }).catch((error)=>{
        alert(error.response.data.message);
          const message = error.response?.data?.message || "Something went wrong!";
          showAlert(message, "danger");
   })

})

function setupUI(){
     const token = localStorage.getItem("token");
     const loggedOutDiv = document.getElementById("logged-out-div");
     const loggedInDiv = document.getElementById("logged-in-div");

     const createPostBtns = document.getElementsByClassName("create-post-btn");

     for (const btn of createPostBtns) {
          if (token) { 
               btn.classList.remove("d-none");
          } else {
               btn.classList.add("d-none");
          }
     }

     const addCommentForm = document.getElementById("addCommentForm");

     if (addCommentForm) {
          if (token) {
               addCommentForm.classList.remove("d-none");
          } else {
               addCommentForm.classList.add("d-none");
          }
     }


     if (token) {
          loggedOutDiv.classList.add("d-none");
          loggedInDiv.classList.remove("d-none");
          const user = JSON.parse(localStorage.getItem("user"));

          const profileUrl = `profile.html?userId=${user.id}`;

          const profileLink = document.getElementById("profile-link");
          const navUserProfileLink = document.getElementById("nav-user-profile-link");

          if (profileLink) {
               profileLink.href = profileUrl;
          }

if (navUserProfileLink) {
    navUserProfileLink.href = profileUrl;
}
          const navUsername = document.getElementById("nav-username");
          const navUserImg = document.getElementById("nav-user-img");
          navUsername.textContent = user.username;
          const navUserLetter = document.getElementById("nav-user-letter");
          if(typeof user.profile_image === "string" && user.profile_image.trim() !== ""){
               navUserImg.src = user.profile_image;
               navUserLetter.classList.add("d-none");
               navUserImg.classList.remove("d-none");
          }
          else{
               navUserLetter.textContent = user.name.charAt(0);
               navUserLetter.classList.remove("d-none");
               navUserImg.classList.add("d-none");
          }

     }
     else{
          loggedOutDiv.classList.remove("d-none");
          loggedInDiv.classList.add("d-none");

}
}

const logoutBtn = document.getElementById("logout-btn");
function logout(){
     localStorage.removeItem("token");
     localStorage.removeItem("user");
     setupUI();
     showAlert("You have been logged out successfully.", "info");
}
logoutBtn.addEventListener("click",function(){
     logout();
})

function showAlert(message, type = "success") {
    const alertsContainer = document.getElementById("alerts");

    const alertElement = document.createElement("div");
    alertElement.className = `alert alert-${type} shadow`;
    alertElement.setAttribute("role", "alert");
    alertElement.textContent = message;

    alertsContainer.replaceChildren(alertElement);

    requestAnimationFrame(() => {
        alertElement.classList.add("show-alert");
    });

    setTimeout(() => {
        alertElement.classList.remove("show-alert");
        alertElement.classList.add("hide-alert");

        setTimeout(() => {
            alertElement.remove();
        }, 400);
    }, 3000);
}
