# TotaGoal — actus foot automatiques (branche `news`)

Branche légère (code + visuels du moment). Elle contient le générateur d'images/vidéos et la liste des actus déjà publiées.
Les fichiers générés vont dans `news/out/AAAA-MM-JJ/<id>/` et sont lus par Metricool via raw.githubusercontent.com.

## Générer
`node news/gen.js stories.json news/out/AAAA-MM-JJ` (Playwright + ffmpeg + polices Inter Display / JetBrains Mono).
Option `--only=video` ou `--only=carousel`. Par actu : `cover.jpg`, `essentiel.jpg`, `cta.jpg` (carrousel 4:5) et `video.mp4` (9:16, 14 s, musique générée par code, différente à chaque actu).

### Format d'une actu (stories.json = liste)
```json
{ "id": "havre-digard", "cat": "COACH", "bg": "carton",
  "title": "Ligue 1 : Le Havre [limoge Didier Digard], dernier et sans victoire",
  "deck": "Phrase d'explication (1-2 lignes).",
  "facts": ["Fait 1", "Fait 2", "Fait 3"], "src": "RMC Sport", "music": 3 }
```
- `cat` : ACTU, COACH, TRANSFERT, RÉSULTAT, LIGUE DES CHAMPIONS, INFO. `[mot]` dans le titre = mis en couleur.
- `bg` : `carton` (limogeage), `tactique` (tactique, départ), `maillot` (club ; `kit`: ["#couleur1","#couleur2"], `kit_stripes`: false pour un maillot uni), `podium` (leader, classement), `micro` (déclaration, conférence), `score` (résultat final ; `score`: {home, away, hs, as, label}), `contrat` (transfert), `trophee` (finale, titre), `logo` (autre).
- `music` : numéro 0-7 (tourne à chaque actu grâce au compteur `counters.music`).
- Titre : 90 caractères au mieux ; 3 faits courts, strictement tirés de la source.

## Règles de choix des actus (OBLIGATOIRES)
- Sources (flux RSS, tous testés et en direct le 02/11/2026 ; lire aussi l'article avant d'écrire si le résumé est mince) :
  - France : RMC Sport `https://rmcsport.bfmtv.com/football/` → `https://rmcsport.bfmtv.com/rss/football/`, Foot Mercato `https://www.footmercato.net/flux-rss`.
  - Angleterre / Europe : BBC Sport `https://feeds.bbci.co.uk/sport/football/rss.xml`, Sky Sports `https://www.skysports.com/rss/12040`, The Guardian `https://www.theguardian.com/football/rss`.
  - Espagne : Marca `https://e00-marca.uecdn.es/rss/futbol/primera-division.xml`, Mundo Deportivo `https://www.mundodeportivo.com/rss/futbol` (en espagnol : traduire fidèlement en français).
  - Allemagne : Kicker `https://newsfeed.kicker.de/news/fussball` (en allemand : traduire).
  - Monde (MLS, Amérique, Asie, sélections) : ESPN `https://www.espn.com/espn/rss/soccer/news`, CBS Sports `https://www.cbssports.com/rss/headlines/soccer/`.
  - Afrique : BBC Afrique `https://feeds.bbci.co.uk/afrique/rss.xml`, BBC Sport Afrique `https://feeds.bbci.co.uk/sport/africa/rss.xml`.
  - Presse française (testés en direct le 02/11/2026) : franceinfo foot `https://www.francetvinfo.fr/sports/foot.rss`, Le Figaro sport `https://www.lefigaro.fr/rss/figaro_sport.xml`, Le Monde football `https://www.lemonde.fr/football/rss_full.xml`, Le Parisien football `https://www.leparisien.fr/sports/football/rss.xml` (pas de pubDate : la date est dans l'URL, ex. 02-11-2026), 20 Minutes sport `https://www.20minutes.fr/feeds/rss-sport.xml`.
  - Flux RMC par thème : transferts `https://rmcsport.bfmtv.com/rss/football/transferts/`, Ligue 1 `.../ligue-1/`, Ligue des champions `.../ligue-des-champions/`, Premier League `.../premier-league/`.
  - beIN Sports, Canal+, L'Équipe : AUCUN flux accessible (404 ou accès refusé). Les utiliser seulement comme confirmation, avec WebSearch (allowed_domains lequipe.fr, beinsports.com, canalplus.com) : si leur titre confirme l'info, c'est une deuxième source valable à citer.
  - Ne marchent pas non plus : Foot Africa, Goal, Eurosport, So Foot, Maxifoot, Foot01, Onze Mondial. Gazzetta : flux périmé, ne pas l'utiliser.
- VARIÉTÉ : couvrir TOUS les championnats et le foot mondial, pas seulement la Ligue 1. Chaque passage lit au moins 6 flux de régions différentes. Noter `league` (ex. Ligue 1, Premier League, Liga, Serie A, Bundesliga, MLS, Brésil, Afrique, Ligue des champions, sélections, Coupe du monde) dans posted.json pour chaque actu ; pas plus de 2 actus de la même ligue par jour, et ne pas publier deux actus de suite de la même ligue. Les actus des autres pays valent autant que celles de France (un grand résultat, un entraîneur nommé ou limogé, un transfert officiel, un record, une compétition qui se joue).
- Actu de moins de 4 heures (pubDate), sinon ignorée. Jamais deux fois le même sujet (voir `state/posted.json`, comparer le club + la personne + le type, pas seulement l'URL).
- Uniquement des faits CONFIRMÉS : limogeage/nomination officielle, transfert officiel, résultat final, déclaration citée entre guillemets. Un départ ou transfert annoncé par un seul média, une « piste », « pourrait », « serait », « selon nos informations » = ignoré, sauf si au moins deux des trois sources le confirment (le titre doit alors dire « selon <média> »).
- Interdits : décès, blessure grave, procès, scandale, mineurs, politique, drame, violence, propos discriminatoires, rumeur, photo de joueur. Aucune promesse de gain, aucun conseil de pari.
- Tout chiffre ou nom vient de la source ; rien n'est inventé.
- NOUVEAUTÉ OBLIGATOIRE : chaque passage doit publier des infos NOUVELLES. Avant de choisir, relire `state/posted.json` : jamais le même sujet que les passages précédents (même club, même personne, même type d'événement). Un suivi du même sujet (ex. le successeur d'un entraîneur déjà traité) n'est permis que s'il apporte un fait nouveau et officiel, avec un autre titre et un autre visuel.
- L'événement lui-même doit dater des dernières 24 heures (lire la date dans l'article) : un flux RSS remet parfois en tête une vieille info (ex. un limogeage de samedi) ; dans ce cas, l'ignorer.
- Maximum 6 actus par jour (tous réseaux), 1 à 2 par passage, entre 08:00 et 22:00 (Europe/Paris).

## Rumeurs mercato (activées par le propriétaire, TikTok compris, à titre d'essai)
- Catégorie `RUMEUR` (pastille violette), `bg` `contrat` ou `logo`. Titre toujours au conditionnel et attribué : « selon <média 1> et <média 2> », jamais « X signe ». Le deck répète « rumeur, non confirmée ». `facts` : 3 faits tirés des articles, au conditionnel.
- Il faut AU MOINS DEUX des médias sources (RMC Sport, Foot Mercato, BBC Sport, ou tout autre média sérieux trouvé) qui reprennent la même rumeur le même jour. Une seule source = ignoré.
- Sujets permis : transfert, prêt, prolongation, arrivée ou départ d'entraîneur. Interdits : vie privée, santé, argent personnel, mineurs (moins de 18 ans), justice.
- Quota : 2 rumeurs par jour au maximum sur l'ensemble des réseaux, dont 1 au maximum sur TikTok ; elles comptent dans les 6 actus du jour. Jamais deux rumeurs de suite.
- Si une rumeur est confirmée ou démentie plus tard, ne PAS la republier ; une actu confirmée est traitée comme une actu normale.
- Texte du post : commence par « Rumeur : » et cite les deux médias.

## Règles TikTok (compte déjà averti : 3 strikes = bannissement)
- TikTok = vidéo uniquement, 3 par jour maximum, catégories COACH / TRANSFERT / INFO seulement.
- JAMAIS de résultats de matchs, de scores, de matchs à venir, d'avant-match, de calendrier, de classement, de programme.
- JAMAIS les mots : pronostic(s), pronostiquer, pari(s), parier, bet, betting, cote(s), mise, bookmaker, gagner de l'argent (dans le texte, le titre, les hashtags, et sur l'image). Relire le texte avant envoi. Hashtags : #foot #football #mercato #ligue1 maximum 4, sans mot interdit.

## Publication Metricool (blogId 6378704, fuseau Europe/Paris)
Réseaux : facebook, instagram, threads, linkedin, youtube, tiktok, pinterest. X (provider "twitter") et Bluesky : à utiliser SEULEMENT s'ils apparaissent dans networksData de la marque 6378704 (getBrandSettings) ; sinon les ignorer sans erreur.
- Heure : maintenant + 10 minutes (jamais dans le passé). Texte court en français : 1 phrase + « 👉 totagoal.com » + 3 à 5 hashtags.
- YouTube : toujours la vidéo (`youtubeData` {title ≤ 90 car. + « #Shorts », type "short", privacy "public", madeForKids false, category "SPORTS", isAiGeneratedContent false}).
- TikTok : vidéo (règles ci-dessus). `tiktokData` {privacyOption PUBLIC_TO_EVERYONE, title = début du texte, 90 car. max}.
- Instagram : toujours un Reel (vidéo) — `instagramData` {type REEL, showReelOnFeed true, isAiGenerated false}.
- Facebook, Threads, LinkedIn : on ALTERNE carrousel / vidéo d'une actu à l'autre (compteur `counters.alt` : pair = carrousel, impair = vidéo). Carrousel = media [cover, essentiel, cta] en .jpg ; Facebook `facebookData` {type POST} ou {type REEL, title} pour la vidéo ; LinkedIn `linkedinData` {type post, previewIncluded true} ; Threads `threadsData` {}.
- Pinterest : un pin avec l'image `cover.jpg` (pas de vidéo) — `pinterestData` {boardId "1129207375260824094", pinTitle = titre (100 car. max), pinLink "https://totagoal.com/", pinNewFormat true, isAiGenerated false}. Texte = phrase + 5 hashtags.
- X (twitter) et Bluesky (si connectés à la marque) : un seul post avec `cover.jpg` (carrousel les jours d'alternance impairs : cover + essentiel). Texte court : Bluesky 300 caractères maximum (sinon ne pas réessayer, raccourcir), X un seul post (pas de fil). `blueskyData` {postLanguages ["fr"]}, `twitterData` {tags: []}. Mêmes règles de confirmation et de ton que les autres réseaux.
- Après chaque création : relire le post avec getScheduledPosts (le media doit être passé en static.metricool.com) ; ne jamais créer deux fois le même post.

## Hashtags (importants : bien choisis, jamais copiés-collés d'une actu à l'autre)
- Choisis-les POUR CETTE ACTU, dans cet ordre : 1) le club ou la personne concernée (#OL #PSG #LeHavre #Mbappé), 2) la compétition (#Ligue1 #PremierLeague #LaLiga #SerieA #LigueDesChampions), 3) le type d'actu (#mercato pour un transfert, #entraineur ou #limogeage pour un coach, #resultat pour un score — sauf TikTok), 4) un large (#foot #football #actufoot), 5) #TotaGoal une fois sur deux.
- Hashtags réels et courants uniquement (sans espace ni tiret), écrits comme les fans les écrivent ; aucun hashtag inventé, aucun sans rapport avec l'actu.
- Nombre par réseau : Instagram 5, Facebook 3, Threads 1 à 2, LinkedIn 3, YouTube 3 dans la description + #Shorts dans le titre, TikTok 4 maximum (jamais de mot interdit, jamais #pronostic/#pari/#bet), Pinterest 5, X 2, Bluesky 2.
- Ne jamais réutiliser exactement la même série que l'actu précédente (vérifier dans posted.json, champ `hashtags` : l'enregistrer à chaque actu).

## Hébergement des fichiers
Pousser sur cette branche `news` : ajouter `news/out/AAAA-MM-JJ/...` et `news/state/posted.json` (`git add` des chemins précis, jamais `-A`). URL publique : `https://raw.githubusercontent.com/jeremyquilletech-dotcom/totagoal-media/news/news/out/AAAA-MM-JJ/<id>/<fichier>`.
Nettoyage : supprimer uniquement les dossiers `news/out/<date>` de plus de 3 jours (`git rm -r news/out/<date>`). Push normal ; si la branche a avancé, `git pull --rebase` puis repousser. Ne jamais toucher à la branche `main` de ce dépôt.
