# PengePlanen - BudsjettApp

PengePlanen er en webapplikasjon designet for å hjelpe brukere med å få oversikt og kontroll over sin personlige økonomi. Applikasjonen lar brukere registrere inntekter og utgifter, sette opp budsjetter, visualisere økonomiske data gjennom grafer, og eksportere transaksjonsdata.

## Funksjoner

*   **Brukerautentisering:** Sikker registrering og innlogging for brukere.
*   **Transaksjonsbehandling:** Legg til, se og slett inntekter og utgifter.
*   **Dashbord:** Oversiktlig visning av total balanse, totale inntekter og totale utgifter for inneværende måned.
*   **Grafisk Fremstilling:**
    *   Søylediagram for "Inntekter vs Utgifter".
    *   Smultringdiagram for "Utgifter per kategori".
    *   Søylediagram for "Budsjettfremgang" som viser brukt beløp mot satte budsjettgrenser per kategori.
*   **Detaljert Transaksjonsvisning:** Modal for å se detaljerte utgifter per kategori.
*   **Budsjettinnstillinger:** Sett månedlige budsjettgrenser for ulike kategorier.
*   **Varsler:** Motta varsler på dashbordet hvis budsjettgrenser overskrides.
*   **Dataeksport:** Eksporter transaksjonshistorikk til PDF og CSV.
*   **Profilside:** Se grunnleggende brukerinformasjon.
*   **Responsivt Design:** Tilpasset for bruk på ulike skjermstørrelser.

## Teknologi og Verktøy

*   **Frontend:**
    *   EJS (Embedded JavaScript templates)
    *   Tailwind CSS (for styling)
    *   Chart.js (for grafer)
    *   Alpine.js (for enkel interaktivitet i navigasjonsmeny)
*   **Backend:**
    *   Node.js
    *   Express.js
*   **Database:**
    *   MongoDB (med Mongoose ODM)
*   **Autentisering & Sesjonshåndtering:**
    *   `bcryptjs` (for passord-hashing)
    *   `express-session`
    *   `connect-mongo` (for lagring av sesjoner i MongoDB)
*   **Annet:**
    *   `dotenv` (for miljøvariabler)
    *   `method-override` (for å bruke HTTP-verb som DELETE i skjemaer)
    *   `pdfkit` (for PDF-generering)
    *   `json-2-csv` (for CSV-generering)

## Oppsett og Kjøring Lokalt

1.  **Klon repositoriet:**
    ```bash
    git clone <din-repository-url>
    cd BudsjettApp
    ```

2.  **Installer avhengigheter:**
    ```bash
    npm install
    ```

3.  **Sett opp miljøvariabler:**
    Opprett en `.env`-fil i rotmappen til prosjektet og legg til nødvendige variabler. Minimumskrav er:
    ```env
    MONGODB_URI=mongodb://localhost:27017/budgetapp # Eller din MongoDB connection string
    SESSION_SECRET=dinenhemmelignøkkelher
    PORT=3000 # Valgfri, standard er 3000
    ```
    *Pass på at du har en MongoDB-instans kjørende.*

4.  **Kompiler Tailwind CSS (hvis du gjør endringer i `style.css`):**
    Prosjektet bruker en `watch:css`-script for å kompilere Tailwind CSS. For å starte denne i en egen terminal:
    ```bash
    npm run watch:css
    ```
    Dette vil overvåke endringer i `./public/css/style.css` og generere `./public/css/output.css`.

5.  **Start applikasjonen:**
    ```bash
    node server.js
    ```
    Eller hvis du bruker `nodemon` for utvikling:
    ```bash
    nodemon server.js
    ```
    Applikasjonen vil da være tilgjengelig på `http://localhost:3000` (eller porten du har satt i `.env`).

## Tilgjengelige Scripts

*   `npm run watch:css`: Overvåker og kompilerer Tailwind CSS-endringer.
*   `npm start` (hvis du legger til `"start": "node server.js"` i `package.json` `scripts`): Starter applikasjonen.
*   `npm test`: (Foreløpig ikke implementert)

## Fremtidig Arbeid (Potensielle Utvidelser)

*   Redigeringsfunksjonalitet for transaksjoner.
*   Mer avansert filtrering og sortering av transaksjonshistorikk.
*   Mulighet for å redigere profilinformasjon og endre passord.
*   Implementere "Slett konto"-funksjonalitet.
*   Støtte for gjentakende transaksjoner.
*   Mer detaljerte rapporter og statistikk.

---