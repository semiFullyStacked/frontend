const mainContainer = document.getElementById("content");

mainContainer.innerHTML="";


export function roomStatus() {
    const getRoomStatus = '/api/auditoriums/1/status';
    const data = fetch(getRoomStatus)
        .then(response => response.json())
        .then(data => console.log(data));


}
//roomStatus();