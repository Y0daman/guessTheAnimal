# Guess The Animal - Game Idea

## Overview

Guess The Animal is a child-friendly multiplayer game inspired by Guess Who.

One player receives a secret animal. The other players must discover which animal it is by asking predefined questions and making guesses. The game focuses on colorful animal cards, simple icons, and intuitive gameplay suitable for children.

---

## Core Gameplay

### Round Flow

1. Players join a room.
2. Animal packs owned by all players are combined.
3. A secret animal is selected.
4. One player becomes the answer holder.
5. Other players ask questions using visual buttons.
6. The answer holder responds:
   - Yes
   - No
   - Sometimes (optional)
7. Animal cards are automatically filtered.
8. Players can guess an animal by clicking a card.
9. Points are awarded based on efficiency.
10. A new round starts and the answer holder rotates.

---

## Animal Cards

Each animal is represented by:

- Friendly illustration
- Name
- Metadata attributes

Example:

```json
{
  "id": "lion",
  "name": "Lion",
  "attributes": {
    "legs": 4,
    "canSwim": false,
    "hasWings": false,
    "hasFur": true,
    "laysEggs": false,
    "habitat": ["land"],
    "colors": ["yellow", "brown"]
  }
}
```

---

## Question System

Questions are presented as large child-friendly buttons with icons.

Examples:

- Has wings?
- Can fly?
- Can swim?
- Has fur?
- Has scales?
- Has a shell?
- Lays eggs?
- Lives in water?
- Lives on land?
- Number of legs:
  - 0
  - 2
  - 4
  - 6
  - 8
  - 10+

Optional:

- Is it dangerous?
- Is it big?
- Is it small?

---

## Automatic Filtering

Players always see all available animal cards.

After each answer:

- Matching animals remain highlighted.
- Non-matching animals become grayed out.

Example:

Question:
"Has wings?"

Answer:
"Yes"

All animals without wings become inactive.

This gives children a visual understanding of the deduction process.

---

## Guessing

Players can guess at any time by clicking an animal card.

### Correct Guess

- Round ends.
- Points awarded.
- Celebration animation.

### Incorrect Guess

- Animal becomes grayed out.
- Small point penalty.
- Player continues playing.

No harsh "wrong answer" feedback should be used.

---

## Scoring

### Internal Score

Start at 100 points.

```text
Score = 100
        - 10 * clues_used
        - 20 * wrong_guesses
```

Minimum score when solving:

```text
10 points
```

### Child-Friendly Rating

Convert score into stars.

| Score | Stars |
|---------|---------|
| 80-100 | 3 |
| 40-79 | 2 |
| 1-39 | 1 |

---

## Multiplayer Rooms

### Join Methods

- Room code
- Invite link
- Share through social apps

### Room Size

Initial MVP:

- 2 to 6 players

---

## Shared Animal Packs

Every player owns animal packs.

Examples:

- Free Animals
- Farm Animals
- Land Animals
- Water Animals
- Birds
- Insects
- Dinosaurs

Room availability is calculated as:

```text
Available Packs =
Union of all player-owned packs
```

Example:

Player A:
- Land Animals

Player B:
- Water Animals

Room gets:

- Land Animals
- Water Animals

All players can use all animals available in the room during that session.

---

## Child Safety

### MVP

No free chat.

Use:

- Room codes
- Invite links
- Preset avatars
- Preset player names

Example:

- Blue Tiger
- Green Panda
- Red Dolphin

---

## User Interface

### Top Area

- Current round
- Current player
- Stars
- Remaining animals count

### Middle Area

Animal card grid.

Possible animals:
- Full color

Eliminated animals:
- Grayed out

### Bottom Area

Question buttons with icons.

---

## Monetization

### Free Version

- 50 animals

### Paid Packs

Examples:

- Farm Pack
- Ocean Pack
- Bird Pack
- Dinosaur Pack

### Optional

Rewarded advertisements:

Watch ads to:

- Unlock temporary pack access
- Unlock a random animal
- Earn cosmetic rewards

Avoid intrusive banner ads during gameplay.

---

## Technical Architecture

### Mobile

- iOS
- Android

Potential frameworks:

- Flutter
- React Native
- Native

### Backend

AWS

Services:

- API Gateway (WebSocket)
- AWS Lambda
- DynamoDB
- S3
- CloudFront
- Cognito

---

## MVP Roadmap

### Version 0.1

Offline local play.

Features:

- 50 animals
- Question buttons
- Automatic filtering
- Guess by clicking cards
- Scoring

### Version 0.2

Online multiplayer.

Features:

- Rooms
- Invite links
- Real-time updates

### Version 0.3

Animal packs.

Features:

- Unlock packs
- Shared room pack system

### Version 0.4

Live operations.

Features:

- Statistics
- Achievements
- Seasonal packs
- Rewarded ads

---

## Long-Term Vision

A safe and educational multiplayer animal guessing game where children learn animal characteristics through visual deduction, teamwork, and friendly competition.
