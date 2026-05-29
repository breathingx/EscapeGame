const params = new URLSearchParams(window.location.search);

const type = params.get("type");
const team = params.get("team");

const titel = document.getElementById("uitlegTitel");
const tekst = document.getElementById("uitlegTekst");
const buttonContainer = document.getElementById("buttonContainer");



if (type === "algemeen") {

    titel.textContent = "Jullie missie";

    tekst.innerHTML = `

            <p>
                De muziekmachine is uit elkaar gehaald!
            </p>

            <p>
                De dief had haast en nam alleen de buitenkant mee. Hij dacht dat dát het waardevolst was…
            </p>

            <p>
                Maar zonder binnenwerk en onderdelen ontstaat er geen muziek en geen beweging.
            </p>

            <p>
                Daar komt hij snel achter. En dan komt hij terug!
            </p>

            <p>
                Maar gelukkig zijn jullie er.
            </p>

            <p>
                De klankbron, programmadrager en aandrijving herken je alleen als je weet hoe een muziekmachine werkt.
            </p>

            <p>
                Daarom moeten jullie experts worden.
            </p>
    `;

    buttonContainer.innerHTML = `
        <button onclick="window.location.href='../QRScanner/qrScanner.html'">
            QR Kies je Team
        </button>

        <button onclick="window.location.href='../home.html'">
            Knop Kies je Team
        </button>
    `;
}



if (type === "team") {

    const teamTeksten = {

        aandrijving: `
            <p>
                Jullie zijn team Aandrijving.
            </p>

            <p>
                Zorg ervoor dat je straks alles weet over muziek en klank, zodat je de juiste klankbron herkent, voordat de dief terug is!
            </p>

            <p>
                Zodra je op START drukt loopt de tijd. Zijn jullie klaar?
            </p>
        `,

        programma: `
            <p>
                Jullie zijn team Programma.
            </p>

            <p>
                Muziekmachines volgen verborgen instructies.
            </p>

            <p>
                Zodra je op START drukt loopt de tijd. Zijn jullie klaar?
            </p>
        `,

        klankbron: `
            <p>
                Jullie zijn team Klankbron.
            </p>

            <p>
                Zonder klank ontstaat geen muziek.
            </p>

            <p>
                Zodra je op START drukt loopt de tijd. Zijn jullie klaar?
            </p>
        `
    };

    titel.textContent =
        "Team: " +
        team.charAt(0).toUpperCase() +
        team.slice(1);

    tekst.innerHTML = teamTeksten[team];

    buttonContainer.innerHTML = `
        <button onclick="window.location.href='../template.html'">
            START
        </button>
    `;
}