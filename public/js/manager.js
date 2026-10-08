const mainContainer = document.getElementById("main-content");

mainContainer.innerHTML="";


export function roomStatus() {
    const getRoomStatus = '/api/auditoriums/1/status';

    fetch(getRoomStatus)
        .then(response => response.json())
        .then(data => console.log(data));
}
roomStatus();
