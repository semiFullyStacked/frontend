# Smart bio – Frontend

Frontend til **Smart bio**, systemet til en lokal biograf. Frontenden er en statisk single-page-applikation (SPA), der serveres af **nginx**, og som taler med Smart bio-backenden via en reverse proxy.

Backenden findes i et separat repository: [semiFullyStacked/backend](https://github.com/semiFullyStacked/backend).

Link til frontenden: [frontend](https://frontend.gentlesmoke-03ba2725.swedencentral.azurecontainerapps.io/#/)

## Sådan hænger det sammen

```
.
├── .github/workflows/   # CI/CD-workflows (GitHub Actions)
├── public/              # Selve websitet (statiske filer)
│   ├── index.html       # Eneste HTML-side (SPA)
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── main.js          # Applikationens indgangspunkt
│       ├── routes.js        # Routing mellem visninger
│       ├── homepage.js      # Forsiden
│       ├── auth/            # login.js, logout.js
│       ├── employee/        # auditoriumManagement.js, bookingsearch.js,
│       │                    # employee-page.js, employeeManagement.js
│       ├── errors/          # 403.js
│       ├── helpers/         # api.js, csrf.js, date-format.js
│       ├── management/      # manager.js, profile.js
│       └── payment/         # seatpicker.js, checkout.js, ticket.js
├── Dockerfile           # nginx-image med site og konfiguration
├── compose.yml          # Kør frontenden med Docker Compose
├── nginx.conf           # Serverkonfiguration og proxy-regler
```

- Alle statiske filer (HTML, CSS, JavaScript) ligger i `public/` og serveres direkte af nginx.
- Ukendte stier falder tilbage til `index.html`, så SPA'ens routing virker, også ved direkte link eller opdatering af siden.
- Kald til `/api`, `/login`, `/logout` og `/error` sendes videre til backend-containeren. Nginx sætter headerne `X-Real-IP`, `X-Forwarded-Host` og `X-Forwarded-Proto`, så backenden kender den oprindelige klient.

Fordi browseren kun taler med én adresse, undgår man CORS-problemer.

## Projektstruktur

```
.
├── .github/workflows/   # CI/CD-workflows (GitHub Actions)
├── public/              # Selve websitet (statiske filer)
├── .env-example         # Eksempel på miljøvariabel
├── Dockerfile           # nginx-image med site og konfiguration
├── compose.yml          # Kør frontenden med Docker Compose
├── nginx.conf           # Serverkonfiguration og proxy-regler
└── docs.md              # Reserveret til dokumentation (tom indtil videre)
```

## Kom i gang

### Forudsætninger

- Docker og Docker Compose
- Backenden kørende i en container ved navn `backend` på det delte netværk `app-net`

### Kør med Docker Compose

1. Opret det delte netværk, hvis det ikke allerede findes (det bruges også af backenden):

   ```bash
   docker network create app-net
   ```

2. Start backenden (se backend-repositoriet).

3. Start frontenden:

   ```bash
   docker compose -f compose.yml up
   ```

Websitet er derefter tilgængeligt på http://localhost (port 80).

I denne opsætning monteres `public/` og `nginx.conf` direkte ind i containeren som skrivebeskyttede volumener. Ændringer i filerne slår derfor igennem med det samme, uden at du behøver bygge et nyt image.

### Byg et selvstændigt image

`Dockerfile` bygger et image baseret på `nginx:alpine`, hvor `public/` og `nginx.conf` er kopieret ind:

```bash
docker build -t smartbio-frontend .
```

Containeren lytter på port 80.

## Konfiguration

| Fil | Formål |
|---|---|
| `nginx.conf` | Statisk hosting, SPA-fallback og proxy-regler til backenden |
| `.env-example` | Indeholder variablen `proxy_pass` (adressen på backenden) |

Backend-adressen i `nginx.conf` er `http://backend`. Derfor skal backend-containeren hedde `backend` så den kan nås fra frontend-containeren på netværket `app-net`.
