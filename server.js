const express = require('express') //importujemy środowisko express.js, require to odpowiednik pythonowego import

const app = express() //tworzymy instancje respondera, w jednym skrypcie możemy mieć wiele responderów które pracują na róznych portach
                      //responder to zestaw funkcji obsługujący zapytania na danym porcie (ta liczba po : w linku np. localhost:3000)

const port = 3000     //nasz port, w warunkach produkcyjnych będzie to 80 dla nieszyfrowanego HTTP i 443 dla szyfrowanego HTTP over TLS (HTTPS)
                      //nasz serwer bedzie dostepny jedynie lokalnie wiec by uprościć jego kod, użyjemy wariantu bez szyfrowania.
                      //HTTPS wymaga certyfikacji i wymiany kluczy publicznych z podpisem cyfrowym. Taki przepływ handshakeu jest wykonalny w expressie ale to zbedne dla nas utrudnienie
                    
/*express.js bazuje na idei "middlewares". Polega ona na tym że gdy serwer odbiera zapytanie, przechodzi ono kolejno przez wszystkie zarejestrowane middlewares.
  middleware to po prostu funkcja która ma dostęp do trzech zmiennych.
  req -  zawiera dane o zapytaniu (nagłówki,body (te dane po pustej linii)) dostępne jako obiekt, middlewares mogą dodawać do tej zmiennej wartości które będą dostępne
         dla kolejnych. w naszym przykładzie stworzymy middleware które sprawdzi czy w body zapytania znajduje sie słowo stefan po czym zapisze wynik tego sprawdzenia w zmiennej req.stefanpresent
         kolejne middlewares będą w stanie łatwo uzyskać tą informacje po prostu sprawdzając zawartość req.stefanpresent

  res -  obiekt zawiera funkcje potrzebne do odpowiedzenia na nasze zapytanie, dzieki niemu możemy ustawić kod odpowiedzi (200,400,404,500),
         nagłówki odpowiedzi oraz jej treść

  next() - używana by zmusić expressjs do przejścia do kolejnego middleware.
           np mamy middleware który dekoduje JSON jeżeli header content-type jest ustawiony na application/json. Jeżeli wartość tego headera jest inny (inny typ danych)
           to wykonujemy next() by przejść do kolejnego middleware bo nie mamy czego dekodować

  express posiada wbudowane middlewares, np. app.get('/sciezka',(req,res)=>{}) pozwala pewnej funkcji obsłużyć zapytanie typu GET na określonej ścieżce
  wykona ono funkcje gdy scieżka zapytania jest równa '/sciezka' i typ zapytania to GET,
  jeżeli ścieżka będzie inna lub typ zapytania bedzie inny to middleware wykona next() i przejdzie do kolejnego middleware
  app.post() działa analogicznie do app.get() ale odpowiada tylko na POST
  jest jeszcze app.use(express.static('www')), to middleware stawiamy na końcu w kolejności. Ono sprawdzi czy ścieżka zapytania istnieje w folderze
  i jeżeli znalazł plik to poda go w opdowiedzi. inaczej wywoła next(). 
  Jeżeli żadne z middlewares nie wyśle odpowiedzi - automatycznie odsyłana jest pusta odpowiedź z kodem 404 Not Found
*/

app.use(express.text()) //jeżeli content-type: plain/text to to middleware zdekoduje dane binarne do stringa i zapisze je pod req.body

app.use((req,res,next) => {
  if(req.method !== 'POST' && typeof req.body !== 'string') next() //middleware sprawdza body więc jeżeli zapytanie nie jest POST (nie wspiera body) lub body jest puste, pomijamy sprawdzenia i przechodzimy dalej
  req.stefanpresent = req.body.toLowerCase().includes('stefan') //używamy toLowerCase by nie musieć osobno sprawdzać róznych wariantów np Stefan, StEfAn, STEFAN
  next()
})

app.post('/', (req, res) => { //ta funkcja wykona sie tylko jeśli sciezka zapytania to "/" a jego typ to POST
  if(req.stefanpresent){ //używamy danych z naszego custom middleware
    res.send('Hello Kot!') // res.send wysyła podany tekst jako body odpowiedzi. Domyślnie odsyłany jest kod 200 OK
  }else{
    res.status(400).send("Bad request\nThis server does not accept kotless requests on this endpoint") //tutaj dodajemy kod 400 Bad Request
  }
})

app.use(express.static('www')) //jeżeli zapytanie ma typ GET i ścieżka zapytania istnieje w folderze www to middleware zwróci plik na tej ścieżce

//jeżeli ścieżka zapytania nie pasuje ani do naszego dynamicznego middleware ani do plików statycznych to serwer jako że przeszedł przez wszystkie middleware bez wyslania odpowiedzi automatycznie odpowie kodem 404 not found

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})