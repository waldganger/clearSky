'use strict'

let temperatureDegree = document.querySelector(".temperature-degree");
let pluie = document.querySelector(".pluie-mm");
let ventMoyen = document.querySelector(".vent-moyen");
let ventRafales = document.querySelector(".vent-rafales");
let pression = document.querySelector(".pression-hp");

// Permet de cibler la bonne heure dans les prévisions json qui sont faites toutes les 3h
// Cherche l'heure la plus proche, et la retourne formatée
function provideDate() {
  let result = "";
  const now = new Date();
  result = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${provideHour(now.getHours())}:00:00`
  
  return result;
}

function provideHour(reference) {
  for (let i = 2; i < 25; i +=3) {
    if (Math.abs(i - reference) <= 1) return i;
  }
}


window.addEventListener('load', () => {
    let long;
    let lat;
// ( async () => {
//         let response = await navigator.permissions.query({name: 'geolocation'});
//         if (response.state !== "granted") document.body.querySelector('h1').textContent = "Votre navigateur ne dispose pas de la géolocalisation !"
//     } 
//     )();

// navigator.permissions.query({'name': 'geolocation'}).then(response => {
//     console.log(response.state)
//     if (response.state !== "denied") {
//         document.body.querySelector('h1').textContent = "Anglet"}}
//     )

    navigator.geolocation.getCurrentPosition( position => {
        console.log(position)
        long = position.coords.longitude;
        lat = position.coords.latitude;

        // const proxy = "https://cors-anywhere.herokuapp.com/"         // Err 429 : too many requests :(
        // passe par un serveur local (cors-anywhere)
        const proxy = "http:/localhost:8080/";
        const url = `${proxy}https://www.infoclimat.fr/public-api/gfs/json?_ll=${lat},${long}&_auth=BhxTRFMtAyEHKlNkAHZReABoADVcKlRzC3dRMl04BHkDaFIzUjIEYlI8USwDLFBmWHVQM11mAzNTOAd%2FC3lTMgZsUz9TOANkB2hTNgAvUXoALgBhXHxUcwthUTddLgRmA2ZSN1IvBGRSPVE1Ay1QZlhrUC9dfQM6UzYHYAtkUzMGZlMxUzADaAdgUy4AL1FgAGUAaFxiVD4LbVEwXTIENgNpUjBSOAQ3UjlRLQMzUGZYblA3XWIDM1M2B2kLeVMvBhxTRFMtAyEHKlNkAHZReABmAD5cNw%3D%3D&_c=7c1cadaa546bd4edea56b0faf54a9fdb`
        fetch(url)
            .then(response => response.json())
            .then(data => {
    
                // Gather the good stuff
                const heure = provideDate();
                const temperatureCelsius = Math.floor(data[heure].temperature["2m"] - 273.15);
                const nebulositePCent = data[heure].nebulosite.totale;
                const pluieMm = Math.floor(data[heure].pluie / 3);
                const risqueNeige = data[heure].risque_neige;
                const ventMoyenKmH = Math.floor(data[heure].vent_moyen["10m"]);
                const ventRafalesKmH = Math.floor(data[heure].vent_rafales["10m"]);
                const pressionHPascal = Math.floor(data[heure].pression.niveau_de_la_mer / 100)

                console.log(`Prévision pour : ${heure}`);
                console.log(`Température : ${temperatureCelsius}`);
                console.log(`Pluie : ${pluieMm}`);
                console.log(`Risque de neige : ${risqueNeige}`);
                console.log(`Vent moyen : ${ventMoyenKmH}`);
                console.log(`Rafales : ${ventRafalesKmH}`);
                console.log(`Pression (hp) : ${pressionHPascal}`);
                console.log(`Nébulosité totale : ${nebulositePCent}%`);
                console.log(`Type d'icône Skycon : ${provideIcon(nebulositePCent, pluieMm, ventRafalesKmH, risqueNeige)}`);

                // Update DOM elements from API
                temperatureDegree.textContent = temperatureCelsius;
                pluie.textContent = pluieMm;
                ventMoyen.textContent = ventMoyenKmH;
                ventRafales.textContent = ventRafalesKmH;
                pression.textContent = pressionHPascal;

                // Display the SkyIcon
                setIcons(
                    provideIcon(nebulositePCent, pluieMm, ventRafalesKmH, risqueNeige), 
                    document.querySelector(".icon")
                );
            })
            .then(() => document.body.querySelector('h1').textContent = "Anglet");
        

    });
    
    function provideIcon(nuages, precipitations, vent, neige){
        let heure = new Date().getHours();
        
        if (neige === "oui") {
            return "SNOW";
        } else if (precipitations > 3) {
            return "RAIN";
        } else if (vent > 60) {
            return "WIND"
        } else if ((heure >= 6 && heure <= 20) && (nuages > 20 && nuages > 60)) {
            return "PARTLY_CLOUDY_DAY";
        } else if ((heure < 6 && heure > 20) && (nuages > 20 && nuages > 60)) {
            return "PARTLY_CLOUDY_NIGHT";
        } else if ((heure >= 6 && heure <= 20) && (nuages <= 20)) {
            return "CLEAR_DAY";
        } else if ((heure < 6 && heure > 20) && (nuages <= 20)) {
            return "CLEAR_NIGHT";
        }
    }


    function setIcons(icon, domIconClass){
        const skycons = new Skycons({"color": "white"});
        skycons.play();
        return skycons.set(domIconClass, Skycons[icon]);
    } 

    

})