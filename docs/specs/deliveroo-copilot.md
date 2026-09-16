Auteur : PM Deliveroo — (à confirmer, placeholder)
Date de dernière mise à jour : 16 septembre 2026
Statut : Draft
Validé par : —

# Spec : Deliveroo Copilot

## 1. Context & User Persona

**Le problème.** Le coût réel pour l'utilisateur n'est ni le prix ni le délai de livraison, mais la charge cognitive de la décision : ouvrir l'app, re-parcourir des centaines de restaurants, re-saisir une commande déjà passée des dizaines de fois. Cette friction ralentit la conversion sur les moments de commande récurrents (même restaurant, même heure, même jour de semaine) et allonge inutilement le temps entre "j'ai envie de commander" et "commande validée".

**Personas ciblés :**

- **Utilisateur récurrent solo** : commande 2 à 5 fois/semaine, souvent les mêmes restaurants/plats aux mêmes horaires (ex. déjeuner de bureau, dîner en semaine).
- **Utilisateur occasionnel en contexte groupe** : coordonne un déjeuner d'équipe au bureau/coworking, aujourd'hui via un lien partagé manuellement sur Slack/WhatsApp.

**KPIs visés** (proposition — à valider, cf. [Points à trancher](#points-à-trancher-avec-léquipe)) :

- Taux de conversion des suggestions proactives (tap → commande validée).
- Réduction du temps moyen entre ouverture de l'app et validation du panier.
- Fréquence de commande des utilisateurs exposés vs. groupe témoin.

## 2. Out of Scope / Non-Goals

- Pas de mécanisme de réduction dynamique liée à une pré-commande ou à une fenêtre de livraison planifiée (type "commande à terme").
- Pas de notification exposant à un utilisateur que d'autres personnes précises de son immeuble/quartier sont en train de commander (risque vie privée) — aucun signal agrégé de densité n'est utilisé côté utilisateur dans cette spec.
- Pas de débit ou de passation de commande sans confirmation explicite de l'utilisateur, quel que soit le canal (solo, conversationnel, groupe).
- Pas de changement du fonctionnement de paiement existant (moyens de paiement, split de facture) — le Copilot compose le panier, il ne modifie pas le module de paiement.
- La coordination groupe (Release 3) ne couvre pas la création d'une "table" persistante réutilisable dans le temps — chaque panier groupe est ponctuel.

## 3. User Stories

1. En tant qu'utilisateur récurrent, quand j'ouvre l'app à l'heure où je commande habituellement, je veux recevoir une suggestion pré-remplie basée sur ma dernière commande similaire, afin de valider ma commande en un minimum d'étapes.
2. En tant qu'utilisateur, quand je ne sais pas précisément quoi commander, je veux pouvoir décrire mon envie en langage naturel (ex. "quelque chose de léger et épicé"), afin de recevoir 2-3 propositions pertinentes sans parcourir tout le catalogue.
3. En tant qu'utilisateur en contexte groupe, quand je lance ou rejoins une coordination de déjeuner d'équipe, je veux que le Copilot me propose ma part du panier en fonction de mes habitudes, afin de ne pas avoir à ressaisir mon plat depuis zéro.
4. En tant qu'utilisateur, je veux toujours voir et confirmer explicitement le contenu et le prix de ma commande avant tout débit, afin de garder le contrôle sur mes achats.
5. En tant qu'agent support, quand un utilisateur me contacte pour une commande générée via le Copilot, je veux accéder à l'historique de ce qui a été suggéré et confirmé, afin de traiter les litiges (mauvais plat, erreur de prix, allergène) sans ambiguïté.
6. En tant qu'équipe produit, je veux pouvoir désactiver le Copilot à tout moment via un feature flag global ou par palier, afin de limiter l'impact en cas de dérive du modèle (suggestions erronées, coût d'inférence anormal).

## 4. Releases

**Release 1 — Suggestion proactive solo (MVP)**
Suggestion push/in-app au moment habituel de commande, basée sur la dernière commande similaire de l'utilisateur (même jour de semaine, même créneau horaire). Un tap reconstitue le panier identique et amène directement à l'étape de paiement existante.

**Release 2 — Commande conversationnelle libre**
Champ de saisie en langage naturel (texte, éventuellement vocal en option ultérieure) permettant de décrire une envie floue. Le Copilot retourne 2-3 propositions concrètes parmi les restaurants livrables, en tenant compte des préférences connues (allergies déclarées, plats évités, budget habituel).

**Release 3 — Coordination groupe (bureau/coworking)**
Le Copilot se branche sur un message de coordination existant (intégration Slack/Teams en priorité) et propose un panier pré-rempli par participant à partir de ses habitudes. Chaque personne confirme/ajuste sa part ; paiement individuel, aucune évolution du split de paiement existant.

## 5. Acceptance Criteria

### Release 1 — Suggestion proactive

- GIVEN un utilisateur a commandé le même plat/restaurant au moins 2 fois le même jour de semaine et créneau horaire, WHEN ce créneau arrive à nouveau, THEN une suggestion est affichée avec le restaurant, le(s) plat(s) et le prix identiques à la dernière commande.
- GIVEN une suggestion est affichée, WHEN l'utilisateur tape dessus, THEN le panier est reconstitué à l'identique et l'utilisateur est amené directement à l'étape de paiement existante, sans navigation intermédiaire.
- GIVEN une suggestion est affichée, WHEN le restaurant suggéré est fermé ou le plat n'est plus disponible, THEN la suggestion n'est pas envoyée ou est adaptée avec l'alternative disponible la plus proche du plat habituel.
- GIVEN un utilisateur n'a pas d'historique de commande, WHEN son créneau habituel arriverait, THEN aucune suggestion proactive n'est déclenchée (pas de génération sans donnée réelle).

### Release 2 — Commande conversationnelle

- GIVEN un utilisateur saisit une envie en langage naturel, WHEN la requête est envoyée, THEN 2 à 3 propositions concrètes et livrables sont retournées en moins de [délai à définir — cf. Points à trancher].
- GIVEN l'utilisateur a une allergie déclarée dans son profil, WHEN une proposition est générée, THEN aucun plat contenant l'allergène déclaré n'est proposé.
- GIVEN la requête est trop ambiguë ou ne correspond à aucun résultat pertinent, WHEN le Copilot ne peut pas générer de proposition fiable, THEN un message explicite invite à préciser ou à naviguer manuellement, plutôt que d'afficher une suggestion peu pertinente.

### Release 3 — Coordination groupe

- GIVEN un message de coordination de déjeuner est détecté/lancé dans un canal connecté, WHEN un participant rejoint, THEN le Copilot lui propose sa part de panier habituelle, modifiable avant confirmation.
- GIVEN un participant confirme sa part, WHEN il valide, THEN son paiement individuel est déclenché séparément, sans transfert entre participants.
- GIVEN un participant ne confirme pas sa part avant la clôture du panier groupe, WHEN la commande est envoyée, THEN il n'est pas inclus dans la commande finale.

## 6. Management Rules

- Le Copilot n'utilise que l'historique de commande de l'utilisateur concerné — aucune donnée agrégée ou comportementale d'autres utilisateurs n'est utilisée côté suggestion solo.
- Aucun débit n'est déclenché sans confirmation explicite (tap) de l'utilisateur sur le contenu final et le prix de la commande.
- Fréquence maximale de notifications proactives par utilisateur : [à définir — cf. Points à trancher], avec réduction automatique de fréquence si l'utilisateur ignore plusieurs suggestions consécutives.
- Les allergies et restrictions déclarées dans le profil utilisateur sont des contraintes strictes, jamais des préférences pondérées, dans la génération de propositions (Release 2).
- Le contenu généré par le Copilot (suggestions, texte de proposition) est marqué visuellement comme généré/assisté par IA.

### Points spécifiques IA générative

- **Modération** : les propositions du Copilot ne sont jamais montrées à d'autres utilisateurs que celui qui les a demandées — pas de contenu généré partagé publiquement. Comportement de repli si le modèle ne peut générer de réponse fiable : renvoyer vers la navigation manuelle plutôt qu'une suggestion approximative (cf. AC Release 2).
- **Minimisation des données** : seules les données strictement nécessaires (historique de commande propre, allergies/préférences déclarées, requête en cours) sont transmises au modèle ; pas de transmission de données d'autres utilisateurs.
- **Coût et limites** : plafond de requêtes conversationnelles par utilisateur et par jour — [valeur à définir]. Kill switch / feature flag global permettant de désactiver le Copilot indépendamment par release (1, 2, 3).
- **Transparence** : mention visible "Suggestion générée par IA" sur toute suggestion ou proposition issue du Copilot.

## 7. Edge Cases

- Si le plat suggéré a changé de prix depuis la dernière commande, alors le nouveau prix est affiché clairement avant confirmation (jamais le prix de la dernière commande par défaut).
- Si l'utilisateur ignore la suggestion proactive plusieurs fois de suite, alors la fréquence des suggestions diminue automatiquement pour cet utilisateur.
- Si le restaurant habituel n'est plus partenaire Deliveroo, alors aucune suggestion basée sur ce restaurant n'est générée, sans message d'erreur intrusif.
- Si une requête conversationnelle contient des termes ambigus pouvant correspondre à plusieurs intentions opposées (ex. "léger" pouvant signifier faible calorie ou petite portion), alors le Copilot privilégie la proposition la plus large / demande une clarification plutôt que de trancher silencieusement.
- Si, en contexte groupe, un participant modifie sa part après l'avoir confirmée mais avant la clôture du panier, alors la modification est autorisée et répercutée sur son paiement individuel.
- Si le canal de coordination (Slack/Teams) n'est pas connecté ou autorisé par l'utilisateur, alors le Copilot ne peut pas proposer la fonctionnalité groupe et redirige vers la création manuelle actuelle.

## 8. Designs & Workflow Diagrams

Point ouvert — aucun lien de prototype ou de design n'a été fourni dans la source de ce document. À ajouter avant passage en revue.

## 9. Tracking

| Event | Trigger | Propriétés clés | Métrique de succès servie |
|---|---|---|---|
| `copilot_suggestion_shown` | Une suggestion proactive est affichée à l'utilisateur | `user_id`, `restaurant_id`, `créneau_habituel`, `release` | Taux d'exposition / base pour le taux de conversion |
| `copilot_suggestion_confirmed` | L'utilisateur valide une suggestion proactive | `user_id`, `temps_écoulé_depuis_affichage`, `montant` | Taux de conversion des suggestions, temps de décision |
| `copilot_conversational_query_sent` | L'utilisateur envoie une requête en langage naturel | `user_id`, `longueur_requête`, `nb_propositions_retournées` | Taux d'usage de la recherche conversationnelle |
| `copilot_group_cart_confirmed` | Un participant confirme sa part dans un panier groupe | `user_id`, `group_session_id`, `montant` | Adoption de la coordination groupe (Release 3) |

## 10. Rollout Plan

- **Alpha** : employés Deliveroo uniquement, feature flag activé sur un périmètre restreint (ex. une ville pilote), Release 1 seule. Objectif : valider la pertinence des suggestions et l'absence de bug critique sur la reconstitution de panier.
- **Beta** : sous-ensemble d'utilisateurs récurrents opt-in, pourcentage de rollout à définir, Releases 1 et 2. Critère de passage à Stable : taux de conversion des suggestions et taux d'erreur du conversationnel au-dessus d'un seuil à définir avec l'équipe data.
- **Stable** : rollout complet avec option de désactivation dans les paramètres utilisateur, Releases 1, 2 puis 3 séquencées.

## 11. Testing Plan

- Vérifier que la reconstitution de panier (Release 1) reproduit exactement plats, options et prix à jour, sans navigation manuelle intermédiaire.
- Vérifier le respect strict des allergies/restrictions déclarées dans toute proposition conversationnelle (Release 2) — test systématique, flow critique business et sécurité alimentaire.
- Vérifier le bon déclenchement et la bonne structure des 4 events de tracking sur chaque flow (suggestion, conversationnel, groupe).
- Tester le comportement de repli quand le modèle ne peut générer de proposition fiable (pas de suggestion approximative affichée).
- Tester la désactivation via feature flag à chaud, sans commande en cours affectée.
- Tester le flow groupe de bout en bout : confirmation partielle, modification avant clôture, non-inclusion des participants non confirmés.

## Points à trancher avec l'équipe

- KPIs cibles précis et seuils de succès par release (taux de conversion, temps de décision).
- Délai maximal acceptable de réponse pour la recherche conversationnelle (Release 2).
- Fréquence maximale de notifications proactives et règle exacte de dégressivité en cas d'ignorance répétée.
- Plafond de requêtes conversationnelles par utilisateur/jour et modalités du kill switch.
- Lien vers prototype/design à intégrer en section 8.
- Canaux de coordination groupe à prioriser au-delà de Slack/Teams (WhatsApp notamment, mentionné dans les échanges initiaux mais technique d'intégration différente).
- Politique de conservation des données d'historique utilisées par le modèle (durée, droit à l'oubli).
