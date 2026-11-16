// config.js
const API = {
    BASE_URL: "https://tarmeezacademy.com/api/v1",
    posts: function() { return `${this.BASE_URL}/posts`; },
    post: function(id) {
    return `${this.BASE_URL}/posts/${id}`;},
    login: function() { return `${this.BASE_URL}/login`; },
    register: function() { return `${this.BASE_URL}/register`; },
    comments: function(id) {
    return `${this.BASE_URL}/posts/${id}/comments`;},
    user: function(id){
        return `${this.BASE_URL}/users/${id}`;}

};