# Plan d'implémentation — Deliveroo Copilot (prototype / MVP)

Spec de référence : [docs/specs/deliveroo-copilot.md](docs/specs/deliveroo-copilot.md)

> **Important : ceci est un prototype de démo, pas une implémentation de production.**
> L'objectif est de montrer le comportement des 3 releases de la spec, pas de les construire fidèlement. Chaque étape ci-dessous est volontairement légère : données mockées, "IA" simulée côté client, pas de backend, pas de vraie intégration Slack/Teams, un seul utilisateur fictif. Voir la section [Simplifications assumées](#simplifications-assumées-vs-spec-complète) pour le détail des écarts avec la spec.

## Principes directeurs

- Tout le code du Copilot vit dans `src/copilot/` (logique/données) et `src/components/Copilot*.jsx` (UI), séparé du reste de l'app existante.
- On réutilise l'app existante telle quelle : `addToCart` / `setShowPayment` dans [src/App.jsx](src/App.jsx), la liste `dishes` dans [src/data.js](src/data.js), les styles de [src/App.css](src/App.css).
- Pas de vrai appel LLM, pas de vraie base de données, pas de vrai push : tout est simulé avec des données statiques en mémoire.
- Toute suggestion générée par le Copilot affiche un badge "✨ Généré par IA" (transparence, cf. spec section 6).
- Le kill switch de la spec est simulé par un simple toggle local (pas de vrai feature flag serveur).

## Phase 0 — Fondations partagées

Nécessaires aux 3 releases, à faire en premier.

- [x] `src/copilot/mockHistory.js` — historique de commandes fictif (2-3 entrées associées à un jour/créneau), pour que la Release 1 soit démontrable à tout moment sans dépendre de l'heure réelle.
- [x] `src/copilot/mockUser.js` — profil utilisateur mocké (nom, allergies déclarées, préférences).
- [x] Extension de `dishes` dans [src/data.js](src/data.js) : ajout de champs additifs `tags` (ex. `spicy`, `light`) et `allergens` par plat — n'affecte pas `Menu.jsx`/`Cart.jsx` existants.
- [x] `src/copilot/tracking.js` — fonction `trackEvent(name, props)` qui fait un `console.log` structuré des 4 events de la spec (section 9). Pas de vrai envoi analytics.
- [x] `src/copilot/flagsContext.js` + `src/copilot/CopilotFlagsProvider.jsx` + `src/components/CopilotSettings.jsx` — toggle on/off pour Release 1 / 2 / 3, pour démontrer le kill switch en live pendant la démo.
- [x] `src/components/AiBadge.jsx` — badge réutilisable "✨ Généré par IA".

## Release 1 — Suggestion proactive (MVP)

- [x] `src/components/CopilotSuggestionBanner.jsx` — affiché en haut de `App.jsx` si `mockHistory` contient une commande correspondant au "créneau habituel" simulé.
- [x] Comportement au tap : reconstitue le panier via `addToCart` existant, puis ouvre directement `PaymentModal` (`setShowPayment(true)`) sans navigation intermédiaire.
- [x] Cas limites : pas d'historique → rien n'est affiché ; plat marqué "indisponible" (flag mocké) → message de repli au lieu d'une suggestion cassée.
- [x] Tracking `copilot_suggestion_shown` à l'affichage, `copilot_suggestion_confirmed` au tap.

## Release 2 — Commande conversationnelle

- [x] `src/components/CopilotChatInput.jsx` — champ texte + bouton, intégré près du `Menu`.
- [x] Matching 100% côté client basé sur `tags` / `category` / `price` des plats (pas d'appel LLM réel) → retourne 2-3 propositions.
- [x] Filtrage strict des allergènes déclarés dans `mockUser.js` (contrainte stricte, jamais pondérée — cf. spec section 6).
- [x] Message de repli explicite si aucune proposition pertinente n'est trouvée (pas de suggestion approximative).
- [x] Chaque proposition affiche `AiBadge` ; un clic ajoute le plat au panier via `addToCart`.
- [x] Tracking `copilot_conversational_query_sent`.

## Release 3 — Coordination groupe (simulation)

- [x] `src/components/CopilotGroupOrder.jsx` — bouton "Lancer un déjeuner d'équipe" → vue avec 2-3 participants fictifs (nom + leur plat "habituel" tiré de `mockHistory`).
- [x] Bannière statique "Connecté à #team-lunch (démo)" pour matérialiser l'intégration Slack/Teams sans l'implémenter réellement.
- [x] L'utilisateur ajuste sa propre part via un sélecteur de plats ; les autres participants restent en lecture seule avec un bouton "Confirmer".
- [x] "Clôturer le panier" → seuls les participants confirmés apparaissent dans le récapitulatif final ; chacun paie sa part séparément (pas de split de paiement).
- [x] Tracking `copilot_group_cart_confirmed`.

## Checklist séquentielle (ordre d'implémentation recommandé)

```
- [x] 1. Mock data & flags (mockHistory.js, mockUser.js, flagsContext.js, tags/allergens dans data.js)
- [x] 2. AiBadge + tracking.js
- [x] 3. Release 1 — CopilotSuggestionBanner + branchement App.jsx
- [x] 4. Release 2 — CopilotChatInput + matching + filtrage allergènes
- [x] 5. Release 3 — CopilotGroupOrder (participants mockés)
- [x] 6. CopilotSettings (kill switch visuel pour la démo)
- [x] 7. Passe de style (cohérent avec App.css existant) + relecture badge IA partout
```

**Statut : implémenté et vérifié manuellement dans le navigateur (`npm run dev`) — les 3 releases, le kill switch et le cas "plat indisponible" fonctionnent comme décrit ci-dessus.**

## Simplifications assumées vs spec complète

| Élément de la spec | Simplification pour le prototype |
|---|---|
| Modèle IA générative | Matching par règles/tags côté client, aucun appel API réel |
| Intégration Slack/Teams (Release 3) | Bannière statique simulant la connexion, aucune vraie intégration |
| Notifications push proactives | Bannière affichée au chargement de l'app, pas de vrai push |
| Système de comptes / historique persistant | Un seul utilisateur mocké, historique en mémoire (`mockHistory.js`) |
| Feature flag serveur / kill switch | Toggle local dans `CopilotSettings.jsx`, pas de config serveur |
| Déclenchement "créneau habituel" | Simulé au chargement de la page, pas de vrai scheduler temps réel |
| Fréquence de notification / dégressivité | Compteur en mémoire (`dismissCount`) : la bannière s'arrête après 2 refus dans la même session, pas de persistance entre sessions |
| Plafond de requêtes / coût d'inférence | Non applicable (pas de vrai appel modèle) |

## Vérification

Pas de suite de tests automatisés dans ce repo (`package.json` ne contient que `lint`, `dev`, `build`, `preview`). Vérification à chaque étape :

- `npm run lint`
- `npm run dev` puis parcours manuel dans le navigateur pour chaque release (bannière de suggestion au chargement, recherche conversationnelle, flow groupe), en confirmant que les badges IA et le kill switch (`CopilotSettings`) sont bien visibles et fonctionnels.
